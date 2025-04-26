"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText, Loader2, Plus, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Document {
  id: string
  name: string
  url: string
  lastModified: string
}

interface GoogleDocsProps {
  isConnected: boolean
}

export function GoogleDocs({ isConnected }: GoogleDocsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDoc, setShowCreateDoc] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: "",
    content: "",
  })
  const [creatingDoc, setCreatingDoc] = useState(false)

  useEffect(() => {
    if (isConnected) {
      fetchDocuments()
    }
  }, [isConnected])

  const fetchDocuments = async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/google/docs/list")

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDocuments(data.documents || [])
        } else {
          setError(data.error || "Failed to fetch documents")
        }
      } else {
        setError("Failed to fetch documents")
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      setError("An error occurred while fetching documents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDocument = async () => {
    if (!isConnected || !newDoc.title) return

    setCreatingDoc(true)
    setError(null)

    try {
      const response = await fetch("/api/google/docs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newDoc.title,
          content: newDoc.content,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Reset form and close dialog
          setNewDoc({
            title: "",
            content: "",
          })
          setShowCreateDoc(false)

          // Refresh documents
          fetchDocuments()
        } else {
          setError(data.error || "Failed to create document")
        }
      } else {
        setError("Failed to create document")
      }
    } catch (error) {
      console.error("Error creating document:", error)
      setError("An error occurred while creating the document")
    } finally {
      setCreatingDoc(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Docs Integration</CardTitle>
          <CardDescription>Connect your Google Docs to create and manage documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              You need to connect your Google Docs first. Go to the Overview tab and connect Docs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Docs</CardTitle>
              <CardDescription>Create and manage your Google Docs</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={showCreateDoc} onOpenChange={setShowCreateDoc}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                    <DialogDescription>Create a new Google Doc with initial content</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-title">Document Title</Label>
                      <Input
                        id="doc-title"
                        value={newDoc.title}
                        onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                        placeholder="Project Proposal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-content">Initial Content</Label>
                      <Textarea
                        id="doc-content"
                        value={newDoc.content}
                        onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                        placeholder="Type your document content here..."
                        rows={8}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDoc(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateDocument} disabled={creatingDoc || !newDoc.title}>
                      {creatingDoc ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Document"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {doc.name}
                          </a>
                          <div className="text-xs text-muted-foreground">Last modified: {doc.lastModified}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No documents found. Try refreshing or creating a new document.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
