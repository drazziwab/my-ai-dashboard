import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DataExport } from "@/components/admin/data-export"

export default function ExportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Data Export" text="Export system data for analysis or backup." />
      <DataExport />
    </DashboardShell>
  )
}
