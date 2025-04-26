import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getSessionFromCookies, generateSalt, hashPassword } from "@/lib/auth-service"
import { getConnection } from "@/lib/db"
import sql from "mssql"

// Get a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = params.id
    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT user_id, username, email, role, is_active, created_at, last_login
        FROM Users
        WHERE user_id = @user_id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: result.recordset[0],
    })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}

// Update a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = params.id
    const body = await request.json()
    const { username, email, password, role, is_active } = body

    if (!username || !email) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const pool = await getConnection()

    // Check if user exists
    const checkUserResult = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query("SELECT user_id FROM Users WHERE user_id = @user_id")

    if (checkUserResult.recordset.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if username or email already exists for another user
    const checkResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("user_id", sql.Int, userId)
      .query("SELECT user_id FROM Users WHERE (username = @username OR email = @email) AND user_id != @user_id")

    if (checkResult.recordset.length > 0) {
      return NextResponse.json({ success: false, message: "Username or email already exists" }, { status: 400 })
    }

    // Update user
    let requestQuery = pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("role", sql.NVarChar, role)
      .input("is_active", sql.Bit, is_active ? 1 : 0)

    // If password is provided, update it
    if (password) {
      const salt = generateSalt()
      const passwordHash = hashPassword(password, salt)
      requestQuery = requestQuery.input("password_hash", sql.NVarChar, passwordHash).input("salt", sql.NVarChar, salt)
    }

    const updateQuery = password
      ? `
        UPDATE Users
        SET username = @username, email = @email, role = @role, is_active = @is_active,
            password_hash = @password_hash, salt = @salt
        WHERE user_id = @user_id
      `
      : `
        UPDATE Users
        SET username = @username, email = @email, role = @role, is_active = @is_active
        WHERE user_id = @user_id
      `

    await requestQuery.query(updateQuery)

    // Log the action
    await pool
      .request()
      .input("user_id", sql.Int, currentUser.user_id)
      .input("action_type", sql.NVarChar, "USER_UPDATED")
      .input("details", sql.NVarChar, `Updated user: ${username} (${email})`)
      .input("target_id", sql.Int, userId)
      .query(`
        INSERT INTO AdminLogs (user_id, action_type, details, target_id, timestamp)
        VALUES (@user_id, @action_type, @details, @target_id, GETDATE())
      `)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}

// Delete a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = params.id

    // Don't allow deleting yourself
    if (currentUser.user_id.toString() === userId) {
      return NextResponse.json({ success: false, message: "Cannot delete your own account" }, { status: 400 })
    }

    const pool = await getConnection()

    // Get user details for logging
    const userResult = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query("SELECT username, email FROM Users WHERE user_id = @user_id")

    if (userResult.recordset.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const { username, email } = userResult.recordset[0]

    // Delete user's sessions
    await pool.request().input("user_id", sql.Int, userId).query("DELETE FROM Sessions WHERE user_id = @user_id")

    // Delete user
    await pool.request().input("user_id", sql.Int, userId).query("DELETE FROM Users WHERE user_id = @user_id")

    // Log the action
    await pool
      .request()
      .input("user_id", sql.Int, currentUser.user_id)
      .input("action_type", sql.NVarChar, "USER_DELETED")
      .input("details", sql.NVarChar, `Deleted user: ${username} (${email})`)
      .input("target_id", sql.Int, userId)
      .query(`
        INSERT INTO AdminLogs (user_id, action_type, details, target_id, timestamp)
        VALUES (@user_id, @action_type, @details, @target_id, GETDATE())
      `)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 })
  }
}
