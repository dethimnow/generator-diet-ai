import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDietWithOpenAI } from "@/lib/ai/generate-diet";
import { startOfCalendarWeekWarsaw } from "@/lib/utils";

/** Na Hobby Vercel nadal obowiązuje limit planu (np. 10 s); na Pro można wydłużyć generowanie. */
export const maxDuration = 60;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(label)), ms)
    ),
  ]);
}

const bodySchema = z.object({
  goal: z.enum(["Schudnąć", "Przytyć", "Utrzymać wagę"]),
  dietType: z.enum([
    "Standardowa",
    "Wegetariańska",
    "Wegańska",
    "Keto",
    "Low-carb",
    "Inne",
  ]),
  weightKg: z.number().min(30).max(250),
  heightCm: z.number().min(120).max(230),
  age: z.number().min(14).max(100),
  gender: z.enum(["Kobieta", "Mężczyzna", "Inna"]),
  cookTimeMin: z.union([z.literal(10), z.literal(20), z.literal(30)]),
  weeklyBudgetPln: z.number().min(50).max(2000),
  store: z.enum(["Biedronka", "Lidl", "Żabka"]),
  pantryItems: z.string().max(2000).optional().default(""),
  fridgeOnly: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Niepoprawne dane formularza", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let user: { id: string } | null = null;
    try {
      const {
        data: { user: u },
      } = await withTimeout(supabase.auth.getUser(), 12_000, "AUTH_GETUSER_TIMEOUT");
      user = u;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "AUTH_GETUSER_TIMEOUT") {
        console.error("diet/generate: getUser timeout");
        return NextResponse.json(
          {
            error:
              "Timeout weryfikacji sesji. Odśwież stronę, zaloguj się ponownie lub wyłącz blokowanie ciasteczek dla tej domeny.",
            code: "AUTH_TIMEOUT",
          },
          { status: 504 }
        );
      }
      throw e;
    }
    if (!user) {
      return NextResponse.json(
        { error: "Zaloguj się, aby wygenerować dietę." },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, premium_until")
      .eq("id", user.id)
      .single();

    const now = new Date();
    const premiumActive =
      profile?.is_premium === true ||
      (!!profile?.premium_until && new Date(profile.premium_until) > now);

    if (!premiumActive) {
      const weekStart = startOfCalendarWeekWarsaw(now);
      const { count, error: countError } = await supabase
        .from("diet_plans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString())
        .or("status.eq.ready,status.eq.pending");

      if (countError) {
        console.error(countError);
        return NextResponse.json({ error: "Błąd limitu" }, { status: 500 });
      }
      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          {
            error:
              "Wykorzystałeś darmową dietę w tym tygodniu. Włącz Premium lub spróbuj od poniedziałku.",
            code: "WEEKLY_LIMIT",
          },
          { status: 429 }
        );
      }
    }

    const b = parsed.data;

    const title = `Plan ${b.dietType} — ${new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeZone: "Europe/Warsaw",
    }).format(now)}`;

    const { data: inserted, error: insertError } = await supabase
      .from("diet_plans")
      .insert({
        user_id: user.id,
        title,
        status: "pending",
        payload: null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Nie udało się zapisać diety" }, { status: 500 });
    }

    await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        goal: b.goal,
        diet_type: b.dietType,
        weight_kg: b.weightKg,
        height_cm: b.heightCm,
        age: b.age,
        gender: b.gender,
        cook_time_min: b.cookTimeMin,
        weekly_budget_pln: b.weeklyBudgetPln,
        preferred_store: b.store,
        pantry_items: b.pantryItems,
        fridge_only: b.fridgeOnly,
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    );

    const planId = inserted.id;
    const userId = user.id;

    after(async () => {
      let db;
      try {
        db = createAdminClient();
      } catch {
        try {
          db = await createClient();
        } catch (e) {
          console.error("diet/generate after(): brak klienta DB", e);
          return;
        }
      }
      try {
        const payload = await generateDietWithOpenAI({
          goal: b.goal,
          dietType: b.dietType,
          weightKg: b.weightKg,
          heightCm: b.heightCm,
          age: b.age,
          gender: b.gender,
          cookTimeMin: b.cookTimeMin,
          weeklyBudgetPln: b.weeklyBudgetPln,
          store: b.store,
          pantryItems: b.pantryItems,
          fridgeOnly: b.fridgeOnly,
        });
        const { error: upErr } = await db
          .from("diet_plans")
          .update({
            status: "ready",
            payload: payload as unknown as Record<string, unknown>,
            generation_error: null,
          })
          .eq("id", planId)
          .eq("user_id", userId);
        if (upErr) {
          console.error("diet/generate after update", upErr);
          await db
            .from("diet_plans")
            .update({
              status: "failed",
              generation_error: upErr.message || "Błąd zapisu planu",
            })
            .eq("id", planId)
            .eq("user_id", userId);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Błąd generowania";
        console.error("diet/generate after()", planId, e);
        await db
          .from("diet_plans")
          .update({
            status: "failed",
            generation_error: msg,
          })
          .eq("id", planId)
          .eq("user_id", userId);
      }
    });

    return NextResponse.json({ id: planId, status: "pending" as const }, { status: 202 });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Błąd generowania";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
