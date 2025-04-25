import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="AI Chat" text="Interact with your LLM models through a conversational interface." />
      <div className="grid gap-4 md:gap-8">
        <ChatInterface />
      </div>
    </DashboardShell>
  )
}
