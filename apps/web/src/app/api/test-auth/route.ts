import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("Auth test started");

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log("Session:", session);

    return Response.json({
      success: true,
      message: "Auth test completed",
      url: request.url,
    });
  } catch (error) {
    console.error("Auth test failed:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
