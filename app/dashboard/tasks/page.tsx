import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TaskManager } from "@/components/tasks/task-manager"

export default function TasksPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Task Management" text="Create, schedule, and monitor automated tasks." />
      <div className="grid gap-4">
        <TaskManager />
      </div>
    </DashboardShell>
  )
}
