"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock, Code, Database, Edit, FileCode, MoreVertical, Play, Settings, Trash2 } from "lucide-react"

interface Tool {
  id: string
  name: string
  description: string
  script: string
  category: string
  lastRun?: Date
  createdAt: Date
  updatedAt: Date
}

interface ToolCardProps {
  tool: Tool
  onSelect: () => void
  onRun: () => void
  onDelete: () => void
}

export function ToolCard({ tool, onSelect, onRun, onDelete }: ToolCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="h-4 w-4" />
      case "llm":
        return <FileCode className="h-4 w-4" />
      default:
        return <Code className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="px-2 py-0">
            <div className="flex items-center gap-1">
              {getCategoryIcon(tool.category)}
              <span className="capitalize">{tool.category}</span>
            </div>
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onRun}>
                <Play className="mr-2 h-4 w-4" />
                <span>Run</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSelect}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{tool.name}</CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-xs text-muted-foreground">
          {tool.lastRun && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last run: {new Date(tool.lastRun).toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onSelect}>
          <Settings className="mr-2 h-3 w-3" />
          Configure
        </Button>
        <Button size="sm" onClick={onRun}>
          <Play className="mr-2 h-3 w-3" />
          Run
        </Button>
      </CardFooter>
    </Card>
  )
}
