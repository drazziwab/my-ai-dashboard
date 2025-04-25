import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReportViewer } from "@/components/reports/report-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash } from "lucide-react"
import Link from "next/link"

export default function ViewReportPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Report Details" text="View and interact with your report.">
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/reports/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <ReportViewer id={params.id} />
      </div>
    </DashboardShell>
  )
}
