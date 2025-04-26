import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Brain, User } from "lucide-react"
import { format } from "date-fns"

interface ChatMessageProps {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 text-sm", role === "user" ? "flex-row-reverse" : "flex-row")}>
      <Avatar className={cn("h-8 w-8", role === "user" ? "bg-primary" : "bg-muted")}>
        <AvatarFallback>
          {role === "user" ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
        </AvatarFallback>
        {role === "user" ? <AvatarImage src="/vibrant-street-market.png" /> : null}
      </Avatar>
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3 text-sm",
          role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        <div className={cn("text-xs", role === "user" ? "text-primary-foreground/80" : "text-muted-foreground/80")}>
          {format(new Date(timestamp), "h:mm a")}
        </div>
      </div>
    </div>
  )
}
