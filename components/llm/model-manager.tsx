"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, BrainCircuit, Download, Edit, RefreshCw, Trash } from "lucide-react"
import { ModelConfig } from "@/components/llm/model-config"

// Types for Ollama models
interface OllamaModel {
  name: string
  size: number
  modified_at: string
  quantization_level?: string
  family?: string
  parameter_size?: string
  status?: "ready" | "downloading" | "error"
  progress?: number
}

export function ModelManager() {
  const [activeTab, setActiveTab] = useState("installed")
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<null | { success: boolean; message: string }>(null)
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [modelToDownload, setModelToDownload] = useState("llama3")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [modelTemplate, setModelTemplate] = useState("")

  // Test the connection on component mount
  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setIsConnecting(true)
    setConnectionStatus(null)

    try {
      const response = await fetch("/api/llm/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ollamaUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus({
          success: true,
          message: "Successfully connected to Ollama",
        })
        fetchModels()
      } else {
        setConnectionStatus({
          success: false,
          message: `Connection failed: ${data.error}`,
        })
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Connection failed: ${(error as Error).message}`,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchModels = async () => {
    setIsLoadingModels(true)
    try {
      const response = await fetch("/api/llm/list-models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ollamaUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setAvailableModels(data.models)
      } else {
        console.error("Failed to fetch models:", data.error)
      }
    } catch (error) {
      console.error("Error fetching models:", error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  const downloadModel = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      // Start the download
      const response = await fetch("/api/llm/download-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ollamaUrl, model: modelToDownload }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Mock progress updates (in a real app, you'd use SSE or WebSockets)
      const mockDownload = () => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 10
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setIsDownloading(false)
            fetchModels() // Refresh the model list
          }
          setDownloadProgress(Math.min(progress, 100))
        }, 1000)
      }

      mockDownload()
    } catch (error) {
      console.error("Error downloading model:", error)
      setIsDownloading(false)
    }
  }

  const deleteModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}?`)) return

    try {
      const response = await fetch("/api/llm/delete-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ollamaUrl, model: modelName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Remove the model from the list
        setAvailableModels(availableModels.filter((model) => model.name !== modelName))
        if (selectedModel === modelName) {
          setSelectedModel(null)
        }
      } else {
        console.error("Failed to delete model:", data.error)
      }
    } catch (error) {
      console.error("Error deleting model:", error)
    }
  }

  const createCustomModel = async () => {
    if (!modelTemplate.trim()) return

    try {
      const response = await fetch("/api/llm/create-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ollamaUrl, modelfile: modelTemplate }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setModelTemplate("")
        fetchModels() // Refresh the model list
      } else {
        console.error("Failed to create model:", data.error)
      }
    } catch (error) {
      console.error("Error creating model:", error)
    }
  }

  // Mock models for demonstration
  const mockModels = [
    {
      name: "llama3",
      size: 4200000000,
      modified_at: "2025-04-24T10:30:00Z",
      family: "LLaMA",
      parameter_size: "8B",
      quantization_level: "None",
      status: "ready",
    },
    {
      name: "mistral",
      size: 3800000000,
      modified_at: "2025-04-23T14:45:00Z",
      family: "Mistral",
      parameter_size: "7B",
      quantization_level: "None",
      status: "ready",
    },
    {
      name: "phi3",
      size: 2500000000,
      modified_at: "2025-04-22T09:15:00Z",
      family: "Phi",
      parameter_size: "3B",
      quantization_level: "None",
      status: "ready",
    },
  ] as OllamaModel[]

  // Use mock data if no models are available
  const displayModels = availableModels.length > 0 ? availableModels : mockModels

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ollama Connection</CardTitle>
              <CardDescription>Configure your connection to Ollama</CardDescription>
            </div>
            <Button variant="outline" onClick={testConnection} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="Ollama API URL" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} />
              <p className="text-sm text-muted-foreground">
                The URL of your Ollama API server. Default is http://localhost:11434
              </p>
            </div>

            {connectionStatus && (
              <Alert variant={connectionStatus.success ? "default" : "destructive"}>
                {connectionStatus.success ? <BrainCircuit className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{connectionStatus.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{connectionStatus.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installed">Installed Models</TabsTrigger>
          <TabsTrigger value="download">Download Models</TabsTrigger>
          <TabsTrigger value="custom">Custom Models</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Installed Models</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchModels} disabled={isLoadingModels}>
                  {isLoadingModels ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Family</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Quantization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayModels.length > 0 ? (
                      displayModels.map((model) => (
                        <TableRow key={model.name}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>{model.family || "Unknown"}</TableCell>
                          <TableCell>{model.parameter_size || "Unknown"}</TableCell>
                          <TableCell>{model.quantization_level || "None"}</TableCell>
                          <TableCell>
                            <Badge variant={model.status === "ready" ? "default" : "outline"}>
                              {model.status || "Ready"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedModel(model.name)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteModel(model.name)}
                                className="h-8 w-8"
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {isLoadingModels ? (
                            <div className="flex items-center justify-center">
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Loading models...
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <BrainCircuit className="h-8 w-8 opacity-50" />
                              <p className="mt-2">No models found</p>
                              <p className="text-sm">Connect to Ollama and download models to get started</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedModel && (
            <ModelConfig modelName={selectedModel} onClose={() => setSelectedModel(null)} ollamaUrl={ollamaUrl} />
          )}
        </TabsContent>

        <TabsContent value="download" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Download Models</CardTitle>
              <CardDescription>Download pre-trained models from Ollama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Model name (e.g., llama3)"
                      value={modelToDownload}
                      onChange={(e) => setModelToDownload(e.target.value)}
                    />
                  </div>
                  <Button onClick={downloadModel} disabled={isDownloading || !modelToDownload}>
                    {isDownloading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </div>

                {isDownloading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Downloading {modelToDownload}...</span>
                      <span>{Math.round(downloadProgress)}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-2" />
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Popular Models</h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("llama3")}
                    >
                      llama3
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("llama3:8b")}
                    >
                      llama3:8b
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("mistral")}
                    >
                      mistral
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("phi3")}
                    >
                      phi3
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("gemma:2b")}
                    >
                      gemma:2b
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("gemma:7b")}
                    >
                      gemma:7b
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("codellama")}
                    >
                      codellama
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setModelToDownload("neural-chat")}
                    >
                      neural-chat
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Models</CardTitle>
              <CardDescription>Create custom models with Modelfiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter Modelfile content..."
                    value={modelTemplate}
                    onChange={(e) => setModelTemplate(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Example: FROM llama3
                    <br />
                    PARAMETER temperature 0.7
                    <br />
                    SYSTEM You are a helpful AI assistant.
                  </p>
                </div>

                <Button onClick={createCustomModel} disabled={!modelTemplate.trim()}>
                  Create Custom Model
                </Button>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Modelfile Templates</h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setModelTemplate(
                          "FROM llama3\n\nPARAMETER temperature 0.7\nPARAMETER top_p 0.9\nPARAMETER top_k 40\n\nSYSTEM You are a helpful AI assistant.",
                        )
                      }
                    >
                      General Assistant
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setModelTemplate(
                          "FROM codellama\n\nPARAMETER temperature 0.2\nPARAMETER top_p 0.95\n\nSYSTEM You are a coding assistant. You help write clean, efficient code and explain programming concepts.",
                        )
                      }
                    >
                      Code Assistant
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setModelTemplate(
                          "FROM llama3\n\nPARAMETER temperature 0.3\nPARAMETER top_p 0.9\n\nSYSTEM You are a data analysis assistant. You help analyze data, explain statistical concepts, and provide insights.",
                        )
                      }
                    >
                      Data Analyst
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setModelTemplate(
                          "FROM mistral\n\nPARAMETER temperature 0.8\nPARAMETER top_p 0.9\n\nSYSTEM You are a creative writing assistant. You help generate creative content, stories, and ideas.",
                        )
                      }
                    >
                      Creative Writer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
