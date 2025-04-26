"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Cpu, CpuIcon as Gpu } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ModelStatusProps {
  ollamaUrl?: string
}

interface ModelInfo {
  name: string
  id: string
  size: string
  processor: string
  until: string
}

export function ModelStatus({ ollamaUrl = "http://localhost:11434" }: ModelStatusProps) {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModelStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/llm/model-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ollamaUrl }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setModels(data.models || [])
      } else {
        throw new Error(data.error || "Failed to fetch model status")
      }
    } catch (error) {
      console.error("Error fetching model status:", error)
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModelStatus()

    // Refresh every 30 seconds
    const interval = setInterval(fetchModelStatus, 30000)
    return () => clearInterval(interval)
  }, [ollamaUrl])

  const getProcessorIcon = (processor: string) => {
    if (processor.includes("GPU")) {
      return <Gpu className="h-4 w-4 mr-1" />
    }
    return <Cpu className="h-4 w-4 mr-1" />
  }

  const getProcessorColor = (processor: string) => {
    if (processor.includes("GPU")) {
      return "bg-green-500"
    }
    return "bg-blue-500"
  }

  const formatSize = (size: string) => {
    // If size is already formatted (e.g., "42 GB"), return as is
    if (size.includes(" ")) return size

    // Try to parse as number
    const sizeNum = Number.parseInt(size, 10)
    if (isNaN(sizeNum)) return size

    // Format based on size
    if (sizeNum >= 1e9) {
      return `${(sizeNum / 1e9).toFixed(1)} GB`
    } else if (sizeNum >= 1e6) {
      return `${(sizeNum / 1e6).toFixed(1)} MB`
    } else {
      return `${sizeNum} bytes`
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Model Status</CardTitle>
          <CardDescription>Currently loaded models and their memory allocation</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchModelStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/15 p-4 text-center text-destructive">
            <p>Error loading model status: {error}</p>
            <Button variant="outline" size="sm" onClick={fetchModelStatus} className="mt-2">
              Retry
            </Button>
          </div>
        ) : models.length === 0 ? (
          <div className="rounded-md bg-muted p-4 text-center">
            <p className="text-muted-foreground">No models currently loaded in memory</p>
            <p className="text-xs text-muted-foreground mt-1">Models will appear here when they are loaded by Ollama</p>
          </div>
        ) : (
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{model.name}</div>
                  <Badge variant="outline" className="flex items-center">
                    {getProcessorIcon(model.processor)}
                    {model.processor}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Size: {formatSize(model.size)}</span>
                    <span>{model.until}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${getProcessorColor(model.processor)}`}
                      style={{ width: model.processor.includes("%") ? model.processor : "100%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
