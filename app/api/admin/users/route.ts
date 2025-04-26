import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getSessionFromCookies } from "@/lib/auth-service"
import { getConnection } from "@/lib/db"
import { generateSalt, hashPassword } from "@/lib/auth-service"
import sql from "mssql"

// Get all users
export async function GET(request: NextRequest) {
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

    const pool = await getConnection()
    const result = await pool.request().query(`
      SELECT user_id, username, email, role, is_active, created_at, last_login
      FROM Users
      ORDER BY username
    `)

    return NextResponse.json({
      success: true,
      users: result.recordset,
    })
  } catch (error) {
    console.error("Error getting users:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}

// Create a new user
export async function POST(request: NextRequest) {
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

    const { username, email, password, role, is_active } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const pool = await getConnection()

    // Check if username or email already exists
    const checkResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .query("SELECT user_id FROM Users WHERE username = @username OR email = @email")

    if (checkResult.recordset.length > 0) {
      return NextResponse.json({ success: false, message: "Username or email already exists" }, { status: 400 })
    }

    // Generate salt and hash password
    const salt = generateSalt()
    const passwordHash = hashPassword(password, salt)

    // Insert new user
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password_hash", sql.NVarChar, passwordHash)
      .input("salt", sql.NVarChar, salt)
      .input("role", sql.NVarChar, role || "user")
      .input("is_active", sql.Bit, is_active === false ? 0 : 1)
      .query(`
        INSERT INTO Users (username, email, password_hash, salt, role, is_active, created_at)
        OUTPUT INSERTED.user_id
        VALUES (@username, @email, @password_hash, @salt, @role, @is_active, GETDATE())
      `)

    const user_id = result.recordset[0].user_id

    // Log the action
    await pool
      .request()
      .input("user_id", sql.Int, currentUser.user_id)
      .input("action_type", sql.NVarChar, "USER_CREATED")
      .input("details", sql.NVarChar, `Created user: ${username} (${email})`)
      .input("target_id", sql.Int, user_id)
      .query(`
        INSERT INTO AdminLogs (user_id, action_type, details, target_id, timestamp)
        VALUES (@user_id, @action_type, @details, @target_id, GETDATE())
      `)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user_id,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
