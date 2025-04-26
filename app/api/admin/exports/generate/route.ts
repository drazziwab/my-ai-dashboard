import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getSessionFromCookies } from "@/lib/auth-service"
import { getConnection } from "@/lib/db"
import sql from "mssql"
import { createObjectCsvStringifier } from "csv-writer"
import ExcelJS from "exceljs"

export async function POST(request: NextRequest) {
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

    const { exportType, format, startDate, endDate, includeHeaders } = await request.json()

    if (!exportType || !format || !startDate || !endDate) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const pool = await getConnection()

    // Get data based on export type
    let data: any[] = []
    let headers: { id: string; title: string }[] = []

    switch (exportType) {
      case "llm_requests":
        headers = [
          { id: "request_id", title: "Request ID" },
          { id: "user_id", title: "User ID" },
          { id: "username", title: "Username" },
          { id: "model_name", title: "Model" },
          { id: "tokens_prompt", title: "Prompt Tokens" },
          { id: "tokens_completion", title: "Completion Tokens" },
          { id: "tokens_total", title: "Total Tokens" },
          { id: "duration_ms", title: "Duration (ms)" },
          { id: "created_at", title: "Timestamp" },
        ]
        const llmResult = await pool
          .request()
          .input("start_date", sql.DateTime, new Date(startDate))
          .input("end_date", sql.DateTime, new Date(endDate))
          .query(`
            SELECT r.request_id, r.user_id, u.username, r.model_name, 
                   r.tokens_prompt, r.tokens_completion, r.tokens_total, 
                   r.duration_ms, r.created_at
            FROM LlmRequests r
            JOIN Users u ON r.user_id = u.user_id
            WHERE r.created_at BETWEEN @start_date AND @end_date
            ORDER BY r.created_at DESC
          `)
        data = llmResult.recordset
        break

      case "database_queries":
        headers = [
          { id: "query_id", title: "Query ID" },
          { id: "user_id", title: "User ID" },
          { id: "username", title: "Username" },
          { id: "query_text", title: "Query" },
          { id: "execution_time_ms", title: "Execution Time (ms)" },
          { id: "rows_affected", title: "Rows Affected" },
          { id: "status", title: "Status" },
          { id: "created_at", title: "Timestamp" },
        ]
        const dbResult = await pool
          .request()
          .input("start_date", sql.DateTime, new Date(startDate))
          .input("end_date", sql.DateTime, new Date(endDate))
          .query(`
            SELECT q.query_id, q.user_id, u.username, q.query_text, 
                   q.execution_time_ms, q.rows_affected, q.status, q.created_at
            FROM DatabaseQueries q
            JOIN Users u ON q.user_id = u.user_id
            WHERE q.created_at BETWEEN @start_date AND @end_date
            ORDER BY q.created_at DESC
          `)
        data = dbResult.recordset
        break

      case "system_metrics":
        headers = [
          { id: "metric_id", title: "Metric ID" },
          { id: "recorded_at", title: "Timestamp" },
          { id: "cpu_usage", title: "CPU Usage (%)" },
          { id: "ram_usage", title: "RAM Usage (%)" },
          { id: "gpu_usage", title: "GPU Usage (%)" },
          { id: "disk_usage", title: "Disk Usage (%)" },
          { id: "network_in_kbps", title: "Network In (Kbps)" },
          { id: "network_out_kbps", title: "Network Out (Kbps)" },
        ]
        const metricsResult = await pool
          .request()
          .input("start_date", sql.DateTime, new Date(startDate))
          .input("end_date", sql.DateTime, new Date(endDate))
          .query(`
            SELECT metric_id, recorded_at, cpu_usage, ram_usage, gpu_usage, 
                   disk_usage, network_in_kbps, network_out_kbps
            FROM SystemMetrics
            WHERE recorded_at BETWEEN @start_date AND @end_date
            ORDER BY recorded_at DESC
          `)
        data = metricsResult.recordset
        break

      case "user_activity":
        headers = [
          { id: "user_id", title: "User ID" },
          { id: "username", title: "Username" },
          { id: "email", title: "Email" },
          { id: "activity_type", title: "Activity Type" },
          { id: "details", title: "Details" },
          { id: "timestamp", title: "Timestamp" },
        ]
        const activityResult = await pool
          .request()
          .input("start_date", sql.DateTime, new Date(startDate))
          .input("end_date", sql.DateTime, new Date(endDate))
          .query(`
            SELECT u.user_id, u.username, u.email, 'LLM Request' as activity_type,
                   CONCAT('Model: ', r.model_name, ', Tokens: ', r.tokens_total) as details,
                   r.created_at as timestamp
            FROM LlmRequests r
            JOIN Users u ON r.user_id = u.user_id
            WHERE r.created_at BETWEEN @start_date AND @end_date
            UNION ALL
            SELECT u.user_id, u.username, u.email, 'Database Query' as activity_type,
                   CONCAT(SUBSTRING(q.query_text, 1, 100), '...') as details,
                   q.created_at as timestamp
            FROM DatabaseQueries q
            JOIN Users u ON q.user_id = u.user_id
            WHERE q.created_at BETWEEN @start_date AND @end_date
            UNION ALL
            SELECT u.user_id, u.username, u.email, 'Login' as activity_type,
                   CONCAT('From IP: ', s.ip_address) as details,
                   s.created_at as timestamp
            FROM Sessions s
            JOIN Users u ON s.user_id = u.user_id
            WHERE s.created_at BETWEEN @start_date AND @end_date
            ORDER BY timestamp DESC
          `)
        data = activityResult.recordset
        break

      case "system_status":
        headers = [
          { id: "status_id", title: "Status ID" },
          { id: "system_name", title: "System" },
          { id: "is_online", title: "Online" },
          { id: "last_checked", title: "Last Checked" },
          { id: "response_time_ms", title: "Response Time (ms)" },
          { id: "error_message", title: "Error Message" },
        ]
        const statusResult = await pool
          .request()
          .input("start_date", sql.DateTime, new Date(startDate))
          .input("end_date", sql.DateTime, new Date(endDate))
          .query(`
            SELECT status_id, system_name, is_online, last_checked, 
                   response_time_ms, error_message
            FROM SystemStatus
            WHERE last_checked BETWEEN @start_date AND @end_date
            ORDER BY last_checked DESC
          `)
        data = statusResult.recordset
        break

      default:
        return NextResponse.json({ success: false, message: "Invalid export type" }, { status: 400 })
    }

    // Format data based on requested format
    let exportData: Buffer | string
    let contentType: string
    let filename: string

    switch (format) {
      case "csv":
        const csvStringifier = createObjectCsvStringifier({
          header: includeHeaders ? headers : [],
        })
        const csvHeader = includeHeaders ? csvStringifier.getHeaderString() : ""
        const csvRows = csvStringifier.stringifyRecords(data)
        exportData = csvHeader + csvRows
        contentType = "text/csv"
        filename = `${exportType}_${new Date().toISOString().split("T")[0]}.csv`
        break

      case "json":
        exportData = JSON.stringify(data, null, 2)
        contentType = "application/json"
        filename = `${exportType}_${new Date().toISOString().split("T")[0]}.json`
        break

      case "xlsx":
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Data")

        // Add headers if requested
        if (includeHeaders) {
          worksheet.columns = headers.map((header) => ({
            header: header.title,
            key: header.id,
            width: 20,
          }))
        }

        // Add rows
        worksheet.addRows(data)

        // Generate Excel file
        exportData = (await workbook.xlsx.writeBuffer()) as Buffer
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = `${exportType}_${new Date().toISOString().split("T")[0]}.xlsx`
        break

      default:
        return NextResponse.json({ success: false, message: "Invalid format" }, { status: 400 })
    }

    // Log the export
    const sizeKb = Buffer.isBuffer(exportData)
      ? Math.round(exportData.length / 1024)
      : Math.round(Buffer.from(exportData).length / 1024)

    const exportResult = await pool
      .request()
      .input("user_id", sql.Int, currentUser.user_id)
      .input("type", sql.NVarChar, exportType)
      .input("format", sql.NVarChar, format)
      .input("start_date", sql.DateTime, new Date(startDate))
      .input("end_date", sql.DateTime, new Date(endDate))
      .input("row_count", sql.Int, data.length)
      .input("size_kb", sql.Int, sizeKb)
      .query(`
        INSERT INTO DataExports (user_id, type, format, start_date, end_date, row_count, size_kb, created_at)
        OUTPUT INSERTED.export_id
        VALUES (@user_id, @type, @format, @start_date, @end_date, @row_count, @size_kb, GETDATE())
      `)

    const exportId = exportResult.recordset[0].export_id

    // Return the file
    return new Response(exportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": Buffer.isBuffer(exportData)
          ? exportData.length.toString()
          : Buffer.from(exportData).length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating export:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
