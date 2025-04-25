"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, RefreshCw, Search, Trash } from "lucide-react"
import { getQueryHistory } from "@/lib/db"

interface QueryHistoryProps {
  onSelectQuery: (query: string) => void
}

export function QueryHistory({ onSelectQuery }: QueryHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const queryHistory = await getQueryHistory()
      setHistory(queryHistory)
    } catch (err) {
      console.error("Error fetching query history:", err)
      setError("Failed to load query history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Filter history based on search term
  const filteredHistory = history.filter(
    (item) =>
      item.query_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const deleteQuery = async (id: string) => {
    try {
      const response = await fetch(`/api/database/delete-query/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setHistory(history.filter((item) => item.id !== id))
      } else {
        alert(`Failed to delete query: ${data.error}`)
      }
    } catch (error) {
      alert(`Error deleting query: ${(error as Error).message}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Query History</CardTitle>
            <CardDescription>View and reuse your previous queries</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {error && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Query</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[300px] truncate">{item.query_text}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{new Date(item.executed_at).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.duration_ms}ms</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "success" ? "default" : "destructive"}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>{item.status === "success" ? item.rows_returned : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectQuery(item.query_text)}
                          title="Run Query"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuery(item.id)}
                          title="Delete from History"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && filteredHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No queries found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "No queries match your search criteria" : "Execute queries to see them in your history"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
