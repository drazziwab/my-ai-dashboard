"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Database, Play, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SchemaTable {
  name: string
  schema: string
  columns: {
    name: string
    type: string
    nullable: boolean
    isPrimary: boolean
  }[]
}

export function DatabaseExplorer() {
  const [schema, setSchema] = useState<SchemaTable[]>([])
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null)
  const [query, setQuery] = useState<string>("")
  const [queryResults, setQueryResults] = useState<any[] | null>(null)
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [loadingSchema, setLoadingSchema] = useState<boolean>(true)

  // Fetch database schema
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoadingSchema(true)
        setError(null)

        const response = await fetch("/api/database/schema")
        const data = await response.json()

        if (data.success) {
          setSchema(data.schema)
        } else {
          setError(data.error || "Failed to fetch database schema")
        }
      } catch (err) {
        setError((err as Error).message || "An error occurred while fetching database schema")
      } finally {
        setLoadingSchema(false)
      }
    }

    fetchSchema()
  }, [])

  // Handle table selection
  const handleTableSelect = (table: SchemaTable) => {
    setSelectedTable(table)
    setQuery(`SELECT * FROM ${table.schema}.${table.name} LIMIT 100`)
  }

  // Execute SQL query
  const executeQuery = async () => {
    if (!query.trim()) return

    setIsExecuting(true)
    setError(null)
    setQueryResults(null)
    setExecutionTime(null)
    setRowCount(null)

    try {
      const response = await fetch("/api/database/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (data.success) {
        setQueryResults(data.results)
        setExecutionTime(data.duration)
        setRowCount(data.rowCount)
      } else {
        setError(data.error || "Query execution failed")
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred while executing the query")
    } finally {
      setIsExecuting(false)
    }
  }

  // Save query
  const saveQuery = async () => {
    if (!query.trim()) return

    try {
      await fetch("/api/database/save-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      // Show success message or notification
    } catch (err) {
      setError((err as Error).message || "Failed to save query")
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Database Schema</CardTitle>
          <CardDescription>Tables and columns in your database</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSchema ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-center">
                <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading schema...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : schema.length === 0 ? (
            <div className="text-center py-8">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No tables found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Input placeholder="Filter tables..." className="mb-2" />
              <div className="max-h-[500px] overflow-y-auto space-y-1">
                {schema.map((table) => (
                  <Button
                    key={`${table.schema}.${table.name}`}
                    variant={selectedTable?.name === table.name ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => handleTableSelect(table)}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    {table.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Query Editor</CardTitle>
          <CardDescription>Write and execute SQL queries</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="space-y-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter SQL query..."
                className="font-mono h-[200px]"
              />
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={saveQuery}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Query
                </Button>
                <Button onClick={executeQuery} disabled={isExecuting || !query.trim()}>
                  {isExecuting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute
                    </>
                  )}
                </Button>
              </div>

              {selectedTable && (
                <div className="mt-4 border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">
                    Table: {selectedTable.schema}.{selectedTable.name}
                  </h3>
                  <div className="max-h-[200px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Nullable</TableHead>
                          <TableHead>Primary Key</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTable.columns.map((column) => (
                          <TableRow key={column.name}>
                            <TableCell className="font-medium">{column.name}</TableCell>
                            <TableCell>{column.type}</TableCell>
                            <TableCell>{column.nullable ? "Yes" : "No"}</TableCell>
                            <TableCell>{column.isPrimary ? "Yes" : "No"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="results">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {executionTime !== null && (
                <div className="mb-4 text-sm text-muted-foreground">
                  Query executed in {executionTime}ms. {rowCount !== null && `${rowCount} rows returned.`}
                </div>
              )}

              {queryResults && queryResults.length > 0 ? (
                <div className="border rounded-md overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(queryResults[0]).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResults.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((value: any, colIndex) => (
                            <TableCell key={colIndex}>
                              {value === null ? (
                                <span className="text-muted-foreground italic">NULL</span>
                              ) : (
                                String(value)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : queryResults && queryResults.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No results returned</p>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
