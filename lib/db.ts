import sql from "mssql"

// Database configuration using environment variables
const dbConfig = {
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
}

// Check if we're in a server environment
const isServer = typeof window === "undefined"

// Global connection pool to be reused across requests
let pool: sql.ConnectionPool | null = null

// Mock data for database metrics
const MOCK_METRICS = [
  { name: "CPU", value: 65 },
  { name: "RAM", value: 78 },
  { name: "Connections", value: 42 },
  { name: "Queries/s", value: 89 },
  { name: "Cache Hit", value: 92 },
]

// Mock data for recent queries
const MOCK_RECENT_QUERIES = [
  {
    query_id: 1001,
    query_text: "SELECT * FROM users WHERE last_login > '2025-01-01'",
    start_time: "2025-04-24T14:32:12.000Z",
    status: "Completed",
    duration_ms: 45,
    rows_returned: 128,
    database_name: "analytics",
    username: "admin",
  },
  {
    query_id: 1002,
    query_text: "SELECT model, COUNT(*) as count FROM llm_requests GROUP BY model",
    start_time: "2025-04-24T14:30:22.000Z",
    status: "Completed",
    duration_ms: 78,
    rows_returned: 5,
    database_name: "analytics",
    username: "admin",
  },
  {
    query_id: 1003,
    query_text: "UPDATE users SET status = 'active' WHERE email = 'test@example.com'",
    start_time: "2025-04-24T13:45:08.000Z",
    status: "Completed",
    duration_ms: 32,
    rows_returned: 0,
    database_name: "analytics",
    username: "admin",
  },
]

// Mock data for database schema
const MOCK_SCHEMA = [
  {
    name: "users",
    schema: "dbo",
    columns: [
      { name: "id", type: "int", nullable: false, isPrimary: true },
      { name: "username", type: "nvarchar(50)", nullable: false, isPrimary: false },
      { name: "email", type: "nvarchar(100)", nullable: false, isPrimary: false },
      { name: "created_at", type: "datetime", nullable: false, isPrimary: false },
    ],
  },
  {
    name: "llm_requests",
    schema: "dbo",
    columns: [
      { name: "id", type: "int", nullable: false, isPrimary: true },
      { name: "user_id", type: "int", nullable: false, isPrimary: false },
      { name: "model", type: "nvarchar(50)", nullable: false, isPrimary: false },
      { name: "prompt", type: "nvarchar(max)", nullable: false, isPrimary: false },
      { name: "response", type: "nvarchar(max)", nullable: true, isPrimary: false },
      { name: "tokens", type: "int", nullable: false, isPrimary: false },
      { name: "created_at", type: "datetime", nullable: false, isPrimary: false },
    ],
  },
]

// Mock data for query history
const MOCK_QUERY_HISTORY = [
  {
    id: "q-1001",
    query_text: "SELECT * FROM users WHERE last_login > '2025-01-01'",
    status: "success",
    duration_ms: 45,
    rows_returned: 128,
    executed_at: "2025-04-24T14:32:12.000Z",
    username: "admin",
  },
  {
    id: "q-1002",
    query_text: "SELECT model, COUNT(*) as count FROM llm_requests GROUP BY model",
    status: "success",
    duration_ms: 78,
    rows_returned: 5,
    executed_at: "2025-04-24T14:30:22.000Z",
    username: "admin",
  },
]

// Initialize the connection pool
export async function getConnection(): Promise<sql.ConnectionPool> {
  // If we're not in a server environment, throw an error
  if (!isServer) {
    throw new Error("Database connections can only be made from server-side code")
  }

  if (pool) {
    // Return existing pool if it's connected
    try {
      if (pool.connected) {
        return pool
      }
    } catch (err) {
      console.log("Previous pool disconnected, creating new pool")
    }
  }

  try {
    // Create a new connection pool
    pool = await new sql.ConnectionPool(dbConfig).connect()
    console.log("Connected to MSSQL database")
    return pool
  } catch (err) {
    console.error("Failed to connect to MSSQL database:", err)
    throw err
  }
}

