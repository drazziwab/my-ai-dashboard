"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/components/tasks/task-manager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format, isSameDay } from "date-fns"
import { Brain, Database, Play, Settings } from "lucide-react"

interface TaskSchedulerProps {
  tasks: Task[]
}

export function TaskScheduler({ tasks }: TaskSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])

  // Filter tasks for the next 7 days
  useEffect(() => {
    const nextWeek = addDays(new Date(), 7)
    const filtered = tasks.filter((task) => task.schedule.enabled && task.nextRun && task.nextRun <= nextWeek)

    // Sort by next run date
    filtered.sort((a, b) => {
      if (!a.nextRun) return 1
      if (!b.nextRun) return -1
      return a.nextRun.getTime() - b.nextRun.getTime()
    })

    setUpcomingTasks(filtered)
  }, [tasks])

  // Get tasks for the selected date
  const tasksForSelectedDate = upcomingTasks.filter((task) => task.nextRun && isSameDay(task.nextRun, selectedDate))

  const getTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "database":
        return <Database className="h-4 w-4" />
      case "llm":
        return <Brain className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      default:
        return null
    }
  }

  // Function to highlight dates with tasks
  const isDayWithTask = (date: Date) => {
    return upcomingTasks.some((task) => task.nextRun && isSameDay(task.nextRun, date))
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          modifiers={{
            withTask: (date) => isDayWithTask(date),
          }}
          modifiersClassNames={{
            withTask: "bg-primary/10 font-bold",
          }}
        />
      </div>
      <div className="space-y-4">
        <h3 className="font-medium">Tasks for {format(selectedDate, "MMMM d, yyyy")}</h3>

        {tasksForSelectedDate.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks scheduled for this date</p>
        ) : (
          <div className="space-y-2">
            {tasksForSelectedDate.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  {getTaskIcon(task.type)}
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.nextRun && format(task.nextRun, "h:mm a")}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <h3 className="font-medium mt-6">Upcoming Tasks</h3>
        {upcomingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming tasks scheduled</p>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  {getTaskIcon(task.type)}
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.nextRun && format(task.nextRun, "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {task.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
