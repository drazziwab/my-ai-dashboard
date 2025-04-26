"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Bot,
  Download,
  RefreshCw,
  SendIcon,
  Settings,
  Save,
  Trash2,
  Upload,
  FileText,
  Bookmark,
  Clock,
  ChevronDown,
  Copy,
  Share2,
  Sparkles,
  Zap,
  Terminal,
  Cpu,
  Loader2,
} from "lucide-react"
import { ChatMessage } from "@/components/chat/chat-message"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ModelStatus } from "@/components/llm/model-status"

// Types
interface Message {
  id?: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  name: string
  messages: Message[]
  model: string
  createdAt: Date
  updatedAt: Date
}

interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: string
}

// Mock data for models when API fails
const MOCK_MODELS = [
  "llama3",
  "llama3:8b",
  "llama3:70b",
  "mistral",
  "mistral:7b",
  "gemma:2b",
  "gemma:7b",
  "phi:2.7b",
  "codellama:7b",
  "neural-chat:7b",
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("llama3")
  const [availableModels, setAvailableModels] = useState<string[]>(MOCK_MODELS)
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    systemPrompt: "You are a helpful AI assistant.",
    contextWindow: 4096,
    repeatPenalty: 1.1,
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
    stopSequences: [],
  })
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("default")
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([
    {
      id: "1",
      name: "SQL Query Generator",
      description: "Generate SQL queries based on natural language",
      prompt: "Generate a SQL query that answers the following question: {{question}}",
      category: "Database",
    },
    {
      id: "2",
      name: "Data Analysis",
      description: "Analyze data patterns and provide insights",
      prompt: "Analyze the following data and provide insights: {{data}}",
      category: "Analytics",
    },
    {
      id: "3",
      name: "Code Explanation",
      description: "Explain code snippets in simple terms",
      prompt: "Explain the following code in simple terms: {{code}}",
      category: "Development",
    },
  ])
  const [showPromptLibrary, setShowPromptLibrary] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({})
  const [streamingEnabled, setStreamingEnabled] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [showModelStatus, setShowModelStatus] = useState(false)
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434")
  const [showCommandDialog, setShowCommandDialog] = useState(false)
  const [commandInput, setCommandInput] = useState("")
  const [commandOutput, setCommandOutput] = useState("")
  const [isExecutingCommand, setIsExecutingCommand] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSettings, setShowSettings] = useState(false)

  // First, define the fetchAvailableModels function before the useEffect
  const fetchAvailableModels = async () => {
    try {
      // Start with mock models to ensure we always have something to display
      setAvailableModels(MOCK_MODELS)

      // Attempt to fetch real models
      const response = await fetch("/api/llm/list-models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ollamaUrl }),
      })

      // Check if response is OK and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check content type to ensure we're getting JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.models)) {
        // Only update if we got valid data
        const modelNames = data.models.map((model: any) => model.name || model)
        if (modelNames.length > 0) {
          setAvailableModels(modelNames)
          setSelectedModel(modelNames[0])
        }
      } else {
        console.error("No models returned from API")
        // Fallback models
        setAvailableModels(["gpt-4", "gpt-3.5-turbo", "claude-2", "llama-2-70b"])
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      // Fallback models
      setAvailableModels(["gpt-4", "gpt-3.5-turbo", "claude-2", "llama-2-70b"])
    }
  }

  // Then update the useEffect to call this function
  useEffect(() => {
    fetchAvailableModels()
  }, [ollamaUrl])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Log the chat request to the database
      try {
        await fetch("/api/llm/log-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            message: input,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        console.error("Error logging chat:", error)
      }

      // Prepare context from files if any
      let context = ""
      if (uploadedFiles.length > 0) {
        Object.values(fileContents).forEach((content) => {
          context += content + "\n\n"
        })
      }

      // Send the message to the API
      const response = await fetch("/api/llm/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: ollamaUrl,
          model: selectedModel,
          message: input,
          systemPrompt: modelConfig.systemPrompt,
          context: context,
          options: {
            temperature: modelConfig.temperature,
            top_p: modelConfig.topP,
            max_tokens: modelConfig.maxTokens,
            num_ctx: modelConfig.contextWindow, // Ollama specific
            repeat_penalty: modelConfig.repeatPenalty,
            presence_penalty: modelConfig.presencePenalty,
            frequency_penalty: modelConfig.frequencyPenalty,
            stop: modelConfig.stopSequences,
          },
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        console.error("Chat API returned error:", data.error)
        const errorMessage: Message = {
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommand = async (command: string) => {
    // Parse the command
    const parts = command.slice(1).split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    // Handle different commands
    switch (cmd) {
      case "set":
        if (args[0] === "parameter" && args.length >= 3) {
          const paramName = args[1]
          const paramValue = args[2]

          // Handle different parameters
          switch (paramName) {
            case "num_ctx":
              const ctxValue = Number.parseInt(paramValue, 10)
              if (!isNaN(ctxValue)) {
                setModelConfig((prev) => ({ ...prev, contextWindow: ctxValue }))
                const systemMessage: Message = {
                  role: "system",
                  content: `Context window size set to ${ctxValue}`,
                  timestamp: new Date(),
                }
                setMessages((prev) => [...prev, systemMessage])
              }
              break
            case "temperature":
              const tempValue = Number.parseFloat(paramValue)
              if (!isNaN(tempValue)) {
                setModelConfig((prev) => ({ ...prev, temperature: tempValue }))
                const systemMessage: Message = {
                  role: "system",
                  content: `Temperature set to ${tempValue}`,
                  timestamp: new Date(),
                }
                setMessages((prev) => [...prev, systemMessage])
              }
              break
            default:
              const systemMessage: Message = {
                role: "system",
                content: `Unknown parameter: ${paramName}`,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, systemMessage])
          }
        } else {
          const systemMessage: Message = {
            role: "system",
            content: "Usage: /set parameter [param_name] [value]",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        }
        break

      case "models":
        await fetchAvailableModels()
        const modelsMessage: Message = {
          role: "system",
          content: `Available models:\n${availableModels.join("\n")}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, modelsMessage])
        break

      case "status":
        setShowModelStatus(true)
        break

      case "help":
        const helpMessage: Message = {
          role: "system",
          content: `Available commands:
/set parameter [param_name] [value] - Set a parameter value
/models - List available models
/status - Show model status
/help - Show this help message
/clear - Clear the chat history
/url [new_url] - Change the Ollama URL`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, helpMessage])
        break

      case "clear":
        clearChat()
        break

      case "url":
        if (args.length > 0) {
          setOllamaUrl(args[0])
          const urlMessage: Message = {
            role: "system",
            content: `Ollama URL set to ${args[0]}`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, urlMessage])
          // Refresh models with new URL
          await fetchAvailableModels()
        } else {
          const urlMessage: Message = {
            role: "system",
            content: `Current Ollama URL: ${ollamaUrl}`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, urlMessage])
        }
        break

      default:
        const unknownMessage: Message = {
          role: "system",
          content: `Unknown command: ${cmd}. Type /help for available commands.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, unknownMessage])
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setUploadedFiles([])
    setFileContents({})
  }

  const exportChat = () => {
    const chatExport = {
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      model: selectedModel,
      config: modelConfig,
      exportedAt: new Date(),
    }

    const blob = new Blob([JSON.stringify(chatExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const saveChat = () => {
    const sessionName = prompt("Enter a name for this chat session:", `Chat ${new Date().toLocaleString()}`)
    if (!sessionName) return

    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: sessionName,
      messages: [...messages],
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setChatSessions((prev) => [...prev, newSession])
    setCurrentSessionId(newSession.id)
  }

  const loadChat = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId)
    if (session) {
      setMessages([...session.messages])
      setSelectedModel(session.model)
      setCurrentSessionId(session.id)
    }
  }

  const deleteChat = (sessionId: string) => {
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (currentSessionId === sessionId) {
      setCurrentSessionId("default")
      clearChat()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Read file contents
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFileContents((prev) => ({
              ...prev,
              [file.name]: event.target?.result as string,
            }))
          }
        }
        reader.readAsText(file)
      })
    }
  }

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName))
    setFileContents((prev) => {
      const newContents = { ...prev }
      delete newContents[fileName]
      return newContents
    })
  }

  const applyPromptTemplate = (template: PromptTemplate) => {
    let promptText = template.prompt

    // Simple variable replacement
    if (promptText.includes("{{question}}")) {
      const question = prompt("Enter your question:")
      if (question) {
        promptText = promptText.replace("{{question}}", question)
      }
    }

    if (promptText.includes("{{data}}")) {
      const data = prompt("Enter your data:")
      if (data) {
        promptText = promptText.replace("{{data}}", data)
      }
    }

    if (promptText.includes("{{code}}")) {
      const code = prompt("Enter your code:")
      if (code) {
        promptText = promptText.replace("{{code}}", code)
      }
    }

    setInput(promptText)
    setShowPromptLibrary(false)
  }

  const savePromptTemplate = (newTemplate: Omit<PromptTemplate, "id">) => {
    const template: PromptTemplate = {
      ...newTemplate,
      id: Date.now().toString(),
    }
    setPromptTemplates((prev) => [...prev, template])
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Card
        className={`${showSettings || showChatHistory || showPromptLibrary || showModelStatus ? "lg:col-span-3" : "lg:col-span-4"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              Chat with
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading">Loading models...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardTitle>
            <CardDescription>Ask questions, get insights, and explore your data</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Files & Context</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload File</span>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                </DropdownMenuItem>
                {uploadedFiles.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Uploaded Files</DropdownMenuLabel>
                    {uploadedFiles.map((file) => (
                      <DropdownMenuItem key={file.name} className="flex justify-between">
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.name)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              className={showPromptLibrary ? "bg-muted" : ""}
            >
              <Bookmark className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowChatHistory(!showChatHistory)}
              className={showChatHistory ? "bg-muted" : ""}
            >
              <Clock className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowModelStatus(!showModelStatus)}
              className={showModelStatus ? "bg-muted" : ""}
            >
              <Cpu className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={showSettings ? "bg-muted" : ""}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={clearChat}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>New Chat</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={saveChat}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save Chat</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportChat}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export Chat</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowCommandDialog(true)}>
                  <Terminal className="mr-2 h-4 w-4" />
                  <span>Execute Command</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy Last Response</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Share Conversation</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[calc(60vh-100px)] min-h-[400px]">
            <ScrollArea className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-semibold">Welcome to |my-ai| Chat</h3>
                    <p className="text-muted-foreground">
                      Start a conversation with your |my-ai| model. Your chat history will be displayed here.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => <ChatMessage key={index} message={message} />)
              )}
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
                      <span className="text-xs text-muted-foreground">Thinking...</span>
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
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.name} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-xs">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[100px]">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => removeFile(file.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col gap-2">
            <Textarea
              placeholder="Type your message here... (or use / for commands)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] flex-1 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Switch id="streaming-mode" checked={streamingEnabled} onCheckedChange={setStreamingEnabled} />
                  <Label htmlFor="streaming-mode" className="text-xs">
                    Streaming
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-4">Context: {modelConfig.contextWindow}</div>
              </div>
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4 mr-2" />}
                Send
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {showSettings && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Chat Settings</CardTitle>
            <CardDescription>Configure model and response settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ollamaUrl">Ollama URL</Label>
                  <Input
                    id="ollamaUrl"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                  <p className="text-xs text-muted-foreground">The URL of your Ollama instance</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model-select">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model-select">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.length > 0 ? (
                        availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading">Loading models...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={fetchAvailableModels} className="mt-1">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Separator />

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
                      Lower values are more deterministic, higher values are more creative.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contextWindow">Context Window: {modelConfig.contextWindow}</Label>
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
                      Maximum context length (num_ctx). Larger values use more memory.
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
                    <p className="text-xs text-muted-foreground">Maximum length of the generated response.</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">Controls diversity via nucleus sampling.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="repeatPenalty">Repeat Penalty: {modelConfig.repeatPenalty}</Label>
                  </div>
                  <Slider
                    id="repeatPenalty"
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={[modelConfig.repeatPenalty]}
                    onValueChange={(value) => setModelConfig({ ...modelConfig, repeatPenalty: value[0] })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Penalizes repeated tokens. Higher values reduce repetition.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="presencePenalty">Presence Penalty: {modelConfig.presencePenalty}</Label>
                  </div>
                  <Slider
                    id="presencePenalty"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[modelConfig.presencePenalty]}
                    onValueChange={(value) => setModelConfig({ ...modelConfig, presencePenalty: value[0] })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Penalizes tokens that have appeared in the text at all.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="frequencyPenalty">Frequency Penalty: {modelConfig.frequencyPenalty}</Label>
                  </div>
                  <Slider
                    id="frequencyPenalty"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[modelConfig.frequencyPenalty]}
                    onValueChange={(value) => setModelConfig({ ...modelConfig, frequencyPenalty: value[0] })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Penalizes tokens based on their frequency in the text.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stopSequences">Stop Sequences</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stopSequence"
                      placeholder="Add stop sequence"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const value = (e.target as HTMLInputElement).value.trim()
                          if (value && !modelConfig.stopSequences.includes(value)) {
                            setModelConfig({
                              ...modelConfig,
                              stopSequences: [...modelConfig.stopSequences, value],
                            })
                            ;(e.target as HTMLInputElement).value = ""
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById("stopSequence") as HTMLInputElement
                        const value = input.value.trim()
                        if (value && !modelConfig.stopSequences.includes(value)) {
                          setModelConfig({
                            ...modelConfig,
                            stopSequences: [...modelConfig.stopSequences, value],
                          })
                          input.value = ""
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {modelConfig.stopSequences.map((seq, index) => (
                      <div key={index} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-xs">
                        <span>{seq}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={() => {
                            setModelConfig({
                              ...modelConfig,
                              stopSequences: modelConfig.stopSequences.filter((_, i) => i !== index),
                            })
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sequences that will cause the model to stop generating.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                placeholder="You are a helpful AI assistant."
                value={modelConfig.systemPrompt}
                onChange={(e) => setModelConfig({ ...modelConfig, systemPrompt: e.target.value })}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">Instructions that define the behavior of the AI.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showChatHistory && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Chat History</CardTitle>
            <CardDescription>Your saved conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={clearChat}>
                <RefreshCw className="mr-2 h-4 w-4" />
                New Chat
              </Button>

              {chatSessions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No saved chats yet</p>
                  <p className="text-xs mt-1">Your saved chats will appear here</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer ${
                          currentSessionId === session.id ? "bg-muted" : ""
                        }`}
                        onClick={() => loadChat(session.id)}
                      >
                        <div className="truncate">
                          <p className="font-medium truncate">{session.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(session.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showModelStatus && (
        <Card className="lg:col-span-1">
          <ModelStatus ollamaUrl={ollamaUrl} />
        </Card>
      )}

      {showPromptLibrary && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Prompt Library</CardTitle>
            <CardDescription>Reusable prompts for common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create New Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Prompt Template</DialogTitle>
                    <DialogDescription>Create a reusable prompt template with variables.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Name</Label>
                      <Input id="template-name" placeholder="SQL Query Generator" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-description">Description</Label>
                      <Input id="template-description" placeholder="Generate SQL queries from natural language" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-category">Category</Label>
                      <Select defaultValue="general">
                        <SelectTrigger id="template-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-prompt">Prompt Template</Label>
                      <Textarea
                        id="template-prompt"
                        placeholder="Generate a SQL query that answers the following question: {{question}}"
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {{ variable }} for placeholders that will be filled when using the template.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        const name = (document.getElementById("template-name") as HTMLInputElement).value
                        const description = (document.getElementById("template-description") as HTMLInputElement).value
                        const category =
                          (
                            document.querySelector('[id="template-category"] [data-value]') as HTMLElement
                          )?.getAttribute("data-value") || "general"
                        const prompt = (document.getElementById("template-prompt") as HTMLTextAreaElement).value

                        if (name && prompt) {
                          savePromptTemplate({
                            name,
                            description,
                            category,
                            prompt,
                          })
                        }
                      }}
                    >
                      Save Template
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Separator />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="database">
                  <AccordionTrigger>Database</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {promptTemplates
                        .filter((t) => t.category === "Database")
                        .map((template) => (
                          <div
                            key={template.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => applyPromptTemplate(template)}
                          >
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                            <Zap className="h-4 w-4" />
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="analytics">
                  <AccordionTrigger>Analytics</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {promptTemplates
                        .filter((t) => t.category === "Analytics")
                        .map((template) => (
                          <div
                            key={template.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => applyPromptTemplate(template)}
                          >
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                            <Zap className="h-4 w-4" />
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="development">
                  <AccordionTrigger>Development</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {promptTemplates
                        .filter((t) => t.category === "Development")
                        .map((template) => (
                          <div
                            key={template.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => applyPromptTemplate(template)}
                          >
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                            <Zap className="h-4 w-4" />
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      )}

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
