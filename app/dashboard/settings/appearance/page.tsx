import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AppearanceSettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Appearance Settings" text="Customize the look and feel of your dashboard.">
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <ThemeSelector />
      </div>
    </DashboardShell>
  )
}
