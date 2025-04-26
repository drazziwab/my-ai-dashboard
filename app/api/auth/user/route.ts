import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getSessionFromCookies } from "@/lib/auth-service"

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionFromCookies()

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 })
    }

    const user = await getCurrentUser(sessionId)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired session" }, { status: 401 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error in get user API:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
