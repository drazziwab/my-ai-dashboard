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

    // Get DB queries over time
    const timeSeriesResult = await pool
      .request()
      .input("start_date", sql.DateTime, startDate)
      .query(`
        SELECT 
          CASE 
            WHEN '${interval}' = 'MINUTE' THEN FORMAT(created_at, 'yyyy-MM-dd HH:mm')
            WHEN '${interval}' = 'HOUR' THEN FORMAT(created_at, 'yyyy-MM-dd HH:00')
            ELSE FORMAT(created_at, 'yyyy-MM-dd')
          END as time,
          COUNT(*) as queries,
          AVG(execution_time_ms) as duration
        FROM DatabaseQueries
        WHERE created_at > @start_date
        GROUP BY 
          CASE 
            WHEN '${interval}' = 'MINUTE' THEN FORMAT(created_at, 'yyyy-MM-dd HH:mm')
            WHEN '${interval}' = 'HOUR' THEN FORMAT(created_at, 'yyyy-MM-dd HH:00')
            ELSE FORMAT(created_at, 'yyyy-MM-dd')
          END
        ORDER BY time
      `)

    // Get query types breakdown
    // This is a simplified approach - in a real system, you'd have a more sophisticated
    // way to categorize queries (e.g., by parsing the SQL)
    const queryTypesResult = await pool
      .request()
      .input("start_date", sql.DateTime, startDate)
      .query(`
        SELECT 
          CASE 
            WHEN query_text LIKE 'SELECT%' THEN 'SELECT'
            WHEN query_text LIKE 'INSERT%' THEN 'INSERT'
            WHEN query_text LIKE 'UPDATE%' THEN 'UPDATE'
            WHEN query_text LIKE 'DELETE%' THEN 'DELETE'
            ELSE 'OTHER'
          END as type,
          COUNT(*) as count,
          AVG(execution_time_ms) as avgTime
        FROM DatabaseQueries
        WHERE created_at > @start_date
        GROUP BY 
          CASE 
            WHEN query_text LIKE 'SELECT%' THEN 'SELECT'
            WHEN query_text LIKE 'INSERT%' THEN 'INSERT'
            WHEN query_text LIKE 'UPDATE%' THEN 'UPDATE'
            WHEN query_text LIKE 'DELETE%' THEN 'DELETE'
            ELSE 'OTHER'
          END
        ORDER BY count DESC
      `)

    // Get database metrics
    // In a real system, these would come from actual database monitoring
    const metrics = [
      { name: "CPU", value: 65 },
      { name: "RAM", value: 78 },
      { name: "Connections", value: 42 },
      { name: "Queries/s", value: 89 },
      { name: "Cache Hit", value: 92 },
    ]

    // Combine the data
    const timeSeriesData = timeSeriesResult.recordset
    const queryTypesData = queryTypesResult.recordset

    // Create a combined dataset
    const data = [
      ...timeSeriesData,
      ...queryTypesData.map((item) => ({ ...item, queryTypes: true })),
      { metrics, hasMetrics: true },
    ]

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error getting database analytics:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
