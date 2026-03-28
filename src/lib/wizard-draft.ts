/** Draft kreatora — przywracany po rejestracji / logowaniu */

export const WIZARD_DRAFT_KEY = "generator-diet-ai-wizard-draft-v1";

export type WizardDraftV1 = {
  step: number;
  goal: "Schudnąć" | "Przytyć" | "Utrzymać wagę";
  dietType: "Standardowa" | "Wegetariańska" | "Wegańska" | "Keto" | "Low-carb" | "Inne";
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "Kobieta" | "Mężczyzna" | "Inna";
  cookTimeMin: number;
  weeklyBudgetPln: number;
  store: "Biedronka" | "Lidl" | "Żabka";
  pantryItems: string;
  fridgeOnly: boolean;
};

export function isWizardDraftV1(x: unknown): x is WizardDraftV1 {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.step === "number" &&
    typeof o.weightKg === "number" &&
    typeof o.heightCm === "number" &&
    typeof o.age === "number"
  );
}

export function saveWizardDraft(draft: WizardDraftV1): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function loadWizardDraft(): WizardDraftV1 | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isWizardDraftV1(parsed)) return null;
    return parsed as WizardDraftV1;
  } catch {
    return null;
  }
}

/** Stare drafty miały 5/10/15 — mapuj na 10/20/30 */
export function normalizeCookTimeMin(n: number): 10 | 20 | 30 {
  if (n <= 7) return 10;
  if (n <= 12) return 10;
  if (n <= 17) return 20;
  if (n <= 25) return 20;
  return 30;
}

export function clearWizardDraft(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(WIZARD_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
