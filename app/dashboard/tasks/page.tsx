import { TaskManager } from "@/components/tasks/task-manager"

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <TaskManager />
      </div>
    </div>
  )
}
