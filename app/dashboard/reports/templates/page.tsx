import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReportTemplates } from "@/components/reports/report-templates"

export default function ReportTemplatesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Report Templates" text="Pre-built report templates for common analytics scenarios." />
      <div className="grid gap-4">
        <ReportTemplates />
      </div>
    </DashboardShell>
  )
}
