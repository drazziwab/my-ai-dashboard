import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UserManagement } from "@/components/admin/user-management"

export default function UsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="User Management" text="Manage user accounts, roles, and permissions." />
      <UserManagement />
    </DashboardShell>
  )
}
