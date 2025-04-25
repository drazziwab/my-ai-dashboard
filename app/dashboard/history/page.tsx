import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { QueryHistory } from "@/components/history/query-history"

export default function HistoryPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Query History" text="View and analyze your LLM and database query history." />
      <div className="grid gap-4 md:gap-8">
        <QueryHistory />
      </div>
    </DashboardShell>
  )
}
