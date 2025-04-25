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
import { Database, Edit, File, MessageSquare, MoreVertical, Trash2 } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: number
  content: string
  uploadedAt: Date
  vectorized: boolean
}

interface KnowledgeBase {
  id: string
  name: string
  description: string
  documents: string[]
  createdAt: Date
  updatedAt: Date
}

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase
  documents: Document[]
  onDelete: () => void
  onSelect: () => void
}

export function KnowledgeBaseCard({ knowledgeBase, documents, onDelete, onSelect }: KnowledgeBaseCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="px-2 py-0">
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </span>
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
              <DropdownMenuItem>
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
        <CardTitle className="text-base">{knowledgeBase.name}</CardTitle>
        <CardDescription>{knowledgeBase.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1">
          {documents.slice(0, 3).map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 text-xs">
              <File className="h-3 w-3" />
              <span className="truncate">{doc.name}</span>
            </div>
          ))}
          {documents.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{documents.length - 3} more document{documents.length - 3 !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onSelect}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat with Knowledge Base
        </Button>
      </CardFooter>
    </Card>
  )
}
