/** Karty SEO — język korzyści + link do bloga */
export type SeoSpotlight = {
  tag: string;
  difficulty: string;
  searches: string;
  duration: string;
  slug: string;
  /** Krótka zajawka pod kartę */
  benefit: string;
};

export const seoDietSpotlights: SeoSpotlight[] = [
  {
    tag: "Dieta Keto (Low Carb)",
    difficulty: "Łatwy start",
    searches: "popularne",
    duration: "7 dni",
    slug: "dieta-keto",
    benefit: "Spalaj tłuszcz tłuszczem. Idealna dla fanów konkretnych posiłków bez nagłych spadków energii.",
  },
  {
    tag: "Dieta przeciwzapalna",
    difficulty: "Łatwy start",
    searches: "zdrowie",
    duration: "plan tygodniowy",
    slug: "dieta-przeciwzapalna",
    benefit: "Mniej przetworzonego, więcej warzyw i stabilnej energii — prościej trzymać nawyk bez restrykcji „na siłę”.",
  },
  {
    tag: "Dieta od brokuła (Light)",
    difficulty: "Ekspres",
    searches: "sezonowo",
    duration: "lekki tydzień",
    slug: "dieta-od-brokula",
    benefit: "Poczuj się lekko. Proste dania bazujące na warzywach, które kupisz w każdym Lidlu.",
  },
  {
    tag: "Dieta lekkostrawna",
    difficulty: "Łagodnie",
    searches: "komfort",
    duration: "5 dni",
    slug: "dieta-lekkostrawna",
    benefit: "Ciepłe, miękkie posiłki i mniej „ciężkich” sosów — wygodniej dla żołądka w intensywnym tygodniu.",
  },
  {
    tag: "Keto dieta",
    difficulty: "Low carb",
    searches: "redukcja",
    duration: "plan 7 dni",
    slug: "keto-dieta",
    benefit: "Mniej głodu między posiłkami i prostsze porcje — gdy lubisz sery, jaja i obfite sałatki.",
  },
  {
    tag: "Viking Diet",
    difficulty: "Syto",
    searches: "białko",
    duration: "mocny tydzień",
    slug: "dieta-vikinga",
    benefit: "Jedz jak wojownik. Dużo białka, sezonowe produkty i maksymalna sytość.",
  },
  {
    tag: "Dieta pudełkowa (DIY)",
    difficulty: "Oszczędzanie",
    searches: "meal prep",
    duration: "3–4 dni",
    slug: "dieta-pudelkowa",
    benefit: "Zrób swój własny catering. Planuj posiłki na kilka dni do przodu i trzymaj budżet pod kontrolą.",
  },
  {
    tag: "Viking dieta",
    difficulty: "Nordycki styl",
    searches: "inspiracja",
    duration: "krótki plan",
    slug: "viking-dieta",
    benefit: "Ryby, kasze i warzywa korzeniowe w prostych daniach — mniej chaosu w sklepie, więcej rytmu w tygodniu.",
  },
];
