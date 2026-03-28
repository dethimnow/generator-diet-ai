"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/kreator";
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const origin = window.location.origin;
    const callback = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callback,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      router.push(nextPath);
      router.refresh();
      return;
    }
    setInfo(
      "Sprawdź skrzynkę e-mail, aby potwierdzić konto. Po kliknięciu w link wrócisz do aplikacji — zapis kreatora w przeglądarce nadal czeka."
    );
  }

  return (
    <>
      <h1 className="font-headline text-2xl font-bold text-foreground">Rejestracja</h1>
      <p className="mt-2 text-sm text-muted">
        Masz konto?{" "}
        <Link href={`/logowanie?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-primary hover:underline">
          Zaloguj się
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <label className="block text-sm font-medium text-muted">
          Imię lub nick
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
          />
        </label>
        <label className="block text-sm font-medium text-muted">
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
          />
        </label>
        <label className="block text-sm font-medium text-muted">
          Hasło (min. 6 znaków)
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-primary">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-50"
        >
          {loading ? "Tworzenie…" : "Załóż konto"}
        </button>
      </form>
    </>
  );
}
