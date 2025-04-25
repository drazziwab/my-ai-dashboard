"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

type Task = {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: Date
  assignee: string
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement database connection",
    description: "Connect to the SQL Server database and set up the ORM",
    status: "completed",
    priority: "high",
    dueDate: new Date(2023, 5, 15),
    assignee: "John Doe",
  },
  {
    id: "2",
    title: "Create dashboard UI",
    description: "Design and implement the main dashboard interface",
    status: "in-progress",
    priority: "medium",
    dueDate: new Date(2023, 5, 20),
    assignee: "Jane Smith",
  },
  {
    id: "3",
    title: "Implement authentication",
    description: "Set up user authentication and authorization",
    status: "todo",
    priority: "high",
    dueDate: new Date(2023, 5, 25),
    assignee: "John Doe",
  },
  {
    id: "4",
    title: "Add data visualization",
    description: "Implement charts and graphs for data visualization",
    status: "todo",
    priority: "medium",
    dueDate: new Date(2023, 6, 1),
    assignee: "Jane Smith",
  },
  {
    id: "5",
    title: "Write documentation",
    description: "Create comprehensive documentation for the project",
    status: "todo",
    priority: "low",
    dueDate: new Date(2023, 6, 10),
    assignee: "John Doe",
  },
]

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: new Date(),
    assignee: "",
  })

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
    setIsEditMode(false)
  }

  const handleAddNewTask = () => {
    setSelectedTask(null)
    setNewTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: new Date(),
      assignee: "",
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEditTask = () => {
    if (selectedTask) {
      setNewTask(selectedTask)
      setIsEditMode(true)
    }
  }

  const handleSaveTask = () => {
    if (isEditMode) {
      if (selectedTask) {
        // Edit existing task
        setTasks(tasks.map((task) => (task.id === selectedTask.id ? { ...task, ...newTask } : task)))
      } else {
        // Add new task
        const task: Task = {
          id: Math.random().toString(36).substr(2, 9),
          title: newTask.title || "",
          description: newTask.description || "",
          status: (newTask.status as "todo" | "in-progress" | "completed") || "todo",
          priority: (newTask.priority as "low" | "medium" | "high") || "medium",
          dueDate: newTask.dueDate || new Date(),
          assignee: newTask.assignee || "",
        }
        setTasks([...tasks, task])
      }
    }
    setIsDialogOpen(false)
  }

  const handleDeleteTask = () => {
    if (selectedTask) {
      setTasks(tasks.filter((task) => task.id !== selectedTask.id))
      setIsDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-200 text-gray-800"
      case "in-progress":
        return "bg-blue-200 text-blue-800"
      case "completed":
        return "bg-green-200 text-green-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-200 text-gray-800"
      case "medium":
        return "bg-yellow-200 text-yellow-800"
      case "high":
        return "bg-red-200 text-red-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tasks</h2>
        <Button onClick={handleAddNewTask}>Add Task</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Priority</TableHead>
              <TableHead className="hidden md:table-cell">Due Date</TableHead>
              <TableHead className="hidden md:table-cell">Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleTaskClick(task)}
              >
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === "in-progress"
                      ? "In Progress"
                      : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{format(task.dueDate, "MMM dd, yyyy")}</TableCell>
                <TableCell className="hidden md:table-cell">{task.assignee}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? (selectedTask ? "Edit Task" : "Add New Task") : "Task Details"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Make changes to the task here." : "View task details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditMode ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, status: value as "todo" | "in-progress" | "completed" })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value as "low" | "medium" | "high" })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignee" className="text-right">
                    Assignee
                  </Label>
                  <Input
                    id="assignee"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </>
            ) : (
              selectedTask && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right font-medium">Title:</span>
                    <span className="col-span-3">{selectedTask.title}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right font-medium">Description:</span>
                    <span className="col-span-3">{selectedTask.description}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right font-medium">Status:</span>
                    <Badge className={`col-span-3 ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status === "in-progress"
                        ? "In Progress"
                        : selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right font-medium">Priority:</span>
                    <Badge className={`col-span-3 ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right font-medium">Due Date:</span>
                    <span className="col-span-3">{format(selectedTask.dueDate, "MMMM dd, yyyy")}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right font-medium">Assignee:</span>
                    <span className="col-span-3">{selectedTask.assignee}</span>
                  </div>
                </>
              )
            )}
          </div>
          <DialogFooter>
            {isEditMode ? (
              <>
                <Button type="submit" onClick={handleSaveTask}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEditTask}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDeleteTask}>
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
