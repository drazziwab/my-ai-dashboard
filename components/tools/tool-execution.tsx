"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertCircle, Check, ChevronDown, ChevronUp, Clock, Loader2 } from "lucide-react"
import { useState } from "react"

interface ToolExecution {
  id: string
  toolId: string
  toolName: string
  status: "running" | "completed" | "failed"
  output: string
  startTime: Date
  endTime?: Date
  error?: string
}

interface ToolExecutionProps {
  execution: ToolExecution
}

export function ToolExecution({ execution }: ToolExecutionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDuration = () => {
    if (!execution.endTime) return "Running..."

    const duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()
    const seconds = Math.floor(duration / 1000)

    if (seconds < 60) return `${seconds} seconds`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes} min ${remainingSeconds} sec`
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={isOpen ? "border-primary" : ""}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{execution.toolName}</CardTitle>
              {getStatusBadge(execution.status)}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(execution.startTime).toLocaleString()}</span>
            <span className="mx-1">•</span>
            <span>{getDuration()}</span>
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="bg-muted rounded-md p-2 font-mono text-xs whitespace-pre-wrap overflow-auto max-h-[200px]">
              {execution.output}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
