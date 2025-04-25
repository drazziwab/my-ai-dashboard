"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertCircle, Bot, Database, FileText, Loader2, Plus, Send, Upload } from "lucide-react"
import { DocumentCard } from "@/components/rag/document-card"
import { KnowledgeBaseCard } from "@/components/rag/knowledge-base-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Types
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

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  sources?: {
    documentId: string
    documentName: string
    excerpt: string
  }[]
}

export function RagInterface() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "company_overview.pdf",
      type: "pdf",
      size: 1250000,
      content: "This is a sample company overview document...",
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      vectorized: true,
    },
    {
      id: "2",
      name: "product_documentation.docx",
      type: "docx",
      size: 2340000,
      content: "Product documentation with technical specifications...",
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      vectorized: true,
    },
    {
      id: "3",
      name: "quarterly_report.xlsx",
      type: "xlsx",
      size: 1820000,
      content: "Financial data and quarterly performance metrics...",
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      vectorized: false,
    },
  ])

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: "1",
      name: "Company Information",
      description: "General company information and overview",
      documents: ["1"],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "Product Knowledge",
      description: "Technical documentation and product specifications",
      documents: ["2"],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "I am an AI assistant with access to your knowledge base. Ask me questions about your documents.",
      timestamp: new Date(),
    },
  ])

  const [activeTab, setActiveTab] = useState("documents")
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isCreatingKB, setIsCreatingKB] = useState(false)
  const [newKnowledgeBase, setNewKnowledgeBase] = useState<Omit<KnowledgeBase, "id" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    documents: [],
  })
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Add a new document
          const newDoc: Document = {
            id: Date.now().toString(),
            name: "new_document.pdf",
            type: "pdf",
            size: 1500000,
            content: "Content of the new document...",
            uploadedAt: new Date(),
            vectorized: false,
          }

          setDocuments((prev) => [...prev, newDoc])

          return 0
        }
        return prev + 10
      })
    }, 300)
  }

  const handleCreateKnowledgeBase = () => {
    if (!newKnowledgeBase.name) return

    const kb: KnowledgeBase = {
      ...newKnowledgeBase,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setKnowledgeBases((prev) => [...prev, kb])
    setIsCreatingKB(false)
    setNewKnowledgeBase({
      name: "",
      description: "",
      documents: [],
    })
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))

    // Also remove from any knowledge bases
    setKnowledgeBases((prev) =>
      prev.map((kb) => ({
        ...kb,
        documents: kb.documents.filter((docId) => docId !== id),
        updatedAt: new Date(),
      })),
    )
  }

  const handleDeleteKnowledgeBase = (id: string) => {
    setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id))
    if (selectedKnowledgeBase === id) {
      setSelectedKnowledgeBase(null)
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedKnowledgeBase) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response with document references
    setTimeout(() => {
      const kb = knowledgeBases.find((kb) => kb.id === selectedKnowledgeBase)
      const docIds = kb?.documents || []
      const docs = documents.filter((doc) => docIds.includes(doc.id))

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Here's the information I found about "${inputValue}" in your knowledge base:
        
Based on the documents you've provided, I can see that this topic is covered in several places. The main points are:

1. Key information from the first relevant document
2. Additional context from the second document
3. Some related details that might be helpful

Let me know if you need more specific information or have follow-up questions!`,
        timestamp: new Date(),
        sources: docs.map((doc) => ({
          documentId: doc.id,
          documentName: doc.name,
          excerpt: doc.content.substring(0, 100) + "...",
        })),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 2000)
  }

  const getDocumentById = (id: string) => {
    return documents.find((doc) => doc.id === id)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="documents" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="knowledge-bases">Knowledge Bases</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {activeTab === "documents" && (
            <Button onClick={handleFileUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          )}

          {activeTab === "knowledge-bases" && (
            <Dialog open={isCreatingKB} onOpenChange={setIsCreatingKB}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Knowledge Base
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Knowledge Base</DialogTitle>
                  <DialogDescription>Create a new knowledge base from your uploaded documents.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kb-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="kb-name"
                      value={newKnowledgeBase.name}
                      onChange={(e) => setNewKnowledgeBase({ ...newKnowledgeBase, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kb-description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="kb-description"
                      value={newKnowledgeBase.description}
                      onChange={(e) => setNewKnowledgeBase({ ...newKnowledgeBase, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Documents</Label>
                    <div className="col-span-3 space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`doc-${doc.id}`}
                            checked={newKnowledgeBase.documents.includes(doc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewKnowledgeBase({
                                  ...newKnowledgeBase,
                                  documents: [...newKnowledgeBase.documents, doc.id],
                                })
                              } else {
                                setNewKnowledgeBase({
                                  ...newKnowledgeBase,
                                  documents: newKnowledgeBase.documents.filter((id) => id !== doc.id),
                                })
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`doc-${doc.id}`} className="text-sm font-normal">
                            {doc.name}
                          </Label>
                        </div>
                      ))}
                      {documents.length === 0 && (
                        <p className="text-sm text-muted-foreground">No documents available. Upload documents first.</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingKB(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateKnowledgeBase}
                    disabled={!newKnowledgeBase.name || newKnowledgeBase.documents.length === 0}
                  >
                    Create Knowledge Base
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Uploading and processing document... {uploadProgress}%
            </p>
          </div>
        )}

        <TabsContent value="documents" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={() => handleDeleteDocument(doc.id)} />
            ))}

            {documents.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No documents yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Upload documents to create knowledge bases and query them with AI.
                </p>
                <Button onClick={handleFileUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="knowledge-bases" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeBases.map((kb) => (
              <KnowledgeBaseCard
                key={kb.id}
                knowledgeBase={kb}
                documents={kb.documents.map((id) => getDocumentById(id)).filter(Boolean) as Document[]}
                onDelete={() => handleDeleteKnowledgeBase(kb.id)}
                onSelect={() => {
                  setSelectedKnowledgeBase(kb.id)
                  setActiveTab("chat")
                }}
              />
            ))}

            {knowledgeBases.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No knowledge bases yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Create knowledge bases from your documents to query them with AI.
                </p>
                <Button onClick={() => setIsCreatingKB(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Knowledge Base
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedKnowledgeBase ? (
                    <>Chat with {knowledgeBases.find((kb) => kb.id === selectedKnowledgeBase)?.name}</>
                  ) : (
                    <>Select a Knowledge Base</>
                  )}
                </CardTitle>

                {!selectedKnowledgeBase && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Select Knowledge Base</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Knowledge Bases</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {knowledgeBases.map((kb) => (
                        <DropdownMenuItem key={kb.id} onClick={() => setSelectedKnowledgeBase(kb.id)}>
                          {kb.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {selectedKnowledgeBase && (
                  <Button variant="outline" onClick={() => setSelectedKnowledgeBase(null)}>
                    Change Knowledge Base
                  </Button>
                )}
              </div>
              <CardDescription>
                {selectedKnowledgeBase ? (
                  <>Ask questions about your documents and get AI-powered answers with citations.</>
                ) : (
                  <>Select a knowledge base to start chatting with your documents.</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedKnowledgeBase ? (
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          <Avatar>
                            <AvatarFallback>
                              {message.role === "user" ? "U" : <Bot className="h-5 w-5" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`space-y-2 ${message.role === "user" ? "text-right" : ""}`}>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{message.role === "user" ? "You" : "AI Assistant"}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div
                              className={`rounded-lg p-3 ${
                                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {message.sources && message.sources.length > 0 && (
                              <div className="space-y-2 mt-2">
                                <p className="text-xs font-medium">Sources:</p>
                                {message.sources.map((source, index) => (
                                  <div key={index} className="text-xs bg-muted/50 rounded p-2">
                                    <p className="font-medium">{source.documentName}</p>
                                    <p className="text-muted-foreground mt-1">{source.excerpt}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                        <Avatar>
                          <AvatarFallback>
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">AI Assistant</p>
                            <span className="text-xs text-muted-foreground">Searching documents...</span>
                          </div>
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-primary"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-primary"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Knowledge Base Selected</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Select a knowledge base to start chatting with your documents.
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>Select Knowledge Base</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Knowledge Bases</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {knowledgeBases.map((kb) => (
                        <DropdownMenuItem key={kb.id} onClick={() => setSelectedKnowledgeBase(kb.id)}>
                          {kb.name}
                        </DropdownMenuItem>
                      ))}
                      {knowledgeBases.length === 0 && (
                        <DropdownMenuItem disabled>No knowledge bases available</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CardContent>
            {selectedKnowledgeBase && (
              <CardFooter>
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Ask a question about your documents..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isLoading || !selectedKnowledgeBase}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim() || !selectedKnowledgeBase}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
