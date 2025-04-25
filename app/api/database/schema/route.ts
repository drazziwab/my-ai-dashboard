import { NextResponse } from "next/server"
import { getDatabaseSchema } from "@/lib/db"

// Specify that this route should use the Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    const schema = await getDatabaseSchema()

    return NextResponse.json({
      success: true,
      schema,
    })
  } catch (error) {
    console.error("Failed to fetch database schema:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
