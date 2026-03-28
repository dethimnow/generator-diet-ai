import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import OpenAI from "https://esm.sh/openai@4.77.3";
import { z } from "https://esm.sh/zod@3.24.1";

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WizardInput = {
  goal: string;
  dietType: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  cookTimeMin: number;
  weeklyBudgetPln: number;
  store: string;
  pantryItems: string;
  fridgeOnly: boolean;
};

const ingredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
});

const mealSchema = z.object({
  name: z.string(),
  prepTimeMinutes: z.number().int().min(1),
  steps: z.array(z.string()).min(1),
  ingredients: z.array(ingredientSchema).min(1),
});

const daySchema = z.object({
  day: z.number().int().min(1).max(7),
  meals: z.array(mealSchema).min(3),
});

const shoppingItemSchema = z.object({
  item: z.string(),
  amount: z.string(),
});

const shoppingListSchema = z
  .object({
    Biedronka: z.array(shoppingItemSchema).optional(),
    Lidl: z.array(shoppingItemSchema).optional(),
    Żabka: z.array(shoppingItemSchema).optional(),
  })
  .transform((s) => ({
    Biedronka: s.Biedronka ?? [],
    Lidl: s.Lidl ?? [],
    Żabka: s.Żabka ?? [],
  }));

const dietPayloadSchema = z.object({
  summary: z.string().optional(),
  days: z.array(daySchema).length(7),
  shoppingList: shoppingListSchema,
});

function buildDietSystemPrompt(): string {
  return `Jesteś doświadczonym polskim dietetykiem klinicznym i ekspertem od taniego gotowania (smart shopping).

Twoje zadanie: zaprojektować 7-dniowy jadłospis dopasowany do danych użytkownika.

Wytyczne merytoryczne:
- Używaj produktów realnie dostępnych w polskich sieciach: Biedronka, Lidl, Żabka (i typowe produkty „uniwersalne”).
- Szacunkowy koszt tygodnia musi mieścić się w podanym budżecie PLN (orientacyjnie, przy cenach dyskontów).
- Każdy posiłek musi dać się przygotować w ≤ podanej liczbie minut (średnio prosty sprzęt kuchenny).
- Nazwy dań i składniki po polsku. W składnikach podawaj GRAMY oraz miary domowe tam gdzie to naturalne (np. „2 łyżki”, „szklanka”, „łyżeczka”).
- Dopasuj kalorie i makro do celu (redukcja / masa / zdrowe utrzymanie) i typu diety.
- 7 dni, dziennie minimum 4 posiłki (śniadanie, II śniadanie, obiad, kolacja). Możesz dodać lekką przekąskę jeśli pasuje.
- Kroki przepisów: krótkie, numerowane, wykonalne dla osoby spieszącej się.

Lista zakupów w JSON: nadal grupuj pod kluczami dokładnie "Biedronka", "Lidl", "Żabka" (z polską Ż). Bez duplikatów w sekcji; scal podobne pozycje.

WAŻNE: Odpowiedź dla aplikacji musi być JEDNYM poprawnym obiektem JSON (bez markdown fencing, bez komentarzy), zgodnym ze schematem z wiadomości użytkownika. Treść edukacyjna „jak w markdown” przenieś do pól tekstowych w JSON (np. kroki jako pełne zdania z miarami).`;
}

function buildDietUserPrompt(input: WizardInput): string {
  const fridge = input.fridgeOnly
    ? "Użytkownik ma już pełną lodówkę / chce maksymalnie wykorzystać to, co ma: "
    : "Produkty które użytkownik już ma (priorytet w przepisach): ";
  return JSON.stringify(
    {
      kontekst: {
        cel: input.goal,
        typDiety: input.dietType,
        wagaKg: input.weightKg,
        wzrostCm: input.heightCm,
        wiek: input.age,
        plec: input.gender,
        maxCzasGotowaniaMin: input.cookTimeMin,
        budzetTygodniowyPLN: input.weeklyBudgetPln,
        preferowanySklep: input.store,
        produkty: fridge + (input.pantryItems || "brak"),
      },
      outputJsonSchema: {
        summary: "1–2 zdania podsumowania planu",
        days: [
          {
            day: 1,
            meals: [
              {
                name: "np. Owsianka z borówkami",
                prepTimeMinutes: 10,
                steps: ["krok po kroku z miarami"],
                ingredients: [{ name: "płatki owsiane", amount: "50 g (ok. 4 łyżki)" }],
              },
            ],
          },
        ],
        shoppingList: {
          Biedronka: [{ item: "nazwa", amount: "ilość" }],
          Lidl: [],
          Żabka: [],
        },
      },
    },
    null,
    2
  );
}

