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
      <div className="flex items-center gap-2">
        <Link
          href="/logowanie"
          className="rounded-lg px-2 py-2 text-sm font-medium text-muted hover:text-primary sm:px-3"
        >
          Logowanie
        </Link>
        <Link
          href="/rejestracja"
          className="hidden rounded-lg px-2 py-2 text-sm font-medium text-muted hover:text-primary sm:inline sm:px-3"
        >
          Rejestracja
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[140px] truncate text-xs text-muted sm:inline" title={user.email ?? ""}>
        {user.email}
      </span>
      <Link href="/panel" className="rounded-lg px-2 py-2 text-sm font-medium text-muted hover:text-primary">
        Panel
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-lg px-2 py-2 text-sm font-medium text-muted hover:text-red-600"
      >
        Wyloguj
      </button>
    </div>
  );
}