// Execute a query and return the results
export async function executeQuery(query: string, params: any[] = []): Promise<any[]> {
  // If we're not in a server environment, throw an error
  if (!isServer) {
    throw new Error("Database queries can only be executed from server-side code")
  }

  try {
    const pool = await getConnection()
    const request = pool.request()

    // Add parameters if provided
    params.forEach((param, index) => {
      request.input(`param${index}`, param)
    })

    const result = await request.query(query)
    return result.recordset
  } catch (err) {
    console.error("Error executing query:", err)
    throw err
  }
}

// Get database metrics
export async function getDatabaseMetrics(): Promise<any[]> {
  // If we're not in a server environment, return mock data
  if (!isServer) {
    console.log("Using mock data for database metrics (client-side)")
    return MOCK_METRICS
  }

  try {
    const query = `
      SELECT 
        (SELECT cpu_count FROM sys.dm_os_sys_info) AS [CPU],
        (SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Total Server Memory (KB)') AS [RAM],
        (SELECT COUNT(*) FROM sys.dm_exec_connections) AS [Connections],
        (SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Batch Requests/sec') AS [Queries/s],
        (SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Buffer cache hit ratio') AS [Cache_Hit]
    `
    const result = await executeQuery(query)

    // Transform the result into the expected format
    if (result && result.length > 0) {
      const metrics = [
        { name: "CPU", value: result[0].CPU || 0 },
        { name: "RAM", value: Math.floor((result[0].RAM || 0) / 1024 / 1024) }, // Convert KB to GB
        { name: "Connections", value: result[0].Connections || 0 },
        { name: "Queries/s", value: result[0].Queries_s || 0 },
        { name: "Cache Hit", value: result[0].Cache_Hit || 0 },
      ]
      return metrics
    }

    throw new Error("No metrics data returned")
  } catch (err) {
    console.error("Error getting database metrics:", err)
    // Return mock data as fallback
    return MOCK_METRICS
  }
}

// Get database schema
export async function getDatabaseSchema(): Promise<any[]> {
  // If we're not in a server environment, return mock data
  if (!isServer) {
    console.log("Using mock data for database schema (client-side)")
    return MOCK_SCHEMA
  }

  try {
    const query = `
      SELECT 
        t.name AS table_name,
        s.name AS schema_name,
        c.name AS column_name,
        ty.name AS data_type,
        c.is_nullable,
        CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key
      FROM 
        sys.tables t
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        JOIN sys.columns c ON t.object_id = c.object_id
        JOIN sys.types ty ON c.user_type_id = ty.user_type_id
        LEFT JOIN sys.index_columns ic ON ic.object_id = t.object_id AND ic.column_id = c.column_id
        LEFT JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id AND i.is_primary_key = 1
        LEFT JOIN (
          SELECT ic.column_id, ic.object_id
          FROM sys.indexes i
          JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
          WHERE i.is_primary_key = 1
        ) pk ON pk.object_id = t.object_id AND pk.column_id = c.column_id
      ORDER BY 
        s.name, t.name, c.column_id
    `

    const result = await executeQuery(query)

    // Transform the result into the expected format
    const schema: any[] = []
    const tableMap = new Map()

    result.forEach((row) => {
      const tableName = row.table_name
      const schemaName = row.schema_name
      const tableKey = `${schemaName}.${tableName}`

      if (!tableMap.has(tableKey)) {
        const table = {
          name: tableName,
          schema: schemaName,
          columns: [],
        }
        tableMap.set(tableKey, table)
        schema.push(table)
      }

      const table = tableMap.get(tableKey)
      table.columns.push({
        name: row.column_name,
        type: `${row.data_type}`,
        nullable: row.is_nullable,
        isPrimary: row.is_primary_key === 1,
      })
    })

    return schema
  } catch (err) {
    console.error("Error getting database schema:", err)
    // Return mock data as fallback
    return MOCK_SCHEMA
  }
}

