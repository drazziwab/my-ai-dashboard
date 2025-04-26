import sql from "mssql"

// Static database configuration - using environment variables with fallbacks
const config = {
  user: process.env.DB_USER || "anything",
  password: process.env.DB_PASSWORD || "09041986",
  server: process.env.DB_SERVER || "CASH",
  database: process.env.DB_NAME || "LLM_APP",
  options: {
    encrypt: false, // For Azure use true
    trustServerCertificate: true, // Use this for local dev / self-signed certs
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

// Create a connection pool
let pool: sql.ConnectionPool | null = null

export async function getConnection() {
  try {
    if (!pool) {
      pool = await new sql.ConnectionPool(config).connect()
      console.log("Connected to MSSQL database")
    }
    return pool
  } catch (err) {
    console.error("Database connection error:", err)
    // Don't throw, just return null
    return null
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const pool = await getConnection()
    if (!pool) {
      console.error("No database connection available")
      return { recordset: [] }
    }

    const request = pool.request()

    // Add parameters if any
    params.forEach((param, index) => {
      request.input(`param${index}`, param)
    })

    const result = await request.query(query)
    return result
  } catch (err) {
    console.error("Query execution error:", err)
    // Return empty recordset instead of throwing
    return { recordset: [] }
  }
}

export async function closeConnection() {
  if (pool) {
    try {
      await pool.close()
      pool = null
      console.log("Database connection closed")
    } catch (error) {
      console.error("Error closing database connection:", error)
    }
  }
}

// Function to execute a stored procedure
export async function executeStoredProcedure(procedureName: string, params: any = {}) {
  try {
    const connection = await getConnection()
    if (!connection) {
      console.error("No database connection available")
      return { recordset: [] }
    }
    const request = connection.request()

    // Add parameters to the request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value)
    })

    const result = await request.execute(procedureName)
    return result
  } catch (err) {
    console.error("Stored procedure execution error:", err)
    throw err
  }
}

// Function to get database metrics
export async function getDatabaseMetrics() {
  try {
    const result = await executeStoredProcedure("GetDatabaseMetrics")
    return result
  } catch (err) {
    console.error("Error getting database metrics:", err)
    throw err
  }
}

// Export the SQL Server instance for direct use when needed
export { sql }

// Get recent queries with real SQL query
export async function getRecentQueries(): Promise<any[]> {
  const query = `
    SELECT TOP 10
      r.session_id,
      r.start_time,
      r.status,
      r.command,
      r.cpu_time,
      r.total_elapsed_time,
      r.reads,
      r.writes,
      r.logical_reads,
      r.row_count,
      SUBSTRING(t.text, 1, 200) AS query_text,
      s.login_name
    FROM 
      sys.dm_exec_requests r
      CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
      JOIN sys.dm_exec_sessions s ON r.session_id = s.session_id
    WHERE
      r.session_id > 50 -- Exclude system sessions
    ORDER BY 
      r.start_time DESC
  `

  try {
    const result = await executeQuery(query)
    return result.recordset || []
  } catch (err) {
    console.error("Error getting recent queries:", err)
    return []
  }
}

// Function to test the database connection
export async function testConnection(): Promise<{ success: boolean; message?: string; version?: string }> {
  try {
    const pool = await getConnection()
    if (!pool) {
      return { success: false, message: "No database connection available" }
    }
    const result = await pool.request().query("SELECT @@VERSION as version")
    return { success: true, message: "Connection successful", version: result.recordset[0].version }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, message: (error as Error).message }
  }
}

// Function to get database schema
export async function getDatabaseSchema(): Promise<any[]> {
  try {
    const query = `
      SELECT 
        TABLE_NAME AS name,
        TABLE_SCHEMA AS schema
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME;

      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        ORDINAL_POSITION,
        TABLE_SCHEMA,
        CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KU ON TC.CONSTRAINT_NAME = KU.CONSTRAINT_NAME AND TC.CONSTRAINT_SCHEMA = KU.CONSTRAINT_SCHEMA WHERE TC.CONSTRAINT_TYPE = 'PRIMARY KEY' AND KU.TABLE_NAME = INFORMATION_SCHEMA.COLUMNS.TABLE_NAME AND KU.COLUMN_NAME = INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME) THEN 1 ELSE 0 END AS isPrimary
      FROM
        INFORMATION_SCHEMA.COLUMNS
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
    `
    const pool = await getConnection()
    if (!pool) {
      throw new Error("No database connection available")
    }
    const result = await pool.request().query(query)

    const tables = result.recordsets[0]
    const columns = result.recordsets[1]

    const schema = tables.map((table: any) => {
      return {
        name: table.name,
        schema: table.schema,
        columns: columns
          .filter((col: any) => col.TABLE_NAME === table.name)
          .map((col: any) => ({
            name: col.COLUMN_NAME,
            type: col.DATA_TYPE,
            nullable: col.IS_NULLABLE === "YES",
            isPrimary: col.isPrimary === 1,
          })),
      }
    })

    return schema
  } catch (err) {
    console.error("Error getting database schema:", err)
    throw err
  }
}

// Function to save a query to history
export async function saveQueryToHistory(query: string, status: string, duration: number, rows: number) {
  try {
    // In a real app, this would call an API endpoint
    console.log("Saving query to history:", { query, status, duration, rows })
    return { success: true }
  } catch (error) {
    console.error("Error saving query to history:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Function to get query history
export async function getQueryHistory(): Promise<any[]> {
  try {
    // In a real app, this would call an API endpoint
    const mockHistory = [
      {
        id: "q-1001",
        query_text: "SELECT * FROM users WHERE last_login > '2025-01-01'",
        status: "success",
        duration_ms: 45,
        rows_returned: 128,
        executed_at: new Date(Date.now() - 3600000).toISOString(),
        username: "admin",
      },
      {
        id: "q-1002",
        query_text: "SELECT model, COUNT(*) as count FROM llm_requests GROUP BY model",
        status: "success",
        duration_ms: 78,
        rows_returned: 5,
        executed_at: new Date(Date.now() - 7200000).toISOString(),
        username: "admin",
      },
      {
        id: "q-1003",
        query_text: "UPDATE users SET status = 'active' WHERE email = 'test@example.com'",
        status: "success",
        duration_ms: 32,
        rows_returned: 0,
        executed_at: new Date(Date.now() - 10800000).toISOString(),
        username: "admin",
      },
      {
        id: "q-1004",
        query_text: "SELECT AVG(response_time) FROM llm_requests WHERE model = 'GPT-4o'",
        status: "success",
        duration_ms: 65,
        rows_returned: 1,
        executed_at: new Date(Date.now() - 14400000).toISOString(),
        username: "admin",
      },
      {
        id: "q-1005",
        query_text: "SELECT * FROM non_existent_table",
        status: "error",
        duration_ms: 12,
        rows_returned: 0,
        executed_at: new Date(Date.now() - 18000000).toISOString(),
        username: "admin",
        error: "Table 'non_existent_table' does not exist",
      },
    ]

    return mockHistory
  } catch (error) {
    console.error("Error getting query history:", error)
    return []
  }
}