function normalizeDietJson(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const o = data as Record<string, unknown>;
  const sl = o.shoppingList;
  if (sl && typeof sl === "object") {
    const s = { ...(sl as Record<string, unknown>) };
    const aliases: [string, string][] = [
      ["Zabka", "Żabka"],
      ["zabka", "Żabka"],
      ["Biedronka", "Biedronka"],
      ["biedronka", "Biedronka"],
      ["Lidl", "Lidl"],
      ["lidl", "Lidl"],
    ];
    for (const [from, to] of aliases) {
      if (s[from] !== undefined && s[to] === undefined) {
        s[to] = s[from];
        delete s[from];
      }
    }
    o.shoppingList = s;
  }
  return o;
}

function coercePrepMinutes(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(1, Math.round(v));
  if (typeof v === "string") {
    const n = parseInt(v.replace(/\D/g, "") || "0", 10);
    if (n > 0) return Math.min(180, Math.max(1, n));
  }
  return 15;
}

function repairIngredient(raw: unknown): { name: string; amount: string } | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t ? { name: t, amount: "—" } : null;
  }
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const name = String(o.name ?? o.product ?? o.nazwa ?? o.item ?? "").trim();
  const amount = String(o.amount ?? o.quantity ?? o.ilość ?? o.qty ?? "").trim();
  if (!name) return null;
  return { name, amount: amount || "—" };
}

function repairShoppingRow(raw: unknown): { item: string; amount: string } | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t ? { item: t, amount: "—" } : null;
  }
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const item = String(o.item ?? o.name ?? o.produkt ?? "").trim();
  const amount = String(o.amount ?? o.ilość ?? "").trim();
  if (!item) return null;
  return { item, amount: amount || "—" };
}

function repairMeal(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const name =
    typeof m.name === "string" && m.name.trim() ? m.name.trim() : "Posiłek";

  let steps: string[] = [];
  if (Array.isArray(m.steps)) {
    steps = m.steps.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof m.steps === "string" && m.steps.trim()) {
    steps = m.steps
      .split(/\n+|;(?=\s)/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (steps.length === 0) steps = ["Przygotuj składniki i ugotuj według nazwy dania."];

  let ingredients: { name: string; amount: string }[] = [];
  if (Array.isArray(m.ingredients)) {
    ingredients = m.ingredients.map(repairIngredient).filter((x): x is NonNullable<typeof x> => x !== null);
  }
  if (ingredients.length === 0) {
    ingredients = [{ name: "składniki wg przepisu", amount: "dopasuj porcję" }];
  }

  return {
    name,
    prepTimeMinutes: coercePrepMinutes(m.prepTimeMinutes),
    steps,
    ingredients,
  };
}

const placeholderMeal = (): Record<string, unknown> => ({
  name: "Lekka przekąska",
  prepTimeMinutes: 5,
  steps: ["Przygotuj prostą przekąskę (jogurt, owoc lub warzywo)."],
  ingredients: [{ name: "jogurt naturalny lub owoc", amount: "1 porcja" }],
});

/** Ujednolica typowe błędy JSON z LLM zanim wejdzie Zod. */
function repairDietJsonForValidation(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const o = { ...(data as Record<string, unknown>) };

  if (typeof o.summary !== "string") delete o.summary;

  let daysIn = o.days;
  if (!Array.isArray(daysIn)) return data;

  const byDay = new Map<number, Record<string, unknown>>();
  for (const d of daysIn) {
    if (!d || typeof d !== "object") continue;
    const dayRec = d as Record<string, unknown>;
    const dn = typeof dayRec.day === "number" ? dayRec.day : Number(dayRec.day);
    if (!Number.isInteger(dn) || dn < 1 || dn > 7) continue;
    byDay.set(dn, dayRec);
  }

  const outDays: Record<string, unknown>[] = [];
  for (let i = 1; i <= 7; i++) {
    let dayObj = byDay.get(i);
    if (!dayObj) {
      const prev = outDays[outDays.length - 1];
      dayObj = prev
        ? (JSON.parse(JSON.stringify(prev)) as Record<string, unknown>)
        : { day: i, meals: [] };
    }
    dayObj.day = i;

    let mealsRaw = dayObj.meals;
    if (!Array.isArray(mealsRaw)) mealsRaw = [];
    let meals = mealsRaw.map(repairMeal).filter((x): x is NonNullable<typeof x> => x !== null);
    while (meals.length < 3) {
      meals.push(placeholderMeal());
    }
    dayObj.meals = meals;
    outDays.push(dayObj);
  }
  o.days = outDays;

  let sl = o.shoppingList;
  if (!sl || typeof sl !== "object") {
    o.shoppingList = { Biedronka: [], Lidl: [], Żabka: [] };
  } else {
    const s = sl as Record<string, unknown>;
    const keys = ["Biedronka", "Lidl", "Żabka"] as const;
    const next: Record<string, unknown> = { ...s };
    for (const k of keys) {
      const arr = next[k];
      if (!Array.isArray(arr)) next[k] = [];
      else next[k] = arr.map(repairShoppingRow).filter((x): x is NonNullable<typeof x> => x !== null);
    }
    o.shoppingList = next;
  }

  return o;
}

async function generateDietWithOpenAI(input: WizardInput) {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("Brak OPENAI_API_KEY (ustaw sekret w Supabase)");
  const openai = new OpenAI({ apiKey: key, maxRetries: 1, timeout: 150_000 });
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.5,
    /* Duży plan 7×4 posiłki + lista — 8192 często obcina JSON → parse/Zod pada. */
    max_tokens: 16_384,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildDietSystemPrompt() },
      {
        role: "user",
        content:
          buildDietUserPrompt(input) +
          "\n\nWygeneruj pełny plan na 7 dni (days z day 1..7). Każdy dzień musi mieć co najmniej 4 posiłki.",
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Pusta odpowiedź modelu");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model zwrócił niepoprawny JSON");
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "payload" in parsed &&
    typeof (parsed as { payload: unknown }).payload === "object"
  ) {
    parsed = (parsed as { payload: unknown }).payload;
  }

  parsed = normalizeDietJson(parsed);
  parsed = repairDietJsonForValidation(parsed);

  const result = dietPayloadSchema.safeParse(parsed);
  if (!result.success) {
    const flat = result.error.flatten();
    console.error("diet zod", flat);
    throw new Error(
      "Model zwrócił plan w nieoczekiwanym kształcie. Spróbuj ponownie za chwilę."
    );
  }
  return result.data;
}

