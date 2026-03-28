"use client";

import { useState } from "react";

type Variant = "default" | "onPrimary";

export function PremiumCheckoutButton({ variant = "default" }: { variant?: Variant }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Nie udało się uruchomić płatności.");
        return;
      }
      if (data.url) window.location.href = data.url as string;
    } catch {
      setMsg("Błąd sieci.");
    } finally {
      setLoading(false);
    }
  }

  const btnClass =
    variant === "onPrimary"
      ? "rounded-full bg-white px-6 py-2.5 text-sm font-bold text-primary shadow-lg hover:opacity-95 disabled:opacity-50"
      : "rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50";

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" disabled={loading} onClick={go} className={btnClass}>
        {loading ? "Łączenie…" : "Włącz Premium"}
      </button>
      {msg && (
        <p className={`text-xs ${variant === "onPrimary" ? "text-amber-200" : "text-red-600"}`}>{msg}</p>
      )}
    </div>
  );
}
