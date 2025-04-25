import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

// Specify that this route should use the Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    const result = await testConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to test database connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
