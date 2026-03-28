"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Prefs = {
  goal: string | null;
  diet_type: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: string | null;
  cook_time_min: number | null;
  weekly_budget_pln: number | null;
  preferred_store: string | null;
  pantry_items: string | null;
  fridge_only: boolean | null;
} | null;

export function PreferencesSection({ initial, userId }: { initial: Prefs; userId: string }) {
  const supabase = createClient();
  const [status, setStatus] = useState<string | null>(null);
  const [goal, setGoal] = useState(initial?.goal ?? "Utrzymać wagę");
  const [dietType, setDietType] = useState(initial?.diet_type ?? "Standardowa");
  const [weightKg, setWeightKg] = useState(initial?.weight_kg ?? 72);
  const [heightCm, setHeightCm] = useState(initial?.height_cm ?? 170);
  const [age, setAge] = useState(initial?.age ?? 30);
  const [gender, setGender] = useState(initial?.gender ?? "Kobieta");
  const [cookTimeMin, setCookTimeMin] = useState(initial?.cook_time_min ?? 15);
  const [weeklyBudgetPln, setWeeklyBudgetPln] = useState(initial?.weekly_budget_pln ?? 150);
  const [preferredStore, setPreferredStore] = useState(initial?.preferred_store ?? "Biedronka");
  const [pantryItems, setPantryItems] = useState(initial?.pantry_items ?? "");
  const [fridgeOnly, setFridgeOnly] = useState(initial?.fridge_only ?? false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        goal,
        diet_type: dietType,
        weight_kg: weightKg,
        height_cm: heightCm,
        age,
        gender,
        cook_time_min: cookTimeMin,
        weekly_budget_pln: weeklyBudgetPln,
        preferred_store: preferredStore,
        pantry_items: pantryItems,
        fridge_only: fridgeOnly,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) setStatus("Nie udało się zapisać.");
    else setStatus("Zapisano preferencje.");
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">Preferencje</h2>
      <p className="mt-1 text-sm text-muted">Te dane wykorzystasz w kreatorze — możesz je tu edytować.</p>
      <form onSubmit={save} className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4">
        <label className="block text-sm font-medium text-muted">
          Cel
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
          >
            {["Schudnąć", "Przytyć", "Utrzymać wagę"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-muted">
          Typ diety
          <select
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
          >
            {["Standardowa", "Wegetariańska", "Wegańska", "Keto", "Low-carb", "Inne"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm font-medium text-muted">
            Waga (kg)
            <input
              type="number"
              value={weightKg ?? ""}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5"
            />
          </label>
          <label className="text-sm font-medium text-muted">
            Wzrost (cm)
            <input
              type="number"
              value={heightCm ?? ""}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5"
            />
          </label>
          <label className="text-sm font-medium text-muted">
            Wiek
            <input
              type="number"
              value={age ?? ""}
              onChange={(e) => setAge(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5"
            />
          </label>
          <label className="text-sm font-medium text-muted">
            Płeć
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5"
            >
              {["Kobieta", "Mężczyzna", "Inna"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium text-muted">
          Czas gotowania (min)
          <select
            value={cookTimeMin}
            onChange={(e) => setCookTimeMin(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            {[5, 10, 15].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-muted">
          Budżet (zł / tydz.)
          <input
            type="number"
            value={weeklyBudgetPln ?? ""}
            onChange={(e) => setWeeklyBudgetPln(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-muted">
          Sklep
          <select
            value={preferredStore}
            onChange={(e) => setPreferredStore(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            {["Biedronka", "Lidl", "Żabka"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={fridgeOnly} onChange={(e) => setFridgeOnly(e.target.checked)} />
          Priorytet: produkty z lodówki
        </label>
        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
          Zapisz
        </button>
        {status && <p className="text-sm text-primary">{status}</p>}
      </form>
    </section>
  );
}
