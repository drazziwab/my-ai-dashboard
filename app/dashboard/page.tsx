import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { HardwareMetrics } from "@/components/dashboard/hardware-metrics"
import { DatabaseMetrics } from "@/components/dashboard/database-metrics"
import { RecentQueries } from "@/components/dashboard/recent-queries"
import { SystemStatus } from "@/components/dashboard/system-status"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <DashboardHeader heading="Analytics Dashboard" text="Monitor your LLM and database performance metrics." />

        {/* Hardware metrics (4 small boxes) */}
        <HardwareMetrics />

        {/* Database metrics (full width) */}
        <DatabaseMetrics />

        <div className="grid gap-6 md:grid-cols-7">
          {/* Recent queries (left side) */}
          <div className="md:col-span-4">
            <RecentQueries />
          </div>

          {/* System status (right side) */}
          <SystemStatus className="md:col-span-3" />
        </div>
      </div>
    </DashboardShell>
  )
}
