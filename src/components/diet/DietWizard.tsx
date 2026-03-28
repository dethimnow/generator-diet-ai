"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DietPayload } from "@/types/diet";
import { DietResultView } from "./DietResultView";
import { Loader2, X } from "lucide-react";
import {
  clearWizardDraft,
  loadWizardDraft,
  normalizeCookTimeMin,
  saveWizardDraft,
  type WizardDraftV1,
} from "@/lib/wizard-draft";

const API_GOALS = ["Schudnąć", "Przytyć", "Utrzymać wagę"] as const;
const GOAL_UI: { label: string; value: (typeof API_GOALS)[number] }[] = [
  { label: "Chcę zredukować wagę", value: "Schudnąć" },
  { label: "Chcę nabrać masy", value: "Przytyć" },
  { label: "Chcę po prostu zdrowo jeść", value: "Utrzymać wagę" },
];

const API_DIETS = ["Standardowa", "Wegetariańska", "Wegańska", "Keto"] as const;
const DIET_UI: { label: string; value: (typeof API_DIETS)[number] }[] = [
  { label: "Wszystkożerca", value: "Standardowa" },
  { label: "Bez mięsa", value: "Wegetariańska" },
  { label: "Tylko rośliny", value: "Wegańska" },
  { label: "Wysokie tłuszcze (Keto)", value: "Keto" },
];

const STORES = ["Biedronka", "Lidl", "Żabka"] as const;
const COOK_UI: { label: string; value: 10 | 20 | 30 }[] = [
  { label: "Ekspres (5–10 min)", value: 10 },
  { label: "Standard (ok. 20 min)", value: 20 },
  { label: "Masterchef (30+ min)", value: 30 },
];
const BUDGETS = [100, 150, 200, 250] as const;

const STEPS = ["Cel", "Styl jedzenia", "Zakupy", "Dane", "Czas i portfel", "Lodówka"] as const;

