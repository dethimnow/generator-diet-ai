"use client";

import { useState } from "react";

export function PremiumCheckoutButton() {
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

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={go}
        className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Łączenie…" : "Subskrypcja Premium"}
      </button>
      {msg && <p className="text-xs text-red-600">{msg}</p>}
    </div>
  );
}
