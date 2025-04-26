import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const result = await registerUser(username, email, password)

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    console.error("Error in register API:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
