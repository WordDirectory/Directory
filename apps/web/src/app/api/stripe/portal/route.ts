import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { getActiveSubscription } from "@/lib/db/queries";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    console.log("[STRIPE PORTAL] Received request");

    const session = await auth.api.getSession(req);
    console.log("[STRIPE PORTAL] Session:", {
      exists: !!session,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      console.log("[STRIPE PORTAL] No session or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription with Stripe customer ID from database
    const subscription = await getActiveSubscription(session.user.id);
    console.log("[STRIPE PORTAL] Found subscription:", {
      exists: !!subscription,
      stripeCustomerId: subscription?.stripeCustomerId,
    });

    if (!subscription?.stripeCustomerId) {
      console.log("[STRIPE PORTAL] No Stripe customer ID found");
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    // Construct proper URL with protocol
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Create portal session
    console.log(
      "[STRIPE PORTAL] Creating portal session for customer:",
      subscription.stripeCustomerId
    );
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });
    console.log("[STRIPE PORTAL] Created portal session:", {
      url: portalSession.url,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[STRIPE PORTAL] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
