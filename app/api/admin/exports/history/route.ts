import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getSessionFromCookies } from "@/lib/auth-service"
import { getConnection } from "@/lib/db"
import sql from "mssql"

export async function GET(request: NextRequest) {
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

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, currentUser.user_id)
      .query(`
        SELECT TOP 20 export_id, type, format, start_date, end_date, 
               row_count, size_kb, created_at
        FROM DataExports
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `)

    return NextResponse.json({
      success: true,
      exports: result.recordset,
    })
  } catch (error) {
    console.error("Error getting export history:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
