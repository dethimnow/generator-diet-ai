"use client";

import { jsPDF } from "jspdf";
import type { DietPayload } from "@/types/diet";

type Props = { payload: DietPayload; title?: string };

export function ExportPdfButton({ payload, title = "Dieta 7-dniowa" }: Props) {
  function handleExport() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;
    const lineH = 14;
    const pageW = doc.internal.pageSize.getWidth();

    const addLine = (text: string, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pageW - margin * 2);
      for (const line of lines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineH;
      }
    };

    addLine(title, true);
    y += 8;
    if (payload.summary) {
      addLine(payload.summary);
      y += 8;
    }

    for (const day of payload.days) {
      addLine(`Dzień ${day.day}`, true);
      y += 4;
      for (const meal of day.meals) {
        addLine(`${meal.name} (~${meal.prepTimeMinutes} min)`, true);
        meal.ingredients.forEach((i) => addLine(`• ${i.name} — ${i.amount}`));
        meal.steps.forEach((s, idx) => addLine(`${idx + 1}. ${s}`));
        y += 6;
      }
    }

    addLine("Lista zakupów", true);
    y += 4;
    (["Biedronka", "Lidl", "Żabka"] as const).forEach((shop) => {
      const items = payload.shoppingList[shop];
      if (!items.length) return;
      addLine(shop, true);
      items.forEach((i) => addLine(`• ${i.item} — ${i.amount}`));
      y += 4;
    });

    doc.save("generator-diet-ai-plan.pdf");
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/50 hover:text-primary"
    >
      Eksportuj PDF
    </button>
  );
}
