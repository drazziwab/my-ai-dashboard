import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ModelManager } from "@/components/llm/model-manager"

export default function ModelsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="LLM Model Management" text="Manage your Ollama models and configurations." />
      <div className="grid gap-4 md:gap-8">
        <ModelManager />
      </div>
    </DashboardShell>
  )
}
