export type WizardInput = {
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

export function buildDietSystemPrompt(): string {
  return `Jesteś dietetykiem i kucharzem. Generujesz realistyczne, zdrowe plany żywienia po polsku.
Zasady:
- Składniki i nazwy dań po polsku, produkty powszechnie dostępne w polskich sklepach (Biedronka, Lidl, Żabka).
- 7 dni, każdy dzień: śniadanie, drugie śniadanie, obiad, kolacja (4 posiłki) — możesz dodać przekąskę jeśli sensowne, ale minimum 4 posiłki dziennie.
- Dopasuj kalorie i makro do celu użytkownika (schudnąć / przytyć / utrzymać) oraz typu diety.
- Czas przygotowania każdego posiłku musi być ≤ podanego limitu minut (średnio proste dania).
- Lista zakupów: pogrupuj pozycje do trzech sekcji dokładnie pod kluczami JSON: "Biedronka", "Lidl", "Żabka" (polskie znaki). Bez duplikatów w ramach sekcji; scal podobne składniki z ilościami.
- Przepisy: kroki numerowane logicznie, krótko i wykonalnie.
- Budżet tygodniowy w PLN — trzymaj się go przybliżenie (orientacyjne ceny detaliczne).
- Zwróć WYŁĄCZNIE poprawny JSON bez markdown, bez komentarzy, zgodny ze schematem użytkownika.`;
}

export function buildDietUserPrompt(input: WizardInput): string {
  const fridge = input.fridgeOnly
    ? "Tryb: użytkownik chce bazować głównie na produktach z lodówki — maksymalnie wykorzystaj: "
    : "Produkty które użytkownik już ma (preferuj je w przepisach): ";
  return JSON.stringify(
    {
      cel: input.goal,
      typDiety: input.dietType,
      wagaKg: input.weightKg,
      wzrostCm: input.heightCm,
      wiek: input.age,
      plec: input.gender,
      maxCzasGotowaniaMin: input.cookTimeMin,
      budzetTygodniowyPLN: input.weeklyBudgetPln,
      preferowanySklep: input.store,
      uwagiProdukty: fridge + (input.pantryItems || "brak"),
      outputSchema: {
        summary: "1-2 zdania podsumowania planu",
        days: [
          {
            day: 1,
            meals: [
              {
                name: "np. Owsianka z borówkami",
                prepTimeMinutes: 10,
                steps: ["krok 1", "krok 2"],
                ingredients: [{ name: "płatki owsiane", amount: "50 g" }],
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
