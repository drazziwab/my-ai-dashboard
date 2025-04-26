import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getCurrentUser, getSessionFromCookies, logDatabaseQuery } from "@/lib/auth-service"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const sessionId = getSessionFromCookies()
    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getCurrentUser(sessionId)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired session" }, { status: 401 })
    }

    const { query, params = [] } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, message: "Query is required" }, { status: 400 })
    }

    // Start timing
    const startTime = Date.now()

    try {
      const result = await executeQuery(query, params)

      // Calculate duration
      const duration = Date.now() - startTime

      // Log the successful query
      await logDatabaseQuery(user.user_id, query, duration, result.length || 0, "success")

      return NextResponse.json({
        success: true,
        data: result,
        rowCount: result.length,
        executionTime: duration,
      })
    } catch (error) {
      // Calculate duration
      const duration = Date.now() - startTime

      // Log the failed query
      await logDatabaseQuery(user.user_id, query, duration, 0, "error", (error as Error).message)

      return NextResponse.json(
        {
          success: false,
          message: (error as Error).message,
          query,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in database query API:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
