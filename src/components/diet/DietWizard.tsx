"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DietPayload } from "@/types/diet";
import { DietResultView } from "./DietResultView";
import { Loader2 } from "lucide-react";

const goals = ["Schudnąć", "Przytyć", "Utrzymać wagę"] as const;
const dietTypes = ["Standardowa", "Wegetariańska", "Wegańska", "Keto", "Low-carb", "Inne"] as const;
const genders = ["Kobieta", "Mężczyzna", "Inna"] as const;
const cookTimes = [5, 10, 15] as const;
const budgets = [100, 150, 200, 250] as const;
const stores = ["Biedronka", "Lidl", "Żabka"] as const;

const steps = ["Cel", "Typ diety", "Dane", "Preferencje", "Generuj"] as const;

export function DietWizard() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<(typeof goals)[number]>("Utrzymać wagę");
  const [dietType, setDietType] = useState<(typeof dietTypes)[number]>("Standardowa");
  const [weightKg, setWeightKg] = useState(72);
  const [heightCm, setHeightCm] = useState(170);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<(typeof genders)[number]>("Kobieta");
  const [cookTimeMin, setCookTimeMin] = useState<(typeof cookTimes)[number]>(15);
  const [weeklyBudgetPln, setWeeklyBudgetPln] = useState(150);
  const [store, setStore] = useState<(typeof stores)[number]>("Biedronka");
  const [pantryItems, setPantryItems] = useState("");
  const [fridgeOnly, setFridgeOnly] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; payload: DietPayload } | null>(null);

  const supabase = createClient();

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Zaloguj się, aby wygenerować dietę.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/diet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          dietType,
          weightKg,
          heightCm,
          age,
          gender,
          cookTimeMin,
          weeklyBudgetPln,
          store,
          pantryItems,
          fridgeOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 && data.code === "WEEKLY_LIMIT") {
          setError(
            `${data.error || "Limit tygodniowy."} Możesz włączyć Premium w panelu.`
          );
        } else {
          setError(data.error || "Nie udało się wygenerować diety.");
        }
        setLoading(false);
        return;
      }
      setResult({ id: data.id, payload: data.payload as DietPayload });
      setStep(4);
    } catch {
      setError("Błąd sieci. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  if (result && step === 4) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <DietResultView payload={result.payload} planId={result.id} />
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setStep(0);
            }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Utwórz nową dietę
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex justify-between gap-2">
        {steps.slice(0, 4).map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`flex-1 rounded-full px-2 py-2 text-center text-xs font-semibold sm:text-sm ${
              i === step
                ? "bg-primary text-white shadow-md"
                : i < step
                  ? "bg-primary/15 text-primary"
                  : "bg-card text-muted ring-1 ring-border"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Jaki jest Twój cel?</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      goal === g ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Typ diety</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {dietTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDietType(t)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      dietType === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Twoje dane</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-muted">
                  Waga (kg)
                  <input
                    type="number"
                    min={30}
                    max={250}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
                  />
                </label>
                <label className="block text-sm font-medium text-muted">
                  Wzrost (cm)
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
                  />
                </label>
                <label className="block text-sm font-medium text-muted">
                  Wiek
                  <input
                    type="number"
                    min={14}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
                  />
                </label>
                <div>
                  <p className="text-sm font-medium text-muted">Płeć</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {genders.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                          gender === g ? "border-primary bg-primary/10 text-primary" : "border-border"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Preferencje</h2>
              <div>
                <p className="text-sm font-medium text-muted">Czas gotowania (min)</p>
                <div className="mt-2 flex gap-2">
                  {cookTimes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCookTimeMin(m)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        cookTimeMin === m ? "border-primary bg-primary/10 text-primary" : "border-border"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Budżet tygodniowy (zł)</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {budgets.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setWeeklyBudgetPln(b)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        weeklyBudgetPln === b ? "border-primary bg-primary/10 text-primary" : "border-border"
                      }`}
                    >
                      {b} zł
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Sklep</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stores.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStore(s)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        store === s ? "border-primary bg-primary/10 text-primary" : "border-border"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block text-sm font-medium text-muted">
                Produkty, które masz w domu (opcjonalnie)
                <textarea
                  value={pantryItems}
                  onChange={(e) => setPantryItems(e.target.value)}
                  rows={3}
                  placeholder="np. ryż basmati, jajka, twaróg, mrożone warzywa..."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={fridgeOnly}
                  onChange={(e) => setFridgeOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Tryb: mam tylko to w lodówce (priorytet dla produktów z listy)
              </label>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100" role="alert">
          {error}{" "}
          {error.includes("Zaloguj") && (
            <Link href="/logowanie" className="font-semibold underline">
              Przejdź do logowania
            </Link>
          )}
        </p>
      )}

      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted disabled:opacity-40"
        >
          Wstecz
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Dalej
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Generuj dietę
          </button>
        )}
      </div>
    </div>
  );
}
