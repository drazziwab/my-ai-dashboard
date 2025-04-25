import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReportCreator } from "@/components/reports/report-creator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateReportPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Create Report" text="Design a new custom report with SQL queries and visualizations.">
        <Button variant="outline" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <ReportCreator />
      </div>
    </DashboardShell>
  )
}
