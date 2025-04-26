"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Server, Activity, BarChart3, Cpu, MemoryStickIcon as Memory, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricItem {
  name: string
  value: string | number
  unit: string
  change: string | number
  icon: React.ReactNode
  description: string
}

interface DatabaseMetricsProps {
  className?: string
}

export function DatabaseMetrics({ className }: DatabaseMetricsProps) {
  const [metrics, setMetrics] = useState<MetricItem[]>([
    {
      name: "Database Size",
      value: "0",
      unit: "GB",
      change: "0",
      icon: <Database className="h-4 w-4" />,
      description: "Total size of database files",
    },
    {
      name: "Connections",
      value: 0,
      unit: "",
      change: 0,
      icon: <Server className="h-4 w-4" />,
      description: "Active database connections",
    },
    {
      name: "Active Queries",
      value: 0,
      unit: "",
      change: 0,
      icon: <Activity className="h-4 w-4" />,
      description: "Currently running queries",
    },
    {
      name: "Cache Hit Ratio",
      value: "0",
      unit: "%",
      change: "0",
      icon: <BarChart3 className="h-4 w-4" />,
      description: "Buffer cache efficiency",
    },
    {
      name: "CPU Usage",
      value: "0",
      unit: "%",
      change: "0",
      icon: <Cpu className="h-4 w-4" />,
      description: "Database CPU utilization",
    },
    {
      name: "Memory Usage",
      value: "0",
      unit: "%",
      change: "0",
      icon: <Memory className="h-4 w-4" />,
      description: "Database memory consumption",
    },
    {
      name: "I/O Latency",
      value: "0",
      unit: "ms",
      change: "0",
      icon: <HardDrive className="h-4 w-4" />,
      description: "Average I/O latency",
    },
  ])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/database/metrics")

      // If the response is not ok, just return without updating
      if (!response.ok) {
        return
      }

      // Try to parse the JSON, but don't throw if it fails
      let data
      try {
        data = await response.json()
      } catch (error) {
        return
      }

      // Only update if we have valid data
      if (data?.success && data?.metrics) {
        try {
          const newMetrics = [
            {
              name: "Database Size",
              value: data.metrics.databaseSize?.value || "0",
              unit: data.metrics.databaseSize?.unit || "GB",
              change: data.metrics.databaseSize?.change || "0",
              icon: <Database className="h-4 w-4" />,
              description: "Total size of database files",
            },
            {
              name: "Connections",
              value: data.metrics.connectionCount?.value || 0,
              unit: data.metrics.connectionCount?.unit || "",
              change: data.metrics.connectionCount?.change || 0,
              icon: <Server className="h-4 w-4" />,
              description: "Active database connections",
            },
            {
              name: "Active Queries",
              value: data.metrics.activeQueries?.value || 0,
              unit: data.metrics.activeQueries?.unit || "",
              change: data.metrics.activeQueries?.change || 0,
              icon: <Activity className="h-4 w-4" />,
              description: "Currently running queries",
            },
            {
              name: "Cache Hit Ratio",
              value: data.metrics.cacheHitRatio?.value || "0",
              unit: data.metrics.cacheHitRatio?.unit || "%",
              change: data.metrics.cacheHitRatio?.change || "0",
              icon: <BarChart3 className="h-4 w-4" />,
              description: "Buffer cache efficiency",
            },
            {
              name: "CPU Usage",
              value: data.metrics.cpuUsage?.value || "0",
              unit: data.metrics.cpuUsage?.unit || "%",
              change: data.metrics.cpuUsage?.change || "0",
              icon: <Cpu className="h-4 w-4" />,
              description: "Database CPU utilization",
            },
            {
              name: "Memory Usage",
              value: data.metrics.memoryUsage?.value || "0",
              unit: data.metrics.memoryUsage?.unit || "%",
              change: data.metrics.memoryUsage?.change || "0",
              icon: <Memory className="h-4 w-4" />,
              description: "Database memory consumption",
            },
            {
              name: "I/O Latency",
              value: data.metrics.ioStats?.value || "0",
              unit: data.metrics.ioStats?.unit || "ms",
              change: data.metrics.ioStats?.change || "0",
              icon: <HardDrive className="h-4 w-4" />,
              description: "Average I/O latency",
            },
          ]
          setMetrics(newMetrics)
        } catch (error) {
          console.error("Error processing metrics data:", error)
        }
      }
    } catch (error) {
      // Silent error handling - just log to console
      console.error("Error fetching database metrics:", error)
    }
  }

  useEffect(() => {
    fetchMetrics()

    // Poll every 4 seconds as requested
    const intervalId = setInterval(fetchMetrics, 4000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className={cn("w-full", className)}>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="text-muted-foreground">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof metric.value === "number" ? metric.value : metric.value}
                {metric.unit}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
              <div className="text-xs text-muted-foreground mt-1">
                {Number(metric.change) > 0 ? (
                  <span className="text-green-500">
                    ↑ {metric.change}
                    {metric.unit}
                  </span>
                ) : Number(metric.change) < 0 ? (
                  <span className="text-red-500">
                    ↓ {Math.abs(Number(metric.change))}
                    {metric.unit}
                  </span>
                ) : (
                  <span>No change</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
