"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthNav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUser(data.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/rejestracja"
          className="rounded-full border-2 border-primary px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10 sm:px-4 sm:py-2 sm:text-sm"
        >
          Rejestracja
        </Link>
        <Link
          href="/logowanie"
          className="rounded-full px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
        >
          Logowanie
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[100px] truncate text-[11px] text-muted sm:max-w-[140px] sm:text-xs lg:inline"
        title={user.email ?? ""}
      >
        {user.email}
      </span>
      <Link
        href="/panel"
        className="rounded-lg px-2 py-2 text-xs font-bold text-primary hover:bg-primary/10 sm:text-sm"
      >
        Panel
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-lg px-2 py-2 text-xs font-bold text-muted hover:text-red-600 sm:text-sm"
      >
        Wyloguj
      </button>
    </div>
  );
}
