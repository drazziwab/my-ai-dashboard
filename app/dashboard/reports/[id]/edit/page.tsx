import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReportEditor } from "@/components/reports/report-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditReportPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Report" text="Modify your existing report configuration.">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/reports/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Report
          </Link>
        </Button>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <ReportEditor id={params.id} />
      </div>
    </DashboardShell>
  )
}
