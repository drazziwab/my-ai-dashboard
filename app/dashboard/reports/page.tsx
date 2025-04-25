import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReportsList } from "@/components/reports/reports-list"
import { Button } from "@/components/ui/button"
import { FileText, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Reports" text="Create, schedule, and manage your custom reports.">
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/reports/templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/reports/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Report
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <ReportsList />
      </div>
    </DashboardShell>
  )
}
