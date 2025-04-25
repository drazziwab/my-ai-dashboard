import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RagInterface } from "@/components/rag/rag-interface"

export default function RagPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Retrieval Augmented Generation"
        text="Upload documents, create knowledge bases, and query your data with LLMs."
      />
      <div className="grid gap-4">
        <RagInterface />
      </div>
    </DashboardShell>
  )
}
