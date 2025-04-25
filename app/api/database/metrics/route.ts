import { NextResponse } from "next/server"
import { getDatabaseMetrics } from "@/lib/db"

// Specify that this route should use the Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    const data = await getDatabaseMetrics()

    return NextResponse.json({
      success: true,
      data: data || [], // Ensure we always return an array
    })
  } catch (error) {
    console.error("Failed to fetch database metrics:", error)

    // Return empty array as fallback
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        data: [], // Always include data, even on error
      },
      { status: 500 },
    )
  }
}
