import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { query, name, description } = await request.json()

    // Insert the query into the saved_queries table
    const insertQuery = `
      INSERT INTO saved_queries (name, query_text, description, created_at, username)
      VALUES (@param0, @param1, @param2, GETDATE(), SYSTEM_USER)
    `

    await executeQuery(insertQuery, [name || `Query ${new Date().toISOString()}`, query, description || ""])

    return NextResponse.json({
      success: true,
      message: "Query saved successfully",
    })
  } catch (error) {
    console.error("Failed to save query:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
