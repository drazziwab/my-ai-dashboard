import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ScheduledReportsList } from "@/components/reports/scheduled-reports-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ScheduledReportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Scheduled Reports" text="Manage your scheduled report deliveries.">
        <Button variant="outline" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <ScheduledReportsList />
      </div>
    </DashboardShell>
  )
}