type EdgeDietResponse = {
  ok?: boolean;
  accepted?: boolean;
  planId?: string;
  error?: string;
  payload?: DietPayload;
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** Po 202 z Edge (generowanie w tle) — czytamy status z RLS jak zwykły użytkownik. */
async function waitForPlanPayload(
  supabase: ReturnType<typeof createClient>,
  planId: string,
  opts: { maxMs: number; intervalMs: number }
): Promise<DietPayload> {
  const deadline = Date.now() + opts.maxMs;
  while (Date.now() < deadline) {
    const { data, error } = await supabase
      .from("diet_plans")
      .select("status, payload, generation_error")
      .eq("id", planId)
      .single();

    if (error) {
      throw new Error(error.message || "Nie udało się odczytać planu");
    }
    if (data?.status === "ready" && data.payload) {
      return data.payload as DietPayload;
    }
    if (data?.status === "failed") {
      const msg =
        typeof data.generation_error === "string" && data.generation_error.trim()
          ? data.generation_error
          : "Generowanie nie powiodło się";
      throw new Error(msg);
    }
    await sleep(opts.intervalMs);
  }
  throw new Error(
    "Minął limit oczekiwania. Otwórz Panel — plan może być już gotowy albo spróbuj „Generuj plan” ponownie."
  );
}

/** Odczyt treści z FunctionsHttpError — bez instanceof (zawodzi przy duplikatach pakietów w bundlerze). */
async function messageFromSupabaseFunctionError(error: unknown): Promise<string> {
  const fallback = error instanceof Error ? error.message : "Błąd wywołania funkcji";
  const ctx =
    error &&
    typeof error === "object" &&
    "context" in error &&
    (error as { context: unknown }).context instanceof Response
      ? ((error as { context: Response }).context as Response)
      : null;

  if (ctx) {
    const status = ctx.status;
    try {
      const raw = await ctx.clone().text();
      if (raw) {
        if (/invalid\s+jwt/i.test(raw)) {
          return "Błąd „Invalid JWT” z bramy Supabase. W panelu: Edge Functions → diet-generate → wyłącz weryfikację JWT (Verify JWT), albo wyloguj się i zaloguj ponownie. Sprawdź też, czy na Vercel URL i klucz anon są z tego samego projektu.";
        }
        try {
          const j = JSON.parse(raw) as { error?: string; message?: string };
          if (typeof j.error === "string" && j.error.trim()) return j.error;
          if (typeof j.message === "string" && j.message.trim()) return j.message;
        } catch {
          const short = raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
          return `${fallback} (HTTP ${status}): ${short}`;
        }
      }
    } catch {
      /* ignore */
    }
    if (status === 401) {
      return "Brak autoryzacji do funkcji (401). Wyloguj się, zaloguj ponownie i spróbuj jeszcze raz.";
    }
    if (status === 404) {
      return "Nie znaleziono funkcji diet-generate (404). Wdróż Edge Function w Supabase.";
    }
    if (status >= 500) {
      return `Błąd po stronie funkcji (HTTP ${status}). Sprawdź w Supabase → Edge Functions → diet-generate → Logs oraz sekret OPENAI_API_KEY.`;
    }
    return `${fallback} (HTTP ${status})`;
  }

  if (fallback.includes("non-2xx")) {
    return "Funkcja diet-generate zwróciła błąd. Najczęściej: brak sekretu OPENAI_API_KEY, stary plan bez generation_input (wygeneruj od nowa), albo limit czasu — zobacz logi w Supabase.";
  }
  return fallback;
}

/**
 * Edge Function: na produkcji zwykle 202 + generowanie w tle (waitUntil), potem polling z tabeli.
 * Krótki timeout invoke — odpowiedź przychodzi od razu; długi czas to OpenAI w isolate.
 */
async function invokeDietGenerateEdge(
  supabase: ReturnType<typeof createClient>,
  planId: string,
  onPolling: () => void
): Promise<DietPayload> {
  const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
  if (refreshErr) {
    console.warn("refreshSession:", refreshErr.message);
  }
  const accessToken =
    refreshed.session?.access_token ?? (await supabase.auth.getSession()).data.session?.access_token;
  if (!accessToken) {
    throw new Error("Sesja wygasła — zaloguj się ponownie i spróbuj „Generuj plan” jeszcze raz.");
  }

  /* Jawny Bearer — inaczej fetch czasem podstawia anon zamiast sesji → brama Supabase: „Invalid JWT”. */
  const { data, error } = await supabase.functions.invoke<EdgeDietResponse>("diet-generate", {
    body: { planId },
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 90_000,
  });

  if (error) {
    throw new Error(await messageFromSupabaseFunctionError(error));
  }

  if (data?.accepted === true && data.planId) {
    onPolling();
    return waitForPlanPayload(supabase, data.planId, { maxMs: 360_000, intervalMs: 2500 });
  }

  if (data?.ok && data.payload) {
    return data.payload;
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  throw new Error("Brak danych planu w odpowiedzi.");
}

export function DietWizard() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<(typeof API_GOALS)[number]>("Utrzymać wagę");
  const [dietType, setDietType] = useState<(typeof API_DIETS)[number]>("Standardowa");
  const [weightKg, setWeightKg] = useState(72);
  const [heightCm, setHeightCm] = useState(170);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<"Kobieta" | "Mężczyzna" | "Inna">("Kobieta");
  const [cookTimeMin, setCookTimeMin] = useState<10 | 20 | 30>(20);
  const [weeklyBudgetPln, setWeeklyBudgetPln] = useState(150);
  const [store, setStore] = useState<(typeof STORES)[number]>("Biedronka");
  const [fridgeOnly, setFridgeOnly] = useState(false);
  const [pantryItems, setPantryItems] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; payload: DietPayload } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [restoredBanner, setRestoredBanner] = useState(false);

  const supabase = createClient();

  const persistDraft = useCallback(() => {
    const d: WizardDraftV1 = {
      step,
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
    };
    saveWizardDraft(d);
  }, [
    step,
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
  ]);

  useEffect(() => {
    const d = loadWizardDraft();
    if (!d) return;
    setStep(Math.min(d.step, STEPS.length - 1));
    setGoal(d.goal);
    const safeDiet = API_DIETS.includes(d.dietType as (typeof API_DIETS)[number])
      ? (d.dietType as (typeof API_DIETS)[number])
      : "Standardowa";
    setDietType(safeDiet);
    setWeightKg(d.weightKg);
    setHeightCm(d.heightCm);
    setAge(d.age);
    setGender(d.gender);
    setCookTimeMin(normalizeCookTimeMin(Number(d.cookTimeMin)));
    setWeeklyBudgetPln(d.weeklyBudgetPln);
    setStore(d.store);
    setPantryItems(d.pantryItems);
    setFridgeOnly(d.fridgeOnly);
    setRestoredBanner(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(persistDraft, 400);
    return () => clearTimeout(t);
  }, [persistDraft]);

  async function handleGenerate() {
    setError(null);
    setLoadingHint(null);
    setLoading(true);
    const fetchMs = 120_000;
    try {
      /* Bez getUser() w przeglądarce — często tam wisi na Supabase; sesję sprawdza API (ciasteczka). */
      const ac = new AbortController();
      const fetchTimer = setTimeout(() => ac.abort(), fetchMs);
      let res: Response;
      try {
        res = await fetch("/api/diet/generate", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
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
      } finally {
        clearTimeout(fetchTimer);
      }

      const text = await res.text();
      let data: {
        error?: string;
        code?: string;
        id?: string;
        status?: string;
        payload?: unknown;
      } = {};
      if (text) {
        try {
          data = JSON.parse(text) as typeof data;
        } catch {
          setError(
            res.ok
              ? "Serwer zwrócił niepoprawną odpowiedź. Odśwież stronę i spróbuj ponownie."
              : `Błąd serwera (${res.status}). Spróbuj ponownie za chwilę.`
          );
          return;
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          persistDraft();
          setShowAuthModal(true);
          return;
        }
        if (res.status === 504 && data.code === "AUTH_TIMEOUT") {
          setError(
            data.error ||
              "Timeout weryfikacji sesji. Odśwież stronę lub zaloguj się ponownie."
          );
          return;
        }
        if (res.status === 429 && data.code === "WEEKLY_LIMIT") {
          setError(`${data.error || "Limit tygodniowy."} Możesz włączyć Premium w panelu.`);
        } else {
          setError(data.error || "Nie udało się wygenerować diety.");
        }
        return;
      }

      if (res.status === 202 && data.id && data.status === "pending") {
        setLoadingHint("Uruchamiam generator (to zwykle 1–3 min)…");
        const payload = await invokeDietGenerateEdge(supabase, data.id, () =>
          setLoadingHint("AI układa plan — możesz zostawić kartę otwartą. To nie zawiesza połączenia HTTP.")
        );
        clearWizardDraft();
        setResult({ id: data.id, payload });
        setStep(STEPS.length);
        return;
      }

      if (data.id && data.payload) {
        clearWizardDraft();
        setResult({ id: data.id, payload: data.payload as DietPayload });
        setStep(STEPS.length);
        return;
      }

      setError("Brak danych planu w odpowiedzi serwera.");
    } catch (e: unknown) {
      const name =
        e instanceof Error
          ? e.name
          : typeof e === "object" && e !== null && "name" in e
            ? String((e as { name: unknown }).name)
            : "";
      const message = e instanceof Error ? e.message : "";
      if (name === "AbortError") {
        setError(
          "Przekroczono czas oczekiwania. Na darmowym planie Vercel funkcja może mieć limit ~10 s — wtedy potrzebny jest Pro lub krótszy plan AI. Spróbuj ponownie."
        );
      } else if (message) {
        setError(message);
      } else {
        setError("Błąd sieci. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
      setLoadingHint(null);
    }
  }

  if (result && step === STEPS.length) {
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
    <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121c2a]/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div className="relative w-full max-w-md rounded-[1.5rem] border border-border bg-card p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-surface-low hover:text-foreground"
              aria-label="Zamknij"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="auth-modal-title" className="font-headline text-xl font-bold text-foreground pr-8">
              Załóż konto, żeby wygenerować plan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Darmowe konto zajmuje chwilę. <strong>Twoje odpowiedzi z kreatora są już zapisane</strong> w tej
              przeglądarce — po rejestracji lub logowaniu wrócisz tutaj i dokończysz jednym kliknięciem „Generuj plan”.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/rejestracja?next=/kreator"
                className="inline-flex justify-center rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:opacity-95"
                onClick={() => setShowAuthModal(false)}
              >
                Załóż darmowe konto
              </Link>
              <Link
                href="/logowanie?next=/kreator"
                className="inline-flex justify-center rounded-full border-2 border-primary/30 bg-transparent px-6 py-3 text-center text-sm font-bold text-primary transition hover:bg-primary/5"
                onClick={() => setShowAuthModal(false)}
              >
                Mam już konto — loguję się
              </Link>
            </div>
          </div>
        </div>
      )}

      {restoredBanner && (
        <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
          Przywróciliśmy zapisany kreator. Możesz coś zmienić albo od razu wygenerować plan.
          <button
            type="button"
            className="ml-2 font-bold text-primary underline"
            onClick={() => setRestoredBanner(false)}
          >
            OK
          </button>
        </div>
      )}

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`rounded-full px-3 py-2 text-center text-[11px] font-bold sm:text-xs ${
              i === step
                ? "bg-primary text-white shadow-md"
                : i < step
                  ? "bg-primary/12 text-primary"
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
          className="rounded-[1.5rem] border border-border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8"
        >
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold text-foreground">Jaki jest Twój cel na ten tydzień?</h2>
              <div className="grid gap-3">
                {GOAL_UI.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${
                      goal === g.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:border-primary/35"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold text-foreground">Jak lubisz jeść?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {DIET_UI.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDietType(d.value)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${
                      dietType === d.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:border-primary/35"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold text-foreground">Gdzie najczęściej robisz zakupy?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {STORES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStore(s);
                      setFridgeOnly(false);
                    }}
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold transition ${
                      store === s && !fridgeOnly
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:border-primary/35"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFridgeOnly(true)}
                  className={`rounded-2xl border px-4 py-4 text-sm font-bold transition sm:col-span-2 ${
                    fridgeOnly
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-primary/35"
                  }`}
                >
                  Mam już pełną lodówkę
                </button>
              </div>
              {fridgeOnly && (
                <p className="text-sm text-on-surface-variant">
                  AI oprze plan na produktach z lodówki (i uzupełni listę tylko tam, gdzie trzeba). Jako domyślny sklep
                  do sekcji zakupów użyjemy {store} — możesz zmienić klikając powyżej.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold text-foreground">Kilka liczb o Tobie</h2>
              <p className="text-sm text-on-surface-variant">Potrzebne do sensownego doborku kalorii i porcji.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Waga (kg)
                  <input
                    type="number"
                    min={30}
                    max={250}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground"
                  />
                </label>
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Wzrost (cm)
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground"
                  />
                </label>
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Wiek
                  <input
                    type="number"
                    min={14}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground"
                  />
                </label>
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">Płeć</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["Kobieta", "Mężczyzna", "Inna"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`rounded-xl border px-3 py-2 text-sm font-bold ${
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

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-headline text-xl font-bold text-foreground">Ile czasu masz na gotowanie?</h2>
              <div className="grid gap-3">
                {COOK_UI.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCookTimeMin(c.value)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${
                      cookTimeMin === c.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:border-primary/35"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div>
                <p className="font-headline text-lg font-bold text-foreground">Budżet na tydzień</p>
                <p className="mt-1 text-sm text-on-surface-variant">Orientacyjnie — AI dobiera tańsze zestawienia.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setWeeklyBudgetPln(b)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${
                        weeklyBudgetPln === b ? "border-primary bg-primary/10 text-primary" : "border-border"
                      }`}
                    >
                      {b} zł
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold text-foreground">Co masz w lodówce?</h2>
              <p className="text-sm text-on-surface-variant">
                Opcjonalnie — wpisz po przecinku (np. jajka, twaróg, brokuł, ryż). AI spróbuje to wpleść w plan.
              </p>
              <textarea
                value={pantryItems}
                onChange={(e) => setPantryItems(e.target.value)}
                rows={4}
                placeholder="np. jajka, ser feta, szpinak, makaron pełnoziarnisty..."
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {loadingHint && (
        <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {loadingHint}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-muted disabled:opacity-40"
        >
          Wstecz
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-95"
          >
            Dalej
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Generuj plan
          </button>
        )}
      </div>
    </div>
  );
}
