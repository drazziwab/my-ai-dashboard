import { NextResponse } from "next/server"
import { executeQuery, saveQueryHistory } from "@/lib/db"

// Specify that this route should use the Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required",
        },
        { status: 400 },
      )
    }

    const startTime = Date.now()
    const result = await executeQuery(query)
    const duration = Date.now() - startTime

    // Save query to history
    await saveQueryHistory(query, "success", duration, result.length)

    return NextResponse.json({
      success: true,
      result,
      metadata: {
        rowCount: result.length,
        duration,
      },
    })
  } catch (error) {
    console.error("Failed to execute query:", error)

    // Save failed query to history
    try {
      await saveQueryHistory((error as any).query || "Unknown query", "error", 0, 0)
    } catch (saveError) {
      console.error("Failed to save query history:", saveError)
    }

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
