"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, MemoryStickIcon as Memory, HardDrive, CpuIcon as Gpu } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface HardwareMetric {
  name: string
  value: number
  icon: React.ReactNode
  unit: string
  description: string
}

export function HardwareMetrics() {
  const [metrics, setMetrics] = useState<HardwareMetric[]>([
    {
      name: "CPU Usage",
      value: 0,
      icon: <Cpu className="h-4 w-4" />,
      unit: "%",
      description: "Current CPU utilization",
    },
    {
      name: "RAM Usage",
      value: 0,
      icon: <Memory className="h-4 w-4" />,
      unit: "%",
      description: "Current memory usage",
    },
    {
      name: "GPU Usage",
      value: 0,
      icon: <Gpu className="h-4 w-4" />,
      unit: "%",
      description: "GPU utilization",
    },
    {
      name: "Disk Usage",
      value: 0,
      icon: <HardDrive className="h-4 w-4" />,
      unit: "%",
      description: "Primary disk usage",
    },
  ])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/system/metrics")

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
        const newMetrics = [...metrics]

        // Update CPU
        if (typeof data.metrics.cpu === "number") {
          newMetrics[0].value = data.metrics.cpu
        }

        // Update RAM
        if (typeof data.metrics.ram === "number") {
          newMetrics[1].value = data.metrics.ram
        }

        // Update GPU
        if (typeof data.metrics.gpu === "number") {
          newMetrics[2].value = data.metrics.gpu
        }

        // Update Disk
        if (typeof data.metrics.disk === "number") {
          newMetrics[3].value = data.metrics.disk
        }

        setMetrics(newMetrics)
      }
    } catch (error) {
      // Silent error handling - just log to console
      console.error("Error fetching hardware metrics:", error)
    }
  }

  useEffect(() => {
    fetchMetrics()

    // Poll every 4 seconds as requested
    const intervalId = setInterval(fetchMetrics, 4000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            <div className="text-muted-foreground">{metric.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{`${metric.value.toFixed(1)}${metric.unit}`}</div>
            <Progress
              value={metric.value}
              className="h-2 mt-2"
              indicatorClassName={
                metric.value > 80 ? "bg-red-500" : metric.value > 60 ? "bg-yellow-500" : "bg-green-500"
              }
            />
            <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
