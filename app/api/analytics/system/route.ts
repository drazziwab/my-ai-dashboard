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

    // Get system metrics over time
    const timeSeriesResult = await pool
      .request()
      .input("start_date", sql.DateTime, startDate)
      .query(`
        SELECT 
          CASE 
            WHEN '${interval}' = 'MINUTE' THEN FORMAT(recorded_at, 'yyyy-MM-dd HH:mm')
            WHEN '${interval}' = 'HOUR' THEN FORMAT(recorded_at, 'yyyy-MM-dd HH:00')
            ELSE FORMAT(recorded_at, 'yyyy-MM-dd')
          END as time,
          AVG(cpu_usage) as cpu,
          AVG(ram_usage) as ram,
          AVG(gpu_usage) as gpu,
          AVG(disk_usage) as disk
        FROM SystemMetrics
        WHERE recorded_at > @start_date
        GROUP BY 
          CASE 
            WHEN '${interval}' = 'MINUTE' THEN FORMAT(recorded_at, 'yyyy-MM-dd HH:mm')
            WHEN '${interval}' = 'HOUR' THEN FORMAT(recorded_at, 'yyyy-MM-dd HH:00')
            ELSE FORMAT(recorded_at, 'yyyy-MM-dd')
          END
        ORDER BY time
      `)

    // Get current system statuses
    const statusesResult = await pool.request().query(`
        SELECT 
          system_name as name,
          is_online as isOnline,
          response_time_ms as responseTime,
          error_message as error,
          last_checked as lastChecked
        FROM SystemStatus
      `)

    // Combine the data
    const timeSeriesData = timeSeriesResult.recordset
    const statusesData = statusesResult.recordset

    // Create a combined dataset
    const data = [...timeSeriesData, { statuses: statusesData, hasStatuses: true }]

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error getting system analytics:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
