"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Query {
  query_id: number
  query_text: string
  start_time: string
  status: string
  duration_ms: number
  rows_returned: number
  database_name: string
  username: string
}

export function RecentQueries() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/database/recent-queries")
        const data = await response.json()

        if (data.success) {
          setQueries(data.queries)
        } else {
          setError(data.error || "Failed to fetch recent queries")
        }
      } catch (err) {
        setError((err as Error).message || "An error occurred while fetching recent queries")
      } finally {
        setLoading(false)
      }
    }

    fetchQueries()

    // Set up polling to refresh queries every minute
    const intervalId = setInterval(fetchQueries, 60000)

    return () => clearInterval(intervalId)
  }, [])

  // Format the date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Truncate long query text
  const truncateQuery = (query: string, maxLength = 100) => {
    return query.length > maxLength ? `${query.substring(0, maxLength)}...` : query
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Recent Queries
        </CardTitle>
        <CardDescription>Latest database queries executed</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && queries.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading recent queries...</p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && queries.length === 0 && !error && (
          <div className="text-center py-8">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No recent queries available</p>
          </div>
        )}

        {queries.length > 0 && (
          <div className="space-y-4">
            {queries.map((query) => (
              <div key={query.query_id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Badge variant={query.status === "Completed" ? "default" : "destructive"}>{query.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(query.start_time)}</span>
                </div>
                <p className="mt-2 font-mono text-sm">{truncateQuery(query.query_text)}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{query.duration_ms}ms</span>
                  <span>{query.rows_returned} rows</span>
                  <span>{query.database_name}</span>
                  <span>{query.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
