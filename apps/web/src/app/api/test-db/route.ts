import { db } from "@/lib/db";

export async function GET() {
  try {
    // Simple query to test connection
    const result = await db.execute("SELECT 1 as test");
    return Response.json({ success: true, result });
  } catch (error) {
    console.error("Database test failed:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
