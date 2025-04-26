import sql from "mssql"
import { getConnection } from "./db"
import { randomBytes, pbkdf2Sync } from "crypto"
import { cookies } from "next/headers"

export interface User {
  user_id: number
  username: string
  email: string
  role: string
}

// Generate a random salt
export function generateSalt(): string {
  return randomBytes(16).toString("hex")
}

// Hash password with salt
export function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
}

// Register a new user
export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message: string; user_id?: number }> {
  try {
    const pool = await getConnection()

    // Check if username or email already exists
    const checkResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .query("SELECT user_id FROM Users WHERE username = @username OR email = @email")

    if (checkResult.recordset.length > 0) {
      return { success: false, message: "Username or email already exists" }
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
      .query(`
        INSERT INTO Users (username, email, password_hash, salt, created_at)
        OUTPUT INSERTED.user_id
        VALUES (@username, @email, @password_hash, @salt, GETDATE())
      `)

    const user_id = result.recordset[0].user_id

    return { success: true, message: "User registered successfully", user_id }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: (error as Error).message }
  }
}

// Login user
export async function loginUser(
  usernameOrEmail: string,
  password: string,
): Promise<{ success: boolean; message: string; user?: User; session_id?: string }> {
  try {
    const pool = await getConnection()

    // Get user by username or email
    const userResult = await pool
      .request()
      .input("identifier", sql.NVarChar, usernameOrEmail)
      .query(`
        SELECT user_id, username, email, password_hash, salt, role
        FROM Users
        WHERE username = @identifier OR email = @identifier
      `)

    if (userResult.recordset.length === 0) {
      return { success: false, message: "Invalid username/email or password" }
    }

    const user = userResult.recordset[0]

    // Verify password
    const passwordHash = hashPassword(password, user.salt)
    if (passwordHash !== user.password_hash) {
      return { success: false, message: "Invalid username/email or password" }
    }

    // Generate session
    const session_id = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Session expires in 7 days

    // Save session
    await pool
      .request()
      .input("session_id", sql.NVarChar, session_id)
      .input("user_id", sql.Int, user.user_id)
      .input("expires_at", sql.DateTime, expiresAt)
      .query(`
        INSERT INTO Sessions (session_id, user_id, created_at, expires_at)
        VALUES (@session_id, @user_id, GETDATE(), @expires_at)
      `)

    // Update last login
    await pool
      .request()
      .input("user_id", sql.Int, user.user_id)
      .query(`
        UPDATE Users
        SET last_login = GETDATE()
        WHERE user_id = @user_id
      `)

    return {
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      session_id,
    }
  } catch (error) {
    console.error("Error logging in:", error)
    return { success: false, message: (error as Error).message }
  }
}

