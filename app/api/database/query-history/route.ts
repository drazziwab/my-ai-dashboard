import { NextResponse } from "next/server"
import { getQueryHistory } from "@/lib/db"

export async function GET() {
  try {
    const history = await getQueryHistory()

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error) {
    console.error("Failed to fetch query history:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
