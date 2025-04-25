import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Delete the query from the query_history table
    const deleteQuery = `
      DELETE FROM query_history
      WHERE id = @param0
    `

    await executeQuery(deleteQuery, [id])

    return NextResponse.json({
      success: true,
      message: "Query deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete query:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
