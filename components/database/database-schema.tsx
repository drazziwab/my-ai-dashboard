"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search, TableIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface DatabaseSchemaProps {
  schema: any[]
  onRefresh: () => void
}

export function DatabaseSchema({ schema, onRefresh }: DatabaseSchemaProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  // Filter schema based on search term
  const filteredSchema = schema.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.schema.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
  const displaySchema = schema.length > 0 ? filteredSchema : mockSchema

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Database Schema</CardTitle>
            <CardDescription>Browse tables, views, and stored procedures</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Schema
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables and columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Accordion type="multiple" className="w-full">
          {displaySchema.map((table) => (
            <AccordionItem key={`${table.schema}.${table.name}`} value={`${table.schema}.${table.name}`}>
              <AccordionTrigger className="hover:bg-muted/50 px-2 rounded-md">
                <div className="flex items-center">
                  <TableIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{table.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">[{table.schema}]</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">Column</TableHead>
                        <TableHead className="w-[30%]">Type</TableHead>
                        <TableHead className="w-[20%]">Nullable</TableHead>
                        <TableHead className="w-[20%]">Key</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.columns.map((column: any) => (
                        <TableRow key={column.name}>
                          <TableCell className="font-medium">{column.name}</TableCell>
                          <TableCell>{column.type}</TableCell>
                          <TableCell>{column.nullable ? "YES" : "NO"}</TableCell>
                          <TableCell>{column.isPrimary ? "PK" : ""}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {displaySchema.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TableIcon className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No tables found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "No tables match your search criteria" : "Connect to your database to view the schema"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
