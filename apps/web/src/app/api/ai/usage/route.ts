import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIUsage, getActiveSubscription } from "@/lib/db/queries";
import { APIError } from "@/types/api";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession(request);

    if (!session || !session.user.id) {
      const error: APIError = {
        message: "You must be logged in to check AI usage",
        status: 401,
        code: "AUTH_REQUIRED",
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Get both AI usage and subscription data
    const [aiUsageData, subscriptionData] = await Promise.all([
      getAIUsage(session.user.id),
      getActiveSubscription(session.user.id),
    ]);

    // Default limit based on plan AND status
    const limit =
      subscriptionData?.plan === "plus" &&
      ["active", "trialing", "past_due"].includes(
        subscriptionData?.status || ""
      )
        ? 1000
        : 10;

    // If no usage data found, return default values
    if (!aiUsageData) {
      return NextResponse.json({
        usage: {
          current: 0,
          limit,
          plan: subscriptionData?.plan || "free",
          nextReset: null,
        },
      });
    }

    return NextResponse.json({
      usage: {
        current: aiUsageData?.count || 0,
        limit,
        plan: subscriptionData?.plan || "free",
        nextReset: aiUsageData?.resetAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("[AI Usage API Error]", error);

    // Return detailed error in development
    if (process.env.NODE_ENV === "development" && error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
          stack: error.stack,
          status: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "An error occurred while fetching AI usage",
        status: 500,
      },
      { status: 500 }
    );
  }
}
