"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, RefreshCw, TableIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface QueryBuilderProps {
  query: string
  onQueryChange: (query: string) => void
  onExecute: () => void
  isExecuting: boolean
  schema: any[]
}

export function QueryBuilder({ query, onQueryChange, onExecute, isExecuting, schema }: QueryBuilderProps) {
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [whereConditions, setWhereConditions] = useState<{ column: string; operator: string; value: string }[]>([])
  const [orderByColumn, setOrderByColumn] = useState<string>("")
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("ASC")
  const [limit, setLimit] = useState<number>(100)

  // Mock schema data for demonstration
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

  // Use mock data if schema is empty
  const displaySchema = schema.length > 0 ? schema : mockSchema

  const getTableColumns = () => {
    const table = displaySchema.find((t) => `${t.schema}.${t.name}` === selectedTable)
    return table ? table.columns : []
  }

  const handleColumnToggle = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== column))
    } else {
      setSelectedColumns([...selectedColumns, column])
    }
  }

  const handleSelectAllColumns = () => {
    const columns = getTableColumns()
    if (columns.length === selectedColumns.length) {
      setSelectedColumns([])
    } else {
      setSelectedColumns(columns.map((c: any) => c.name))
    }
  }

  const addWhereCondition = () => {
    const columns = getTableColumns()
    if (columns.length > 0) {
      setWhereConditions([...whereConditions, { column: columns[0].name, operator: "=", value: "" }])
    }
  }

  const removeWhereCondition = (index: number) => {
    setWhereConditions(whereConditions.filter((_, i) => i !== index))
  }

  const updateWhereCondition = (index: number, field: "column" | "operator" | "value", value: string) => {
    const newConditions = [...whereConditions]
    newConditions[index][field] = value
    setWhereConditions(newConditions)
  }

  const buildQuery = () => {
    if (!selectedTable) return ""

    const columns = selectedColumns.length > 0 ? selectedColumns.join(", ") : "*"
    let sql = `SELECT ${columns} FROM ${selectedTable}`

    if (whereConditions.length > 0) {
      const whereClause = whereConditions
        .map((condition) => `${condition.column} ${condition.operator} '${condition.value}'`)
        .join(" AND ")
      sql += ` WHERE ${whereClause}`
    }

    if (orderByColumn) {
      sql += ` ORDER BY ${orderByColumn} ${orderDirection}`
    }

    sql += ` LIMIT ${limit}`

    return sql
  }

  const generateQuery = () => {
    const sql = buildQuery()
    onQueryChange(sql)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Builder</CardTitle>
        <CardDescription>Build SQL queries visually or write them directly</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="sql">SQL Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Table</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {displaySchema.map((table) => (
                      <SelectItem key={`${table.schema}.${table.name}`} value={`${table.schema}.${table.name}`}>
                        <div className="flex items-center">
                          <TableIcon className="mr-2 h-4 w-4" />
                          {table.name} <span className="ml-2 text-xs text-muted-foreground">[{table.schema}]</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTable && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Columns</Label>
                      <Button variant="outline" size="sm" onClick={handleSelectAllColumns}>
                        {selectedColumns.length === getTableColumns().length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {getTableColumns().map((column: any) => (
                        <div key={column.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`column-${column.name}`}
                            checked={selectedColumns.includes(column.name)}
                            onCheckedChange={() => handleColumnToggle(column.name)}
                          />
                          <Label htmlFor={`column-${column.name}`} className="text-sm">
                            {column.name}
                            <span className="ml-1 text-xs text-muted-foreground">({column.type})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Where Conditions</Label>
                      <Button variant="outline" size="sm" onClick={addWhereCondition}>
                        Add Condition
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {whereConditions.map((condition, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Select
                            value={condition.column}
                            onValueChange={(value) => updateWhereCondition(index, "column", value)}
                          >
                            <SelectTrigger className="w-[30%]">
                              <SelectValue placeholder="Column" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTableColumns().map((column: any) => (
                                <SelectItem key={column.name} value={column.name}>
                                  {column.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateWhereCondition(index, "operator", value)}
                          >
                            <SelectTrigger className="w-[20%]">
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="=">Equal (=)</SelectItem>
                              <SelectItem value="!=">Not Equal (!=)</SelectItem>
                              <SelectItem value=">">Greater Than (&gt;)</SelectItem>
                              <SelectItem value="<">Less Than (&lt;)</SelectItem>
                              <SelectItem value=">=">Greater or Equal (&gt;=)</SelectItem>
                              <SelectItem value="<=">Less or Equal (&lt;=)</SelectItem>
                              <SelectItem value="LIKE">LIKE</SelectItem>
                              <SelectItem value="IN">IN</SelectItem>
                            </SelectContent>
                          </Select>
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => updateWhereCondition(index, "value", e.target.value)}
                            placeholder="Value"
                            className="flex h-10 w-[40%] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWhereCondition(index)}
                            className="h-8 w-8"
                          >
                            <span className="sr-only">Remove</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Order By</Label>
                      <Select value={orderByColumn} onValueChange={setOrderByColumn}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {getTableColumns().map((column: any) => (
                            <SelectItem key={column.name} value={column.name}>
                              {column.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {orderByColumn && (
                      <div className="space-y-2">
                        <Label>Direction</Label>
                        <Select
                          value={orderDirection}
                          onValueChange={(value: "ASC" | "DESC") => setOrderDirection(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ASC">Ascending</SelectItem>
                            <SelectItem value="DESC">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Limit Results</Label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(Number.parseInt(e.target.value) || 100)}
                      min="1"
                      max="1000"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={generateQuery}>
                      Generate SQL
                    </Button>
                    <Button onClick={onExecute} disabled={isExecuting || !query}>
                      {isExecuting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Execute Query
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sql" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sql-editor">SQL Query</Label>
                <textarea
                  id="sql-editor"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="SELECT * FROM users LIMIT 100"
                  className="h-[300px] w-full resize-none rounded-md border border-input bg-background p-3 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onQueryChange("")}>
                  Clear
                </Button>
                <Button variant="outline" onClick={() => onQueryChange("SELECT * FROM users LIMIT 100")}>
                  Example Query
                </Button>
                <Button onClick={onExecute} disabled={isExecuting || !query}>
                  {isExecuting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Query
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
