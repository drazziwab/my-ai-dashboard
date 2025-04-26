"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, BrainCircuit, CheckCircle2, Download, ExternalLink, RefreshCw, Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ModelStatus } from "@/components/llm/model-status"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

export function LlmSettings() {
  const [activeTab, setActiveTab] = useState("models")
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<null | { success: boolean; message: string }>(null)
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxTokens: 2048,
    contextWindow: 4096,
    systemPrompt: "You are a helpful AI assistant.",
  })

  // Model to download
  const [modelToDownload, setModelToDownload] = useState("llama3")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Command execution
  const [showCommandDialog, setShowCommandDialog] = useState(false)
  const [commandInput, setCommandInput] = useState("ollama ps")
  const [commandOutput, setCommandOutput] = useState("")
  const [isExecutingCommand, setIsExecutingCommand] = useState(false)

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

  const handleModelSelect = (model: OllamaModel) => {
    setSelectedModel(model.name)
    // In a real app, you would fetch the model's configuration
  }

  const saveModelConfig = async () => {
    if (!selectedModel) return

    try {
      const response = await fetch("/api/llm/save-model-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: ollamaUrl,
          model: selectedModel,
          config: {
            ...modelConfig,
            num_ctx: modelConfig.contextWindow, // Ollama specific
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus({
          success: true,
          message: "Model configuration saved successfully",
        })
      } else {
        setConnectionStatus({
          success: false,
          message: `Failed to save configuration: ${data.error}`,
        })
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Failed to save configuration: ${(error as Error).message}`,
      })
    }
  }

  const executeCommand = async () => {
    if (!commandInput.trim()) return

    setIsExecutingCommand(true)
    setCommandOutput("")

    try {
      const response = await fetch("/api/llm/execute-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: commandInput }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCommandOutput(data.output)
      } else {
        throw new Error(data.error || "Failed to execute command")
      }
    } catch (error) {
      setCommandOutput(`Error: ${(error as Error).message}`)
    } finally {
      setIsExecutingCommand(false)
    }
  }

  // Fetch models on initial load if URL is set
  useEffect(() => {
    if (ollamaUrl) {
      testConnection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LLM Configuration</CardTitle>
          <CardDescription>Configure your Ollama LLM integration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="ollamaUrl">Ollama API URL</Label>
                <Input
                  id="ollamaUrl"
                  placeholder="http://localhost:11434"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  The URL of your Ollama API server. Default is http://localhost:11434
                </p>
              </div>

              {connectionStatus && (
                <Alert variant={connectionStatus.success ? "default" : "destructive"}>
                  {connectionStatus.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{connectionStatus.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{connectionStatus.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowCommandDialog(true)}>
                  <Terminal className="mr-2 h-4 w-4" />
                  Execute Command
                </Button>

                <Button onClick={testConnection} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Available Models</h3>
                <Button variant="outline" size="sm" onClick={fetchModels} disabled={isLoadingModels}>
                  {isLoadingModels ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>

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
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <TableRow key={model.name} className={selectedModel === model.name ? "bg-muted/50" : ""}>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleModelSelect(model)}
                              className="h-8 px-2"
                            >
                              Configure
                            </Button>
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

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Download New Model</h3>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="modelToDownload">Model Name</Label>
                    <Input
                      id="modelToDownload"
                      placeholder="llama3"
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

                <div className="rounded-md border p-4">
                  <h4 className="font-medium">Popular Models</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
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
                  </div>
                </div>

                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/llm/models">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Advanced Model Management
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4 pt-4">
              <ModelStatus ollamaUrl={ollamaUrl} />
            </TabsContent>

            <TabsContent value="config" className="space-y-4 pt-4">
              {selectedModel ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Configure Model: {selectedModel}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="temperature">Temperature: {modelConfig.temperature}</Label>
                      </div>
                      <Slider
                        id="temperature"
                        min={0}
                        max={2}
                        step={0.1}
                        value={[modelConfig.temperature]}
                        onValueChange={(value) => setModelConfig({ ...modelConfig, temperature: value[0] })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls randomness: Lower values are more deterministic, higher values are more creative.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="topP">Top P: {modelConfig.topP}</Label>
                      </div>
                      <Slider
                        id="topP"
                        min={0}
                        max={1}
                        step={0.05}
                        value={[modelConfig.topP]}
                        onValueChange={(value) => setModelConfig({ ...modelConfig, topP: value[0] })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls diversity via nucleus sampling: 0.9 considers the top 90% of probability mass.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="topK">Top K: {modelConfig.topK}</Label>
                      </div>
                      <Slider
                        id="topK"
                        min={1}
                        max={100}
                        step={1}
                        value={[modelConfig.topK]}
                        onValueChange={(value) => setModelConfig({ ...modelConfig, topK: value[0] })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Limits vocabulary to K most likely tokens at each step.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="contextWindow">Context Window (num_ctx): {modelConfig.contextWindow}</Label>
                      </div>
                      <Slider
                        id="contextWindow"
                        min={1024}
                        max={32768}
                        step={1024}
                        value={[modelConfig.contextWindow]}
                        onValueChange={(value) => setModelConfig({ ...modelConfig, contextWindow: value[0] })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum context length. Larger values use more memory.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maxTokens">Max Tokens: {modelConfig.maxTokens}</Label>
                      </div>
                      <Slider
                        id="maxTokens"
                        min={10}
                        max={4096}
                        step={1}
                        value={[modelConfig.maxTokens]}
                        onValueChange={(value) => setModelConfig({ ...modelConfig, maxTokens: value[0] })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of tokens to generate in the response.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="systemPrompt">System Prompt</Label>
                      <Textarea
                        id="systemPrompt"
                        placeholder="You are a helpful AI assistant."
                        value={modelConfig.systemPrompt}
                        onChange={(e) => setModelConfig({ ...modelConfig, systemPrompt: e.target.value })}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Instructions that define the behavior and capabilities of the model.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveModelConfig}>Save Configuration</Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <BrainCircuit className="h-12 w-12 opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No Model Selected</h3>
                  <p className="mt-2 max-w-md">
                    Select a model from the Models tab to configure its parameters and behavior.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("models")}>
                    Go to Models
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showCommandDialog} onOpenChange={setShowCommandDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Ollama Command</DialogTitle>
            <DialogDescription>Run Ollama CLI commands directly from the dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="command-input">Command</Label>
              <Input
                id="command-input"
                placeholder="ollama ps"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter an Ollama command to execute on the server</p>
            </div>
            {commandOutput && (
              <div className="space-y-2">
                <Label>Output</Label>
                <div className="bg-muted p-3 rounded-md font-mono text-sm whitespace-pre-wrap">{commandOutput}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommandDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeCommand} disabled={isExecutingCommand || !commandInput.trim()}>
              {isExecutingCommand ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Terminal className="mr-2 h-4 w-4" />
                  Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
