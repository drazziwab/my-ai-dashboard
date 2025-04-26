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

    const exportId = params.id
    const pool = await getConnection()

    // Get export details
    const exportResult = await pool
      .request()
      .input("export_id", sql.Int, exportId)
      .input("user_id", sql.Int, currentUser.user_id)
      .query(`
        SELECT export_id, type, format, created_at
        FROM DataExports
        WHERE export_id = @export_id AND user_id = @user_id
      `)

    if (exportResult.recordset.length === 0) {
      return NextResponse.json({ success: false, message: "Export not found" }, { status: 404 })
    }

    const exportDetails = exportResult.recordset[0]
    const filename = `${exportDetails.type}_${new Date(exportDetails.created_at).toISOString().split("T")[0]}.${exportDetails.format}`

    // In a real implementation, you would retrieve the file from storage
    // For this example, we'll regenerate the export data

    // Get data based on export type
    let data: any[] = []
    let contentType: string

    switch (exportDetails.type) {
      case "llm_requests":
        const llmResult = await pool.request().query(`
            SELECT TOP 1000 r.request_id, r.user_id, u.username, r.model_name, 
                   r.tokens_prompt, r.tokens_completion, r.tokens_total, 
                   r.duration_ms, r.created_at
            FROM LlmRequests r
            JOIN Users u ON r.user_id = u.user_id
            ORDER BY r.created_at DESC
          `)
        data = llmResult.recordset
        break

      case "database_queries":
        const dbResult = await pool.request().query(`
            SELECT TOP 1000 q.query_id, q.user_id, u.username, q.query_text, 
                   q.execution_time_ms, q.rows_affected, q.status, q.created_at
            FROM DatabaseQueries q
            JOIN Users u ON q.user_id = u.user_id
            ORDER BY q.created_at DESC
          `)
        data = dbResult.recordset
        break

      default:
        // For other types, return a simple JSON file
        data = [{ message: "Sample export data" }]
    }

    // Format based on the export format
    let exportData: Buffer | string

    switch (exportDetails.format) {
      case "csv":
        exportData = Object.keys(data[0] || {}).join(",") + "\n"
        exportData += data.map((row) => Object.values(row).join(",")).join("\n")
        contentType = "text/csv"
        break

      case "json":
      default:
        exportData = JSON.stringify(data, null, 2)
        contentType = "application/json"
        break
    }

    // Return the file
    return new Response(exportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading export:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
