"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, FileText, Plus } from "lucide-react"

interface GoogleDocsProps {
  userEmail: string
}

export function GoogleDocs({ userEmail }: GoogleDocsProps) {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch documents from the Google Docs API
      // For now, we'll just simulate it with mock data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockDocuments = [
        {
          id: "doc-1",
          name: "Project Proposal",
          lastModified: "2025-04-24T14:32:12.000Z",
          url: "https://docs.google.com/document/d/e/2PACX-1vT",
        },
        {
          id: "doc-2",
          name: "Meeting Notes - April 2025",
          lastModified: "2025-04-22T12:18:45.000Z",
          url: "https://docs.google.com/document/d/e/2PACX-2vT",
        },
        {
          id: "doc-3",
          name: "Quarterly Report Q1 2025",
          lastModified: "2025-04-15T10:05:32.000Z",
          url: "https://docs.google.com/document/d/e/2PACX-3vT",
        },
        {
          id: "doc-4",
          name: "Product Roadmap",
          lastModified: "2025-04-10T16:45:22.000Z",
          url: "https://docs.google.com/document/d/e/2PACX-4vT",
        },
        {
          id: "doc-5",
          name: "Team Handbook",
          lastModified: "2025-03-28T14:12:08.000Z",
          url: "https://docs.google.com/document/d/e/2PACX-5vT",
        },
      ]

      setDocuments(mockDocuments)
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter documents based on search term
  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" onClick={fetchDocuments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filteredDocuments.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No documents found</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDoc(doc.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Last modified: {new Date(doc.lastModified).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <iframe
            src="https://docs.google.com/document/d/e/2PACX-1vT/preview"
            width="100%"
            height="500"
            frameBorder="0"
            title="Google Docs Embed"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  )
}
