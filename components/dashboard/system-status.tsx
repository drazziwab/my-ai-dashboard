"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Server, HardDrive, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemStatusProps {
  className?: string
}

interface SystemStatus {
  name: string
  isOnline: boolean
  responseTime?: number | string
  error?: string
  lastChecked: string
}

export function SystemStatus({ className }: SystemStatusProps) {
  const [statuses, setStatuses] = useState<SystemStatus[]>([
    { name: "Database", isOnline: true, responseTime: 5, lastChecked: new Date().toISOString() },
    { name: "|my-ai| Service", isOnline: true, responseTime: 12, lastChecked: new Date().toISOString() },
    { name: "File Storage", isOnline: true, responseTime: 3, lastChecked: new Date().toISOString() },
    { name: "API Gateway", isOnline: true, responseTime: 8, lastChecked: new Date().toISOString() },
  ])
  const [loading, setLoading] = useState(false)

  const fetchStatuses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/system/status")

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        console.error(`Error fetching system statuses: ${response.status} ${response.statusText}`)
        updateStatusesWithError()
        return
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.statuses)) {
        setStatuses(data.statuses)
      } else {
        updateStatusesWithError()
      }
    } catch (error) {
      // Silently log the error
      console.error("Error fetching system statuses:", error)
      updateStatusesWithError()
    } finally {
      setLoading(false)
    }
  }

  // Helper function to update statuses with error values
  const updateStatusesWithError = () => {
    setStatuses((prev) =>
      prev.map((status) => ({
        ...status,
        isOnline: false,
        responseTime: "ErR",
        error: "Connection error",
        lastChecked: new Date().toISOString(),
      })),
    )
  }

  useEffect(() => {
    fetchStatuses()

    // Poll every 10 seconds
    const intervalId = setInterval(fetchStatuses, 10000)

    return () => clearInterval(intervalId)
  }, [])

  const getIcon = (name: string) => {
    switch (name) {
      case "Database":
        return <Database className="h-5 w-5" />
      case "|my-ai| Service":
        return <Server className="h-5 w-5" />
      case "File Storage":
        return <HardDrive className="h-5 w-5" />
      case "API Gateway":
        return <Globe className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses.map((status) => (
          <div
            key={status.name}
            className={cn(
              "flex items-center justify-between rounded-lg border p-3 transition-all",
              status.isOnline
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20",
              loading && "opacity-70",
            )}
          >
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  status.isOnline
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}
              >
                {getIcon(status.name)}
              </div>
              <div>
                <p className="font-medium">{status.name}</p>
                <p className="text-xs text-muted-foreground">
                  {status.isOnline
                    ? `Response: ${status.responseTime === "ErR" ? "ErR" : `${status.responseTime}ms`}`
                    : status.error || "Offline"}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                status.isOnline ? "bg-green-500 shadow-glow-green" : "bg-red-500 shadow-glow-red",
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
