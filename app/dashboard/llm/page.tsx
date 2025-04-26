import type { Metadata } from "next"
import { LLMMetrics } from "@/components/dashboard/llm-metrics"
import { ModelStatus } from "@/components/llm/model-status"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata: Metadata = {
  title: "|my-ai| Dashboard",
  description: "Monitor and manage your |my-ai| models and performance",
}

export default function LLMDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="|my-ai| Dashboard" text="Monitor and manage your |my-ai| models and performance" />
      <div className="grid gap-4">
        <LLMMetrics />
        <div className="mt-6">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Model Status</h2>
          <ModelStatus />
        </div>
      </div>
    </DashboardShell>
  )
}