// Get recent queries
export async function getRecentQueries(): Promise<any[]> {
  // If we're not in a server environment, return mock data
  if (!isServer) {
    console.log("Using mock data for recent queries (client-side)")
    return MOCK_RECENT_QUERIES
  }

  try {
    const query = `
      SELECT TOP 10
        qs.query_id,
        SUBSTRING(qt.query_sql_text, 1, 200) AS query_text,
        qs.start_time,
        CASE 
          WHEN qs.status = 0 THEN 'Completed'
          WHEN qs.status = 1 THEN 'Aborted'
          ELSE 'Unknown'
        END AS status,
        qs.total_elapsed_time AS duration_ms,
        qs.row_count AS rows_returned,
        DB_NAME(qt.dbid) AS database_name,
        s.login_name AS username
      FROM 
        sys.query_store_query_text qt
        JOIN sys.query_store_query q ON qt.query_text_id = q.query_id
        JOIN sys.query_store_plan p ON q.query_id = p.plan_id
        JOIN sys.query_store_runtime_stats qs ON p.plan_id = qs.plan_id
        JOIN sys.dm_exec_sessions s ON qs.session_id = s.session_id
      ORDER BY 
        qs.start_time DESC
    `

    const result = await executeQuery(query)
    return result
  } catch (err) {
    console.error("Error getting recent queries:", err)
    // Return mock data as fallback
    return MOCK_RECENT_QUERIES
  }
}

// Save query history
export async function saveQueryHistory(
  query: string,
  status: string,
  duration: number,
  rows: number,
): Promise<boolean> {
  // If we're not in a server environment, return success but don't actually save
  if (!isServer) {
    console.log("Mock saving query history (client-side):", { query, status, duration, rows })
    return true
  }

  try {
    const insertQuery = `
      INSERT INTO query_history (query_text, status, duration_ms, rows_returned, executed_at, username)
      VALUES (@param0, @param1, @param2, @param3, GETDATE(), SYSTEM_USER)
    `

    await executeQuery(insertQuery, [query, status, duration, rows])
    return true
  } catch (err) {
    console.error("Error saving query history:", err)
    return false
  }
}

// Get query history
export async function getQueryHistory(): Promise<any[]> {
  // If we're not in a server environment, return mock data
  if (!isServer) {
    console.log("Using mock data for query history (client-side)")
    return MOCK_QUERY_HISTORY
  }

  try {
    const query = `
      SELECT 
        id,
        query_text,
        status,
        duration_ms,
        rows_returned,
        executed_at,
        username
      FROM 
        query_history
      ORDER BY 
        executed_at DESC
    `

    const result = await executeQuery(query)
    return result
  } catch (err) {
    console.error("Error getting query history:", err)
    // Return mock data as fallback
    return MOCK_QUERY_HISTORY
  }
}

// Test database connection
export async function testConnection(): Promise<{ success: boolean; version?: string; error?: string }> {
  // If we're not in a server environment, return mock success
  if (!isServer) {
    console.log("Mock testing database connection (client-side)")
    return {
      success: true,
      version: "Microsoft SQL Server 2019 (RTM-CU18) (KB5017593) - Mock",
    }
  }

  try {
    const pool = await getConnection()
    const result = await pool.request().query("SELECT @@VERSION AS Version")
    return {
      success: true,
      version: result.recordset[0].Version,
    }
  } catch (err) {
    console.error("Database connection test failed:", err)
    return {
      success: false,
      error: (err as Error).message,
    }
  }
}

// Close the connection pool
export async function closeConnection(): Promise<void> {
  // If we're not in a server environment, do nothing
  if (!isServer) {
    console.log("Mock closing database connection (client-side)")
    return
  }

  if (pool) {
    try {
      await pool.close()
      pool = null
      console.log("Database connection closed")
    } catch (err) {
      console.error("Error closing database connection:", err)
    }
  }
}
