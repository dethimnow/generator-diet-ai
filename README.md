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

## Supabase — projekt pod ten kod

Używany projekt w organizacji **dethimnow’s Org**:

| | |
|---|---|
| **Nazwa** | Generator Diet AI |
| **Ref** | `zzvkmrhvezsyrmwcntgh` |
| **URL** | `https://zzvkmrhvezsyrmwcntgh.supabase.co` |

Migracja schematu jest już zastosowana w tym projekcie. W **Settings → API** skopiuj **anon** (legacy JWT) i **service_role** do zmiennych środowiskowych.

**Uwaga (plan Free):** przed utworzeniem tego projektu wstrzymany został projekt **„Build The Tower of Today”** (limit 2 aktywnych projektów). Możesz go **Restore** w panelu Supabase, jeśli masz miejsce na koncie.

## Uruchomienie lokalne

1. Sklonuj repozytorium i zainstaluj zależności:

```bash
npm install
```

2. Skopiuj `.env.example` do `.env.local` i uzupełnij zmienne (URL + anon + service_role z projektu powyżej, `OPENAI_API_KEY`).

3. Migracja w repozytorium (`supabase/migrations/20260328000000_init.sql`) jest zsynchronizowana z projektem Supabase — nie musisz jej ponownie uruchamiać, chyba że zakładasz **nową** instancję.

4. W Supabase → **Authentication → URL Configuration** ustaw:

- **Site URL (prod):** `https://generator-diet-ai.vercel.app` (lokalnie: `http://localhost:3000`)
- **Redirect URLs:** dodaj  
  `https://generator-diet-ai.vercel.app/auth/callback` oraz `http://localhost:3000/auth/callback`

5. Start dev:

```bash
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel + GitHub

**Repozytorium:** [github.com/dethimnow/generator-diet-ai](https://github.com/dethimnow/generator-diet-ai)

**Produkcja (Vercel):** [generator-diet-ai.vercel.app](https://generator-diet-ai.vercel.app)

1. Klon / push (już skonfigurowane):

```bash
git remote add origin https://github.com/dethimnow/generator-diet-ai.git
git push -u origin main
```

2. Projekt Vercel jest połączony z tym repozytorium — każdy push na `main` uruchamia build.

3. W **Settings → Environment Variables** ustaw m.in.:

   - `NEXT_PUBLIC_SUPABASE_URL` = `https://zzvkmrhvezsyrmwcntgh.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = klucz **anon** z Supabase → Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` = **service_role** (sekret — tylko Vercel, nie w repo)
   - `OPENAI_API_KEY` = klucz OpenAI (opcjonalnie na Vercel; **generowanie diet działa w Edge Function**)
   - `NEXT_PUBLIC_APP_URL` = `https://generator-diet-ai.vercel.app` (już ustawione na Vercel)

4. **Supabase Edge Function `diet-generate`** (generowanie AI — omija limit ~10 s Vercel Hobby):

   - Kod funkcji: `supabase/functions/diet-generate/index.ts` (wdrożenie: `supabase functions deploy diet-generate` albo panel Supabase).
   - W Supabase → **Edge Functions → Secrets** ustaw **`OPENAI_API_KEY`** (ten sam klucz co w OpenAI). Opcjonalnie **`OPENAI_MODEL`** (domyślnie `gpt-4o-mini`).
   - Bez tego sekretu plan zostaje w stanie `pending`, a w logach funkcji widać błąd braku klucza.

5. **Stripe (opcjonalnie)**

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
