import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getSessionFromCookies } from "@/lib/auth-service"
import { getConnection } from "@/lib/db"
import sql from "mssql"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = getSessionFromCookies()
    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const currentUser = await getCurrentUser(sessionId)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Invalid or expired session" }, { status: 401 })
    }

    // Get time range from query params
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get("timeRange") || "1h"

    // Calculate time periods
    const now = new Date()
    let startDate: Date
    let interval: string

    switch (timeRange) {
      case "15m":
        startDate = new Date(now.getTime() - 15 * 60 * 1000)
        interval = "MINUTE"
        break
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        interval = "MINUTE"
        break
      case "6h":
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        interval = "HOUR"
        break
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        interval = "HOUR"
        break
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        interval = "DAY"
        break
      default:
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        interval = "MINUTE"
    }

    const pool = await getConnection()

    // Get active users over time
    const activeUsersResult = await pool
      .request()
      .input("start_date", sql.DateTime, startDate)
      .query(`
        SELECT 
          CASE 
            WHEN '${interval}' = 'MINUTE' THEN FORMAT(created_at, 'yyyy-MM-dd HH:mm')
            WHEN '${interval}' = 'HOUR' THEN FORMAT(created_at, 'yyyy-MM-dd HH:00')
            ELSE FORMAT(created_at, 'yyyy-MM-dd')
          END as time,
          COUNT(DISTINCT user_id) as activeUsers,
          SUM(CASE WHEN created_at = last_login THEN 1 ELSE 0 END) as newUsers
        FROM Sessions
        WHERE created_at > @start_date
        GROUP BY 
          CASE 
            WHEN '${interval}' = 'MINUTE' THEN FORMAT(created_at, 'yyyy-MM-dd HH:mm')
            WHEN '${interval}' = 'HOUR' THEN FORMAT(created_at, 'yyyy-MM-dd HH:00')
            ELSE FORMAT(created_at, 'yyyy-MM-dd')
          END
        ORDER BY time
      `)

    // Get activity types breakdown
    const activityTypesResult = await pool
      .request()
      .input("start_date", sql.DateTime, startDate)
      .query(`
        SELECT 
          'LLM Request' as type,
          COUNT(*) as count
        FROM LlmRequests
        WHERE created_at > @start_date
        UNION ALL
        SELECT 
          'Database Query' as type,
          COUNT(*) as count
        FROM DatabaseQueries
        WHERE created_at > @start_date
        UNION ALL
        SELECT 
          'Login' as type,
          COUNT(*) as count
        FROM Sessions
        WHERE created_at > @start_date
        ORDER BY count DESC
      `)

    // Get recent user activity
    const recentActivityResult = await pool.request().query(`
        SELECT TOP 10
          u.username,
          u.email,
          'LLM Request' as type,
          CONCAT('Model: ', r.model_name, ', Tokens: ', r.tokens_total) as details,
          FORMAT(r.created_at, 'yyyy-MM-dd HH:mm:ss') as time
        FROM LlmRequests r
        JOIN Users u ON r.user_id = u.user_id
        UNION ALL
        SELECT TOP 10
          u.username,
          u.email,
          'Database Query' as type,
          CONCAT(SUBSTRING(q.query_text, 1, 50), '...') as details,
          FORMAT(q.created_at, 'yyyy-MM-dd HH:mm:ss') as time
        FROM DatabaseQueries q
        JOIN Users u ON q.user_id = u.user_id
        ORDER BY time DESC
      `)

    // Combine the data
    const activeUsersData = activeUsersResult.recordset
    const activityTypesData = activityTypesResult.recordset
    const recentActivityData = recentActivityResult.recordset

    // Create a combined dataset
    const data = [
      ...activeUsersData,
      ...activityTypesData.map((item) => ({ ...item, activityTypes: true })),
      { recentActivity: recentActivityData, hasRecentActivity: true },
    ]

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error getting user activity analytics:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
