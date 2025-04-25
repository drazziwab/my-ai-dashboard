"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import type { Task } from "@/components/tasks/task-manager"
import { Checkbox } from "@/components/ui/checkbox"

interface TaskEditorProps {
  task: Task | null
  isNew: boolean
  onSave: (task: Task, isNew: boolean) => void
  onCancel: () => void
}

export function TaskEditor({ task, isNew, onSave, onCancel }: TaskEditorProps) {
  const [formData, setFormData] = useState<Task>(
    task || {
      id: "",
      name: "",
      description: "",
      type: "database",
      script: "",
      schedule: {
        enabled: false,
        frequency: "once",
        time: "12:00",
        date: new Date(),
      },
      status: "idle",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  )

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleScheduleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }))
  }

  const handleDayOfWeekToggle = (day: number) => {
    const currentDays = formData.schedule.daysOfWeek || []
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]

    handleScheduleChange("daysOfWeek", newDays)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData, isNew)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>{isNew ? "Create Task" : "Edit Task"}</CardTitle>
            <CardDescription>
              {isNew ? "Create a new automated task" : "Edit task details and schedule"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter task name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Task Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="llm">LLM</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="script" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="script">Script</Label>
                <Textarea
                  id="script"
                  value={formData.script}
                  onChange={(e) => handleInputChange("script", e.target.value)}
                  placeholder={
                    formData.type === "database"
                      ? "Enter SQL query or stored procedure call"
                      : formData.type === "llm"
                        ? "Enter LLM script or API call"
                        : "Enter system command or script"
                  }
                  className="font-mono"
                  rows={10}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button type="button" variant="outline">
                  Browse Files
                </Button>
                <Button type="button" variant="outline">
                  Test Script
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule-enabled"
                  checked={formData.schedule.enabled}
                  onCheckedChange={(checked) => handleScheduleChange("enabled", checked)}
                />
                <Label htmlFor="schedule-enabled">Enable Scheduling</Label>
              </div>

              {formData.schedule.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.schedule.frequency}
                      onValueChange={(value) => handleScheduleChange("frequency", value)}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.schedule.time}
                      onChange={(e) => handleScheduleChange("time", e.target.value)}
                    />
                  </div>

                  {formData.schedule.frequency === "once" && (
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.schedule.date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.schedule.date ? format(formData.schedule.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.schedule.date}
                            onSelect={(date) => handleScheduleChange("date", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {formData.schedule.frequency === "weekly" && (
                    <div className="space-y-2">
                      <Label>Days of Week</Label>
                      <div className="grid grid-cols-7 gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                          <div key={day} className="flex flex-col items-center">
                            <Checkbox
                              id={`day-${index}`}
                              checked={(formData.schedule.daysOfWeek || []).includes(index)}
                              onCheckedChange={() => handleDayOfWeekToggle(index)}
                            />
                            <Label htmlFor={`day-${index}`} className="mt-1 text-xs">
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.schedule.frequency === "monthly" && (
                    <div className="space-y-2">
                      <Label htmlFor="dayOfMonth">Day of Month</Label>
                      <Select
                        value={String(formData.schedule.dayOfMonth || 1)}
                        onValueChange={(value) => handleScheduleChange("dayOfMonth", Number.parseInt(value))}
                      >
                        <SelectTrigger id="dayOfMonth">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={String(day)}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isNew ? "Create Task" : "Save Changes"}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
