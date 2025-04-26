import type { Metadata } from "next"
import { GoogleIntegration } from "@/components/google/google-integration"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata: Metadata = {
  title: "Google Integration",
  description: "Connect your Google services to |my-ai|",
}

export default function GooglePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Google Integration"
        text="Connect your Google services to enhance your |my-ai| experience"
      />
      <div className="grid gap-4">
        <GoogleIntegration />
      </div>
    </DashboardShell>
  )
}
