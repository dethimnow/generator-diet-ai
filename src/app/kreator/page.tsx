import type { Metadata } from "next";
import { DietWizard } from "@/components/diet/DietWizard";

export const metadata: Metadata = {
  title: "Kreator diety",
  description: "Krok po kroku: cel, typ diety, dane, preferencje — potem AI generuje plan na 7 dni i listę zakupów.",
};

export default function KreatorPage() {
  return (
    <div className="border-b border-border bg-gradient-to-b from-primary/5 to-background pb-4 pt-6">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">Kreator diety</h1>
        <p className="mx-auto mt-2 max-w-2xl text-muted">
          Wybierz opcje w kilku krokach. Na końcu kliknij „Generuj dietę” — potrzebne jest konto (limit 1 darmowej diety
          tygodniowo, Premium bez limitu).
        </p>
      </div>
      <DietWizard />
    </div>
  );
}