/** Klient z uprawnieniami do zapisu planu (service role albo JWT użytkownika). */
function createDbClient(supabaseUrl: string, authHeader: string): SupabaseClient {
  /* Sekretów Edge nie można nazywać SUPABASE_* — używamy SERVICE_ROLE_KEY (JWT service_role z API). */
  const sr = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (sr) {
    return createClient(supabaseUrl, sr);
  }
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(supabaseUrl, anon, {
    global: { headers: { Authorization: authHeader } },
  });
}

async function runGenerationJob(
  supabaseUrl: string,
  authHeader: string,
  planId: string,
  userId: string,
  input: WizardInput
) {
  const db = createDbClient(supabaseUrl, authHeader);
  try {
    const payload = await generateDietWithOpenAI(input);
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
      console.error("update error", upErr);
      await db
        .from("diet_plans")
        .update({ status: "failed", generation_error: upErr.message })
        .eq("id", planId)
        .eq("user_id", userId);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Błąd generowania";
    console.error("OpenAI error", e);
    await db
      .from("diet_plans")
      .update({ status: "failed", generation_error: msg })
      .eq("id", planId)
      .eq("user_id", userId);
  }
}

function scheduleBackground(promise: Promise<void>): boolean {
  const g = globalThis as Record<string, { waitUntil?: (p: Promise<unknown>) => void } | undefined>;
  const er = g.EdgeRuntime;
  if (er?.waitUntil) {
    er.waitUntil(promise);
    return true;
  }
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Brak autoryzacji" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Nieprawidłowa sesja" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { planId } = (await req.json()) as { planId?: string };
    if (!planId || typeof planId !== "string") {
      return new Response(JSON.stringify({ error: "Brak planId" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { data: row, error: rowErr } = await supabase
      .from("diet_plans")
      .select("id, user_id, status, generation_input")
      .eq("id", planId)
      .single();

    if (rowErr || !row) {
      return new Response(JSON.stringify({ error: "Nie znaleziono planu" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (row.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Brak dostępu" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (row.status !== "pending") {
      return new Response(JSON.stringify({ error: "Plan nie oczekuje na generowanie" }), {
        status: 409,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const input = row.generation_input as WizardInput | null;
    if (!input || typeof input !== "object") {
      return new Response(JSON.stringify({ error: "Brak danych generowania (generation_input)" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const job = runGenerationJob(supabaseUrl, authHeader, planId, user.id, input);

    if (scheduleBackground(job)) {
      return new Response(JSON.stringify({ ok: true, accepted: true, planId }), {
        status: 202,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    /* Lokalnie (CLI) EdgeRuntime często nie trzyma tła — czekamy synchronicznie. */
    await job;
    const db = createDbClient(supabaseUrl, authHeader);
    const { data: after } = await db
      .from("diet_plans")
      .select("status, payload, generation_error")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (after?.status === "ready" && after.payload) {
      return new Response(JSON.stringify({ ok: true, planId, payload: after.payload }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const errMsg =
      typeof after?.generation_error === "string" && after.generation_error.trim()
        ? after.generation_error
        : "Generowanie nie powiodło się";
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Błąd serwera funkcji" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
