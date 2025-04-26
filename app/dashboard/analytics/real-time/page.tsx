import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RealTimeDashboard } from "@/components/analytics/real-time-dashboard"

export default function RealTimePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Real-Time Analytics" text="Monitor your system performance and usage in real-time." />
      <div className="grid gap-4">
        <RealTimeDashboard />
      </div>
    </DashboardShell>
  )
}
