import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { dietPayloadSchema, type DietPayload } from "@/types/diet";
import { DietResultView } from "@/components/diet/DietResultView";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Dieta ${id.slice(0, 8)}…` };
}

export default async function DietDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie");

  const { data: row } = await supabase
    .from("diet_plans")
    .select("id, title, payload")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) notFound();

  const parsed = dietPayloadSchema.safeParse(row.payload);
  if (!parsed.success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-muted">Nie udało się odczytać zapisanej diety.</p>
        <Link href="/panel" className="mt-4 inline-block text-primary hover:underline">
          Wróć do panelu
        </Link>
      </div>
    );
  }

  const payload = parsed.data as DietPayload;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/panel" className="text-sm font-medium text-primary hover:underline">
        ← Panel
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">{row.title}</h1>
      <div className="mt-6">
        <DietResultView payload={payload} />
      </div>
    </div>
  );
}
