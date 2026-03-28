import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) {
    return NextResponse.json({ error: "Brak konfiguracji Stripe" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Brak podpisu" }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Niepoprawny webhook" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      let userId = session.metadata?.supabase_user_id;
      if (!userId && typeof session.subscription === "string") {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        userId = sub.metadata?.supabase_user_id;
      }

      if (userId) {
        await admin
          .from("profiles")
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
            premium_until: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        await admin
          .from("profiles")
          .update({
            is_premium: false,
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Błąd zapisu" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
