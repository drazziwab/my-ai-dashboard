import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ToolsManager } from "@/components/tools/tools-manager"

export default function ToolsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Tools" text="Manage and run custom scripts and automation tools." />
      <div className="grid gap-4">
        <ToolsManager />
      </div>
    </DashboardShell>
  )
}
