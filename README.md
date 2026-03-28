# Generator Diet AI

Polska aplikacja webowa: spersonalizowana **dieta na 7 dni**, **lista zakupów** (Biedronka / Lidl / Żabka) i **przepisy krok po kroku** generowane przez AI. Stack: **Next.js (App Router)**, **Supabase** (Auth + Postgres), **OpenAI**, opcjonalnie **Stripe** (Premium).

## Funkcje

- Strona główna z CTA i sekcją SEO (linki do artykułów blogowych).
- **Kreator diety** (kroki: cel, typ diety, dane, preferencje, generowanie).
- **Panel**: historia diet, edycja preferencji, limit **1 darmowej diety / tydzień** (kalendarz od poniedziałku, strefa Europe/Warsaw), **Premium bez limitu** (Stripe).
- **Eksport PDF** (podstawowy; znaki diakrytyczne w PDF mogą wymagać rozszerzenia fontów — patrz uwagi).
- Blog: artykuły ~300–500 słów z linkami do kreatora.

## Wymagania

- Node.js 20+
- Konto [Supabase](https://supabase.com)
- Klucz [OpenAI API](https://platform.openai.com)

## Uruchomienie lokalne

1. Sklonuj repozytorium i zainstaluj zależności:

```bash
npm install
```

2. Skopiuj `.env.example` do `.env.local` i uzupełnij zmienne.

3. W Supabase uruchom migrację SQL z pliku:

`supabase/migrations/20260328000000_init.sql`

(albo Supabase CLI: `supabase link` + `supabase db push`, jeśli używasz CLI).

4. W Supabase → **Authentication → URL Configuration** ustaw:

- **Site URL**: `http://localhost:3000` (lub produkcyjny URL)
- **Redirect URLs**: `http://localhost:3000/auth/callback`, oraz URL produkcyjny z `/auth/callback`

5. Start dev:

```bash
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel + GitHub

1. Utwórz repozytorium na GitHubie (np. użytkownik `dethimnow`) i wypchnij kod:

```bash
git init
git add .
git commit -m "Initial commit: Generator Diet AI"
git branch -M main
git remote add origin https://github.com/dethimnow/generator-diet-ai.git
git push -u origin main
```

2. W [Vercel](https://vercel.com) zaimportuj projekt z GitHuba.

3. W **Settings → Environment Variables** dodaj te same zmienne co w `.env.local` (w tym `NEXT_PUBLIC_APP_URL` = URL produkcyjny, np. `https://twoja-domena.vercel.app`).

4. **Stripe (opcjonalnie)**

   - Utwórz produkt subskrypcyjny i skopiuj **Price ID** do `STRIPE_PRICE_ID`.
   - W Stripe Dashboard dodaj endpoint webhooka: `https://twoja-domena.vercel.app/api/stripe/webhook` i zdarzenia m.in. `checkout.session.completed`, `customer.subscription.deleted`.
   - Wklej signing secret do `STRIPE_WEBHOOK_SECRET`.

## Struktura katalogów

Next.js 16 domyślnie używa **App Router** (`src/app/`), a nie klasycznego katalogu `pages/` w korzeniu — oba nie mogą być w mieszanych ścieżkach (np. `pages/` w root + `src/app/` powoduje błąd builda). W tym repozytorium **wszystkie trasy są w `src/app/`**, co odpowiada roli starego `pages/`.

| Ścieżka | Opis |
|--------|------|
| `src/app/` | Trasy (`page.tsx`), layouty, `api/*/route.ts` |
| `src/components/` | Komponenty React |
| `supabase/migrations/` | SQL migracji (Auth + tabele + RLS) |

## Uwagi prawne

Aplikacja ma charakter informacyjny i nie zastępuje porady lekarskiej ani dietetyka. Użytkownik ponosi odpowiedzialność za decyzje żywieniowe.

## Autor / kontakt

Repozytorium możesz powiązać z kontem GitHub `dethimnow` i emailem `p_madejski@o2.pl` w ustawieniach Git oraz w profilu Vercel.
