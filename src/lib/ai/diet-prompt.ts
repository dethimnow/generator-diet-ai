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

export function buildDietUserPrompt(input: WizardInput): string {
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
