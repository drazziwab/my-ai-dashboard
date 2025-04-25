"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Database, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface Metric {
  name: string
  value: number
}

// Initial data for first render
const INITIAL_DATA: Metric[] = [
  { name: "CPU", value: 65 },
  { name: "RAM", value: 78 },
  { name: "Connections", value: 42 },
  { name: "Queries/s", value: 89 },
  { name: "Cache Hit", value: 92 },
]

export function DatabaseMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/database/metrics")
      const data = await response.json()

      if (data.success && Array.isArray(data.metrics)) {
        setMetrics(data.metrics)
      } else if (data.success && Array.isArray(data.data)) {
        // Handle case where metrics are in data property
        setMetrics(data.data)
      } else {
        console.error("Unexpected API response format:", data)
        setError(data.error || "Failed to fetch database metrics")
        // Keep using the current metrics
      }
    } catch (err) {
      console.error("Error fetching metrics:", err)
      setError((err as Error).message || "An error occurred while fetching database metrics")
      // Keep using the current metrics
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    // Set up polling to refresh metrics every 30 seconds
    const intervalId = setInterval(fetchMetrics, 30000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Database Metrics
          </CardTitle>
          <CardDescription>Real-time database performance metrics</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchMetrics} disabled={loading} title="Refresh metrics">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading && metrics.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading database metrics...</p>
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

        {!loading && metrics.length === 0 && !error && (
          <div className="text-center py-8">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No database metrics available</p>
          </div>
        )}

        {metrics && metrics.length > 0 && (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-sm text-muted-foreground">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
