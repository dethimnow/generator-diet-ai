import type { Metadata } from "next";
import Link from "next/link";
import { DietWizard } from "@/components/diet/DietWizard";

export const metadata: Metadata = {
  title: "Kreator planu żywienia",
  description:
    "Cel, styl jedzenia, sklep, dane, czas i budżet — potem AI generuje 7 dni i listę zakupów. Konto zapisze historię.",
};

export default function KreatorPage() {
  return (
    <div className="border-b border-border bg-gradient-to-b from-surface-low/80 to-background pb-8 pt-10">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Kreator planu
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant md:text-lg">
          Odpowiedz na kilka pytań — bez presji, możesz wrócić w dowolnym momencie. Aby wygenerować plan,{" "}
          <strong>załóż darmowe konto</strong>:{" "}
          <Link href="/rejestracja?next=/kreator" className="font-bold text-primary underline-offset-2 hover:underline">
            rejestracja
          </Link>{" "}
          zajmie chwilę, a <strong>Twoje odpowiedzi zapiszemy w tej przeglądarce</strong> do momentu generowania.
        </p>
      </div>
      <DietWizard />
    </div>
  );
}