// Get current user from session
export async function getCurrentUser(sessionId: string): Promise<User | null> {
  try {
    const pool = await getConnection()

    const result = await pool
      .request()
      .input("session_id", sql.NVarChar, sessionId)
      .query(`
        SELECT u.user_id, u.username, u.email, u.role
        FROM Users u
        JOIN Sessions s ON u.user_id = s.user_id
        WHERE s.session_id = @session_id AND s.expires_at > GETDATE()
      `)

    if (result.recordset.length === 0) {
      return null
    }

    return result.recordset[0] as User
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Logout user
export async function logoutUser(sessionId: string): Promise<boolean> {
  try {
    const pool = await getConnection()

    await pool
      .request()
      .input("session_id", sql.NVarChar, sessionId)
      .query(`
        DELETE FROM Sessions
        WHERE session_id = @session_id
      `)

    return true
  } catch (error) {
    console.error("Error logging out:", error)
    return false
  }
}

// Get session from cookies
export function getSessionFromCookies(): string | undefined {
  const cookieStore = cookies()
  return cookieStore.get("session_id")?.value
}

// Log LLM request
export async function logLlmRequest(
  userId: number,
  modelName: string,
  prompt: string,
  response: string,
  tokensPrompt: number,
  tokensCompletion: number,
  durationMs: number,
  contextWindow?: number,
  temperature?: number,
  topP?: number,
): Promise<boolean> {
  try {
    const pool = await getConnection()

    await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("model_name", sql.NVarChar, modelName)
      .input("prompt", sql.Text, prompt)
      .input("response", sql.Text, response)
      .input("tokens_prompt", sql.Int, tokensPrompt)
      .input("tokens_completion", sql.Int, tokensCompletion)
      .input("tokens_total", sql.Int, tokensPrompt + tokensCompletion)
      .input("duration_ms", sql.Int, durationMs)
      .input("context_window", sql.Int, contextWindow || null)
      .input("temperature", sql.Float, temperature || null)
      .input("top_p", sql.Float, topP || null)
      .query(`
        INSERT INTO LlmRequests (
          user_id, model_name, prompt, response, tokens_prompt, 
          tokens_completion, tokens_total, duration_ms, created_at,
          context_window, temperature, top_p
        )
        VALUES (
          @user_id, @model_name, @prompt, @response, @tokens_prompt,
          @tokens_completion, @tokens_total, @duration_ms, GETDATE(),
          @context_window, @temperature, @top_p
        )
      `)

    // Update model usage statistics
    const today = new Date().toISOString().split("T")[0]

    await pool
      .request()
      .input("model_name", sql.NVarChar, modelName)
      .input("date_recorded", sql.Date, today)
      .input("tokens", sql.Int, tokensPrompt + tokensCompletion)
      .input("response_time", sql.Int, durationMs)
      .query(`
        MERGE INTO ModelUsage AS target
        USING (SELECT @model_name as model_name, @date_recorded as date_recorded) AS source
        ON target.model_name = source.model_name AND target.date_recorded = source.date_recorded
        WHEN MATCHED THEN
          UPDATE SET 
            total_requests = total_requests + 1,
            total_tokens = total_tokens + @tokens,
            avg_response_time_ms = ((avg_response_time_ms * total_requests) + @response_time) / (total_requests + 1)
        WHEN NOT MATCHED THEN
          INSERT (model_name, date_recorded, total_requests, total_tokens, avg_response_time_ms)
          VALUES (@model_name, @date_recorded, 1, @tokens, @response_time);
      `)

    return true
  } catch (error) {
    console.error("Error logging LLM request:", error)
    return false
  }
}

// Log database query
export async function logDatabaseQuery(
  userId: number,
  queryText: string,
  executionTimeMs: number,
  rowsAffected: number,
  status: string,
  errorMessage?: string,
): Promise<boolean> {
  try {
    const pool = await getConnection()

    await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("query_text", sql.NVarChar, queryText)
      .input("execution_time_ms", sql.Int, executionTimeMs)
      .input("rows_affected", sql.Int, rowsAffected)
      .input("status", sql.NVarChar, status)
      .input("error_message", sql.NVarChar, errorMessage || null)
      .query(`
        INSERT INTO DatabaseQueries (
          user_id, query_text, execution_time_ms, rows_affected, 
          created_at, status, error_message
        )
        VALUES (
          @user_id, @query_text, @execution_time_ms, @rows_affected,
          GETDATE(), @status, @error_message
        )
      `)

    return true
  } catch (error) {
    console.error("Error logging database query:", error)
    return false
  }
}

// Log system metrics
export async function logSystemMetrics(
  cpuUsage: number,
  ramUsage: number,
  diskUsage: number,
  gpuUsage?: number,
  networkInKbps?: number,
  networkOutKbps?: number,
): Promise<boolean> {
  try {
    const pool = await getConnection()

    await pool
      .request()
      .input("cpu_usage", sql.Float, cpuUsage)
      .input("ram_usage", sql.Float, ramUsage)
      .input("gpu_usage", sql.Float, gpuUsage || null)
      .input("disk_usage", sql.Float, diskUsage)
      .input("network_in_kbps", sql.Float, networkInKbps || null)
      .input("network_out_kbps", sql.Float, networkOutKbps || null)
      .query(`
        INSERT INTO SystemMetrics (
          recorded_at, cpu_usage, ram_usage, gpu_usage,
          disk_usage, network_in_kbps, network_out_kbps
        )
        VALUES (
          GETDATE(), @cpu_usage, @ram_usage, @gpu_usage,
          @disk_usage, @network_in_kbps, @network_out_kbps
        )
      `)

    return true
  } catch (error) {
    console.error("Error logging system metrics:", error)
    return false
  }
}

// Update system status
export async function updateSystemStatus(
  systemName: string,
  isOnline: boolean,
  responseTimeMs?: number,
  errorMessage?: string,
): Promise<boolean> {
  try {
    const pool = await getConnection()

    await pool
      .request()
      .input("system_name", sql.NVarChar, systemName)
      .input("is_online", sql.Bit, isOnline ? 1 : 0)
      .input("response_time_ms", sql.Int, responseTimeMs || null)
      .input("error_message", sql.NVarChar, errorMessage || null)
      .query(`
        UPDATE SystemStatus
        SET 
          is_online = @is_online,
          last_checked = GETDATE(),
          response_time_ms = @response_time_ms,
          error_message = @error_message
        WHERE system_name = @system_name
      `)

    return true
  } catch (error) {
    console.error("Error updating system status:", error)
    return false
  }
}

// Get all system statuses
export async function getSystemStatuses(): Promise<any[]> {
  try {
    const pool = await getConnection()

    const result = await pool.request().query(`
        SELECT 
          system_name, is_online, last_checked, 
          response_time_ms, error_message
        FROM SystemStatus
        ORDER BY system_name
      `)

    return result.recordset
  } catch (error) {
    console.error("Error getting system statuses:", error)
    return []
  }
}
