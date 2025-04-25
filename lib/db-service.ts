// This file contains functions that interact with the database through API routes
// It's safe to use in client components

// Function to fetch database metrics
export async function fetchDatabaseMetrics() {
  try {
    // In a real app, this would call an API endpoint
    // For demo purposes, we'll return mock data with some randomization
    const mockData = [
      { name: "CPU", value: Math.floor(60 + Math.random() * 20) },
      { name: "RAM", value: Math.floor(70 + Math.random() * 20) },
      { name: "Connections", value: Math.floor(30 + Math.random() * 30) },
      { name: "Queries/s", value: Math.floor(80 + Math.random() * 15) },
      { name: "Cache Hit", value: Math.floor(85 + Math.random() * 15) },
    ]

    return { success: true, data: mockData }
  } catch (error) {
    console.error("Error fetching database metrics:", error)
    return {
      success: false,
      error: (error as Error).message,
      data: [
        { name: "CPU", value: 65 },
        { name: "RAM", value: 78 },
        { name: "Connections", value: 42 },
        { name: "Queries/s", value: 89 },
        { name: "Cache Hit", value: 92 },
      ],
    }
  }
}

// Function to fetch database schema
export async function fetchDatabaseSchema() {
  try {
    // In a real app, this would call an API endpoint
    const mockSchema = [
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
      {
        name: "database_metrics",
        schema: "dbo",
        columns: [
          { name: "id", type: "int", nullable: false, isPrimary: true },
          { name: "query_id", type: "int", nullable: false, isPrimary: false },
          { name: "execution_time", type: "float", nullable: false, isPrimary: false },
          { name: "rows_affected", type: "int", nullable: false, isPrimary: false },
          { name: "created_at", type: "datetime", nullable: false, isPrimary: false },
        ],
      },
    ]

    return { success: true, schema: mockSchema }
  } catch (error) {
    console.error("Error fetching database schema:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Function to execute a database query
export async function executeQuery(query: string) {
  try {
    // In a real app, this would call an API endpoint
    // For demo purposes, we'll return mock data
    const mockResults = []

    // Generate some mock results based on the query
    if (query.toLowerCase().includes("select")) {
      // If it's a SELECT query, generate some rows
      const numRows = Math.floor(Math.random() * 10) + 1

      if (query.toLowerCase().includes("users")) {
        for (let i = 0; i < numRows; i++) {
          mockResults.push({
            id: i + 1,
            username: `user${i + 1}`,
            email: `user${i + 1}@example.com`,
            created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          })
        }
      } else if (query.toLowerCase().includes("llm_requests")) {
        for (let i = 0; i < numRows; i++) {
          mockResults.push({
            id: i + 1,
            user_id: Math.floor(Math.random() * 10) + 1,
            model: ["GPT-4o", "Claude 3", "Llama 3", "Mistral"][Math.floor(Math.random() * 4)],
            prompt:
              "Tell me about " +
              ["AI", "databases", "cloud computing", "machine learning"][Math.floor(Math.random() * 4)],
            tokens: Math.floor(Math.random() * 1000) + 100,
            created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          })
        }
      } else {
        // Generic results
        for (let i = 0; i < numRows; i++) {
          mockResults.push({
            id: i + 1,
            name: `Item ${i + 1}`,
            value: Math.floor(Math.random() * 100),
            created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          })
        }
      }
    }

    return {
      success: true,
      results: mockResults,
      duration: Math.floor(Math.random() * 100) + 10,
      rowCount: mockResults.length,
    }
  } catch (error) {
    console.error("Error executing query:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Function to fetch query history
export async function fetchQueryHistory() {
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

    return { success: true, history: mockHistory }
  } catch (error) {
    console.error("Error fetching query history:", error)
    return { success: false, error: (error as Error).message }
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
