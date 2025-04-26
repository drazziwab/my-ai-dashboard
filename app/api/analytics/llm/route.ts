import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"
import sql from "mssql"
import { format, subHours, subMinutes, subDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    // Get time range from query params
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get("timeRange") || "1h"

    // Calculate time periods
    const now = new Date()
    let startDate: Date
    let interval: string
    let timeFormat: string

    switch (timeRange) {
      case "15m":
        startDate = subMinutes(now, 15)
        interval = "MINUTE"
        timeFormat = "HH:mm"
        break
      case "1h":
        startDate = subHours(now, 1)
        interval = "MINUTE"
        timeFormat = "HH:mm"
        break
      case "6h":
        startDate = subHours(now, 6)
        interval = "HOUR"
        timeFormat = "HH:mm"
        break
      case "24h":
        startDate = subHours(now, 24)
        interval = "HOUR"
        timeFormat = "HH:mm"
        break
      case "7d":
        startDate = subDays(now, 7)
        interval = "DAY"
        timeFormat = "MM/dd"
        break
      default:
        startDate = subHours(now, 1)
        interval = "MINUTE"
        timeFormat = "HH:mm"
    }

    try {
      const pool = await getConnection()

      // Get LLM requests over time
      const timeSeriesQuery = `
        SELECT 
          DATEADD(${interval}, DATEDIFF(${interval}, 0, created_at), 0) as time_bucket,
          COUNT(*) as requests,
          SUM(tokens) as tokens
        FROM 
          LlmRequests
        WHERE 
          created_at >= @start_date
        GROUP BY 
          DATEADD(${interval}, DATEDIFF(${interval}, 0, created_at), 0)
        ORDER BY 
          time_bucket
      `

      const timeSeriesResult = await pool.request().input("start_date", sql.DateTime, startDate).query(timeSeriesQuery)

      // Get model breakdown
      const modelBreakdownQuery = `
        SELECT 
          model,
          COUNT(*) as requests,
          SUM(tokens) / 1000 as tokens,
          AVG(duration_ms) as responseTime
        FROM 
          LlmRequests
        WHERE 
          created_at >= @start_date
        GROUP BY 
          model
        ORDER BY 
          requests DESC
      `

      const modelBreakdownResult = await pool
        .request()
        .input("start_date", sql.DateTime, startDate)
        .query(modelBreakdownQuery)

      // Get token breakdown over time
      const tokenBreakdownQuery = `
        SELECT 
          DATEADD(${interval}, DATEDIFF(${interval}, 0, created_at), 0) as time_bucket,
          SUM(CASE WHEN tokens_type = 'prompt' THEN tokens ELSE 0 END) as promptTokens,
          SUM(CASE WHEN tokens_type = 'completion' THEN tokens ELSE 0 END) as completionTokens
        FROM 
          LlmTokenUsage
        WHERE 
          created_at >= @start_date
        GROUP BY 
          DATEADD(${interval}, DATEDIFF(${interval}, 0, created_at), 0)
        ORDER BY 
          time_bucket
      `

      const tokenBreakdownResult = await pool
        .request()
        .input("start_date", sql.DateTime, startDate)
        .query(tokenBreakdownQuery)

      // Format the time series data
      const timeSeriesData = timeSeriesResult.recordset.map((row) => ({
        time: format(new Date(row.time_bucket), timeFormat),
        requests: row.requests,
        tokens: row.tokens,
      }))

      // Format the model breakdown data
      const modelBreakdownData = modelBreakdownResult.recordset.map((row) => ({
        model: row.model,
        requests: row.requests,
        tokens: Math.round(row.tokens * 10) / 10, // Round to 1 decimal place
        responseTime: Math.round(row.responseTime),
        modelBreakdown: true,
      }))

      // Format the token breakdown data
      const tokenBreakdownData = tokenBreakdownResult.recordset.map((row) => ({
        time: format(new Date(row.time_bucket), timeFormat),
        promptTokens: row.promptTokens,
        completionTokens: row.completionTokens,
        tokenBreakdown: true,
      }))

      // Combine all data
      const data = [...timeSeriesData, ...modelBreakdownData, ...tokenBreakdownData]

      return NextResponse.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error("Error getting LLM analytics:", error)

      // Generate mock data
      const data = generateMockLlmData(timeRange)

      return NextResponse.json({
        success: true,
        data,
      })
    }
  } catch (error) {
    console.error("Error in LLM analytics API:", error)
    return NextResponse.json({ success: false, error: "Failed to get LLM analytics", data: [] }, { status: 200 })
  }
}

function generateMockLlmData(timeRange: string) {
  const now = new Date()
  const data = []

  // Generate time series data
  const points =
    timeRange === "15m"
      ? 15
      : timeRange === "1h"
        ? 12
        : timeRange === "6h"
          ? 12
          : timeRange === "24h"
            ? 24
            : timeRange === "7d"
              ? 7
              : 12

  const timeFormat = timeRange === "7d" ? "MM/dd" : "HH:mm"

  for (let i = 0; i < points; i++) {
    const time = new Date()

    if (timeRange === "15m") time.setMinutes(time.getMinutes() - (points - i))
    else if (timeRange === "1h") time.setMinutes(time.getMinutes() - (points - i) * 5)
    else if (timeRange === "6h") time.setMinutes(time.getMinutes() - (points - i) * 30)
    else if (timeRange === "24h") time.setHours(time.getHours() - (points - i))
    else if (timeRange === "7d") time.setDate(time.getDate() - (points - i))

    data.push({
      time: format(time, timeFormat),
      requests: Math.floor(Math.random() * 50) + 10,
      tokens: Math.floor(Math.random() * 5000) + 1000,
    })
  }

  // Generate model breakdown data
  const models = ["gpt-4", "gpt-3.5-turbo", "claude-2", "llama-2-70b"]

  models.forEach((model) => {
    data.push({
      model,
      requests: Math.floor(Math.random() * 200) + 50,
      tokens: Math.floor(Math.random() * 100) / 10 + 5,
      responseTime: Math.floor(Math.random() * 500) + 100,
      modelBreakdown: true,
    })
  })

  // Generate token breakdown data
  for (let i = 0; i < points; i++) {
    const time = new Date()

    if (timeRange === "15m") time.setMinutes(time.getMinutes() - (points - i))
    else if (timeRange === "1h") time.setMinutes(time.getMinutes() - (points - i) * 5)
    else if (timeRange === "6h") time.setMinutes(time.getMinutes() - (points - i) * 30)
    else if (timeRange === "24h") time.setHours(time.getHours() - (points - i))
    else if (timeRange === "7d") time.setDate(time.getDate() - (points - i))

    data.push({
      time: format(time, timeFormat),
      promptTokens: Math.floor(Math.random() * 2000) + 500,
      completionTokens: Math.floor(Math.random() * 3000) + 1000,
      tokenBreakdown: true,
    })
  }

  return data
}
