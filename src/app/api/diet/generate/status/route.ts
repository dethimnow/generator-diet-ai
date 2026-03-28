import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const planId = new URL(req.url).searchParams.get("planId");
  if (!planId || !uuidRe.test(planId)) {
    return NextResponse.json({ error: "Niepoprawny planId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
  }

  const { data: row, error } = await supabase
    .from("diet_plans")
    .select("status, generation_error, payload")
    .eq("id", planId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd odczytu" }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  if (row.status === "pending") {
    return NextResponse.json({ status: "pending" as const });
  }
  if (row.status === "failed") {
    return NextResponse.json({
      status: "failed" as const,
      error: row.generation_error || "Błąd generowania",
    });
  }

  return NextResponse.json({
    status: "ready" as const,
    payload: row.payload,
  });
}
