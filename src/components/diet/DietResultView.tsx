"use client";

import type { DietPayload } from "@/types/diet";
import { ExportPdfButton } from "./ExportPdfButton";
import Link from "next/link";

type Props = { payload: DietPayload; planId?: string };

export function DietResultView({ payload, planId }: Props) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Twoja dieta na 7 dni</h2>
          {payload.summary && <p className="mt-2 text-muted">{payload.summary}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportPdfButton payload={payload} />
          {planId && (
            <Link
              href={`/panel/diety/${planId}`}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Zobacz w panelu
            </Link>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">Lista zakupów</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {(["Biedronka", "Lidl", "Żabka"] as const).map((shop) => (
            <div key={shop}>
              <h4 className="font-semibold text-primary">{shop}</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {payload.shoppingList[shop].map((i) => (
                  <li key={i.item + i.amount}>
                    <span className="text-foreground">{i.item}</span> — {i.amount}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-8">
        {payload.days.map((d) => (
          <section key={d.day} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-xl font-bold text-foreground">Dzień {d.day}</h3>
            <div className="mt-4 space-y-6">
              {d.meals.map((m) => (
                <article key={m.name} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-lg font-semibold text-foreground">{m.name}</h4>
                    <span className="text-sm font-medium text-primary">{m.prepTimeMinutes} min</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted">Składniki</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-foreground/90">
                    {m.ingredients.map((ing) => (
                      <li key={ing.name}>
                        {ing.name} — {ing.amount}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm font-medium text-muted">Kroki</p>
                  <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-foreground/90">
                    {m.steps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
