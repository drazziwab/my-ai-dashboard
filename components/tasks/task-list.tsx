"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Plus } from "lucide-react"

interface Task {
  id: string
  name: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  dueDate: string
  assignee: string
}

const tasks: Task[] = [
  {
    id: "task-1",
    name: "Implement database query builder",
    status: "in-progress",
    priority: "high",
    dueDate: "2023-12-15",
    assignee: "John Doe",
  },
  {
    id: "task-2",
    name: "Create model fine-tuning UI",
    status: "todo",
    priority: "medium",
    dueDate: "2023-12-20",
    assignee: "Jane Smith",
  },
  {
    id: "task-3",
    name: "Add data visualization tools",
    status: "todo",
    priority: "medium",
    dueDate: "2023-12-25",
    assignee: "John Doe",
  },
  {
    id: "task-4",
    name: "Implement user management",
    status: "todo",
    priority: "low",
    dueDate: "2024-01-05",
    assignee: "Jane Smith",
  },
  {
    id: "task-5",
    name: "Add API key management",
    status: "todo",
    priority: "high",
    dueDate: "2023-12-18",
    assignee: "John Doe",
  },
]

export function TaskList() {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const toggleAllTasks = () => {
    setSelectedTasks((prev) => (prev.length === tasks.length ? [] : tasks.map((task) => task.id)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return ""
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
      default:
        return ""
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.length === tasks.length}
                  onCheckedChange={toggleAllTasks}
                  aria-label="Select all tasks"
                />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Priority</TableHead>
              <TableHead className="hidden md:table-cell">Due Date</TableHead>
              <TableHead className="hidden md:table-cell">Assignee</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleTask(task.id)}>
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                    aria-label={`Select ${task.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      task.status,
                    )}`}
                  >
                    {task.status}
                  </span>
                </TableCell>
                <TableCell className={`hidden md:table-cell ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </TableCell>
                <TableCell className="hidden md:table-cell">{task.dueDate}</TableCell>
                <TableCell className="hidden md:table-cell">{task.assignee}</TableCell>
                <TableCell className="w-12">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
