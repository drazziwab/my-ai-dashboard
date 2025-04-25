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
import { Check, Clock, Download, File, FileText, MoreVertical, Trash2, Upload } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: number
  content: string
  uploadedAt: Date
  vectorized: boolean
}

interface DocumentCardProps {
  document: Document
  onDelete: () => void
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <File className="h-4 w-4 text-red-500" />
      case "docx":
        return <File className="h-4 w-4 text-blue-500" />
      case "xlsx":
        return <File className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="px-2 py-0">
            <div className="flex items-center gap-1">
              {getFileIcon(document.type)}
              <span className="uppercase">{document.type}</span>
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
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-base truncate">{document.name}</CardTitle>
        <CardDescription>{formatFileSize(document.size)}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {document.vectorized ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="mr-1 h-3 w-3" />
            Vectorized
          </Badge>
        ) : (
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-3 w-3" />
            Vectorize
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
