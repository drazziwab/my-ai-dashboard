import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getSessionFromCookies } from "@/lib/auth-service"
import { getConnection } from "@/lib/db"
import sql from "mssql"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const sessionId = getSessionFromCookies()
    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const currentUser = await getCurrentUser(sessionId)
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const userId = params.id
    const pool = await getConnection()

    // Get user sessions
    const sessionsResult = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT session_id, created_at, expires_at, ip_address, user_agent
        FROM Sessions
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `)

    // Get LLM requests
    const llmResult = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT TOP 20 request_id, model_name, tokens_total, duration_ms, created_at
        FROM LlmRequests
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `)

    // Get database queries
    const dbResult = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT TOP 20 query_id, SUBSTRING(query_text, 1, 100) as query_text, execution_time_ms, rows_affected, created_at, status
        FROM DatabaseQueries
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `)

    // Combine all activity
    const activity = [
      ...sessionsResult.recordset.map((session) => ({
        type: "Login Session",
        details: `Session from ${session.ip_address || "unknown IP"}`,
        timestamp: session.created_at,
      })),
      ...llmResult.recordset.map((req) => ({
        type: "LLM Request",
        details: `Model: ${req.model_name}, Tokens: ${req.tokens_total}`,
        timestamp: req.created_at,
      })),
      ...dbResult.recordset.map((query) => ({
        type: "Database Query",
        details: `${query.query_text}... (${query.status})`,
        timestamp: query.created_at,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error("Error getting user activity:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
