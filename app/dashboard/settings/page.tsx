import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your dashboard preferences and connections." />
      <div className="grid gap-4 md:gap-8">
        <SettingsTabs />
      </div>
    </DashboardShell>
  )
}
