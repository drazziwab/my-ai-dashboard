"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, RefreshCw, Search } from "lucide-react"
import { TaskList } from "@/components/tasks/task-list"
import { TaskEditor } from "@/components/tasks/task-editor"
import { TaskScheduler } from "@/components/tasks/task-scheduler"

export interface Task {
  id: string
  name: string
  description: string
  type: "database" | "llm" | "system"
  script: string
  schedule: {
    enabled: boolean
    frequency: "once" | "daily" | "weekly" | "monthly"
    time: string
    date?: Date
    daysOfWeek?: number[]
    dayOfMonth?: number
  }
  lastRun?: Date
  nextRun?: Date
  status: "idle" | "running" | "completed" | "failed"
  createdAt: Date
  updatedAt: Date
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [])

  // Filter tasks when search term or active tab changes
  useEffect(() => {
    let filtered = tasks

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((task) => task.type === activeTab)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, activeTab])

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use mock data
      const mockTasks: Task[] = [
        {
          id: "task-1",
          name: "Daily Database Backup",
          description: "Creates a backup of the main database every day at midnight",
          type: "database",
          script:
            "BACKUP DATABASE [MainDB] TO DISK = N'D:\\Backups\\MainDB_daily.bak' WITH NOFORMAT, NOINIT, NAME = N'MainDB-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10",
          schedule: {
            enabled: true,
            frequency: "daily",
            time: "00:00",
          },
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "completed",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "task-2",
          name: "Weekly LLM Usage Report",
          description: "Generates a report of LLM usage statistics for the past week",
          type: "llm",
          script:
            "SELECT model, COUNT(*) as request_count, AVG(response_time_ms) as avg_response_time FROM llm_requests WHERE request_timestamp > DATEADD(day, -7, GETDATE()) GROUP BY model ORDER BY request_count DESC",
          schedule: {
            enabled: true,
            frequency: "weekly",
            time: "09:00",
            daysOfWeek: [1], // Monday
          },
          lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: "completed",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          id: "task-3",
          name: "Monthly System Cleanup",
          description: "Cleans up temporary files and optimizes system performance",
          type: "system",
          script: "EXEC sp_CleanupTempFiles; EXEC sp_OptimizeIndexes;",
          schedule: {
            enabled: true,
            frequency: "monthly",
            time: "03:00",
            dayOfMonth: 1,
          },
          lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: "completed",
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "task-4",
          name: "One-time Data Migration",
          description: "Migrates data from the old schema to the new schema",
          type: "database",
          script: "EXEC sp_MigrateDataToNewSchema;",
          schedule: {
            enabled: false,
            frequency: "once",
            time: "22:00",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          status: "idle",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "task-5",
          name: "LLM Model Evaluation",
          description: "Runs benchmark tests on all available LLM models",
          type: "llm",
          script: "EXEC sp_EvaluateLLMModels;",
          schedule: {
            enabled: true,
            frequency: "weekly",
            time: "14:00",
            daysOfWeek: [5], // Friday
          },
          lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: "completed",
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ]

      setTasks(mockTasks)
      setFilteredTasks(mockTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsCreating(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsCreating(false)
  }

  const handleSaveTask = (task: Task, isNew: boolean) => {
    if (isNew) {
      // Add new task
      const newTask = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "idle" as const,
      }
      setTasks([...tasks, newTask])
    } else {
      // Update existing task
      const updatedTasks = tasks.map((t) => (t.id === task.id ? { ...task, updatedAt: new Date() } : t))
      setTasks(updatedTasks)
    }

    setSelectedTask(null)
    setIsCreating(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    if (selectedTask?.id === taskId) {
      setSelectedTask(null)
      setIsCreating(false)
    }
  }

  const handleRunTask = (taskId: string) => {
    // In a real app, this would trigger the task execution
    // For now, we'll just update the status
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: "running" as const,
            lastRun: new Date(),
          }
        : task,
    )
    setTasks(updatedTasks)

    // Simulate task completion after 2 seconds
    setTimeout(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "completed" as const,
              }
            : task,
        ),
      )
    }, 2000)
  }

  return (
    <div className="space-y-4">
      {selectedTask || isCreating ? (
        <TaskEditor
          task={selectedTask}
          isNew={isCreating}
          onSave={handleSaveTask}
          onCancel={() => {
            setSelectedTask(null)
            setIsCreating(false)
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle>Task Manager</CardTitle>
                <CardDescription>Create, schedule, and manage automated tasks</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleCreateTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
                <Button variant="outline" onClick={fetchTasks} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="llm">LLM</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRun={handleRunTask}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="database" className="mt-4">
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRun={handleRunTask}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="llm" className="mt-4">
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRun={handleRunTask}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="system" className="mt-4">
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRun={handleRunTask}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!selectedTask && !isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks scheduled to run in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskScheduler tasks={tasks} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
