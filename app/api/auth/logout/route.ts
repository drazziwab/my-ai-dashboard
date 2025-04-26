import { type NextRequest, NextResponse } from "next/server"
import { logoutUser, getSessionFromCookies } from "@/lib/auth-service"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionFromCookies()

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 })
    }

    const result = await logoutUser(sessionId)

    // Clear the session cookie
    cookies().delete("session_id")

    return NextResponse.json({ success: result, message: result ? "Logged out successfully" : "Failed to logout" })
  } catch (error) {
    console.error("Error in logout API:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
