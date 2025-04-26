import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth-service"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { usernameOrEmail, password } = await request.json()

    if (!usernameOrEmail || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const result = await loginUser(usernameOrEmail, password)

    if (result.success && result.session_id) {
      // Set session cookie
      cookies().set({
        name: "session_id",
        value: result.session_id,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "strict",
      })

      // Don't return the session_id in the response
      const { session_id, ...responseData } = result
      return NextResponse.json(responseData)
    }

    return NextResponse.json(result, { status: result.success ? 200 : 401 })
  } catch (error) {
    console.error("Error in login API:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
