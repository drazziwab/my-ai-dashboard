"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bot, Check, Copy, User } from "lucide-react"
import { format } from "date-fns"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex gap-3 rounded-lg p-4 ${
        message.role === "user" ? "bg-muted/50" : message.role === "assistant" ? "bg-muted" : "bg-background"
      }`}
    >
      <Avatar>
        <AvatarFallback>
          {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {message.role === "user" ? "You" : message.role === "assistant" ? "AI Assistant" : "System"}
          </p>
          <span className="text-xs text-muted-foreground">{format(new Date(message.timestamp), "h:mm a")}</span>
        </div>
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
      </div>
      {message.role !== "system" && (
        <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8 self-start">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}
