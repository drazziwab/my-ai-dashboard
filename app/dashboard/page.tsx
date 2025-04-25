import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { LlmMetrics } from "@/components/dashboard/llm-metrics"
import { DatabaseMetrics } from "@/components/dashboard/database-metrics"
import { RecentQueries } from "@/components/dashboard/recent-queries"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Analytics Dashboard" text="Monitor your LLM and database performance metrics." />
      <div className="grid gap-4 md:gap-8">
        <DashboardStats />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <LlmMetrics className="md:col-span-1 lg:col-span-4" />
          <DatabaseMetrics className="md:col-span-1 lg:col-span-3" />
        </div>
        <RecentQueries />
      </div>
    </DashboardShell>
  )
}
