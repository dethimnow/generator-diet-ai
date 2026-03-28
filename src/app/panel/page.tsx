import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PreferencesSection } from "@/components/panel/PreferencesSection";
import { PremiumCheckoutButton } from "@/components/panel/PremiumCheckoutButton";

export const metadata: Metadata = {
  title: "Panel użytkownika",
};

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, premium_until, display_name")
    .eq("id", user.id)
    .single();

  const { data: prefs } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle();

  const { data: diets } = await supabase
    .from("diet_plans")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const now = new Date();
  const premiumActive =
    profile?.is_premium === true ||
    (!!profile?.premium_until && new Date(profile.premium_until) > now);

  const sp = await searchParams;
  const premiumBanner =
    sp.premium === "1" ? "Dziękujemy! Subskrypcja Premium powinna być aktywna wkrótce." : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {premiumBanner && (
        <p className="mb-6 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary ring-1 ring-primary/20">
          {premiumBanner}
        </p>
      )}
      <header className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel</h1>
          <p className="mt-1 text-muted">
            Witaj{profile?.display_name ? `, ${profile.display_name}` : ""}. Zarządzaj dietami i preferencjami.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              premiumActive ? "bg-primary text-white" : "bg-card text-muted ring-1 ring-border"
            }`}
          >
            {premiumActive ? "Premium aktywne" : "Plan darmowy — 1 dieta / tydzień"}
          </span>
          {!premiumActive && <PremiumCheckoutButton />}
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Historia diet</h2>
          <ul className="mt-4 space-y-2">
            {(diets ?? []).length === 0 && <li className="text-sm text-muted">Brak zapisanych diet — użyj kreatora.</li>}
            {(diets ?? []).map((d) => (
              <li key={d.id}>
                <Link
                  href={`/panel/diety/${d.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:border-primary/40"
                >
                  <span>{d.title}</span>
                  <time className="text-muted" dateTime={d.created_at}>
                    {new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeZone: "Europe/Warsaw" }).format(
                      new Date(d.created_at)
                    )}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/kreator"
            className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Nowa dieta
          </Link>
        </section>

        <PreferencesSection initial={prefs} userId={user.id} />
      </div>
    </div>
  );
}
