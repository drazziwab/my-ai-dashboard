import { NextResponse } from "next/server"
import { getRecentQueries } from "@/lib/db"

// Specify that this route should use the Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    const queries = await getRecentQueries()

    return NextResponse.json({
      success: true,
      queries,
    })
  } catch (error) {
    console.error("Failed to fetch recent queries:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
