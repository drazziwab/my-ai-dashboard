import type { Metadata } from "next"
import { ChatInterface } from "@/components/chat/chat-interface"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata: Metadata = {
  title: "|my-ai| Chat",
  description: "Chat with your |my-ai| models",
}

export default function ChatPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="|my-ai| Chat"
        text="Interact with your |my-ai| models through a conversational interface"
      />
      <div className="grid gap-4">
        <ChatInterface />
      </div>
    </DashboardShell>
  )
}
