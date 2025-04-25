import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DatabaseExplorer } from "@/components/database/database-explorer"

export default function DatabaseExplorerPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Database Explorer"
        text="Browse your database schema, create queries, and visualize results."
      />
      <div className="grid gap-4 md:gap-8">
        <DatabaseExplorer />
      </div>
    </DashboardShell>
  )
}
