"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Plus, X } from "lucide-react"

export function ReportScheduler() {
  const [scheduleType, setScheduleType] = useState("none")
  const [frequency, setFrequency] = useState("daily")
  const [date, setDate] = useState<Date>()
  const [recipients, setRecipients] = useState<string[]>(["admin@example.com"])
  const [newRecipient, setNewRecipient] = useState("")
  const [formats, setFormats] = useState<string[]>(["pdf"])

  const handleAddRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient])
      setNewRecipient("")
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email))
  }

  const handleFormatChange = (format: string) => {
    if (formats.includes(format)) {
      setFormats(formats.filter((f) => f !== format))
    } else {
      setFormats([...formats, format])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label>Schedule Type</Label>
              <RadioGroup value={scheduleType} onValueChange={setScheduleType} className="mt-2 flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="schedule-none" />
                  <Label htmlFor="schedule-none">No Schedule (Run Manually)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recurring" id="schedule-recurring" />
                  <Label htmlFor="schedule-recurring">Recurring Schedule</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="schedule-one-time" />
                  <Label htmlFor="schedule-one-time">One-Time Schedule</Label>
                </div>
              </RadioGroup>
            </div>

            {scheduleType === "recurring" && (
              <div className="space-y-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {frequency === "weekly" && (
                  <div>
                    <Label>Day of Week</Label>
                    <Select defaultValue="1">
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="0">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {frequency === "monthly" && (
                  <div>
                    <Label>Day of Month</Label>
                    <Select defaultValue="1">
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Time</Label>
                  <div className="mt-2 flex space-x-2">
                    <Select defaultValue="9">
                      <SelectTrigger>
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select defaultValue="0">
                      <SelectTrigger>
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {scheduleType === "one-time" && (
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "mt-2 w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Time</Label>
                  <div className="mt-2 flex space-x-2">
                    <Select defaultValue="9">
                      <SelectTrigger>
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select defaultValue="0">
                      <SelectTrigger>
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {scheduleType !== "none" && (
              <>
                <div>
                  <Label>Recipients</Label>
                  <div className="mt-2 flex space-x-2">
                    <Input
                      placeholder="Enter email address"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddRecipient}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {recipients.map((email) => (
                      <div key={email} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span>{email}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveRecipient(email)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Export Format</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="format-pdf"
                        checked={formats.includes("pdf")}
                        onCheckedChange={() => handleFormatChange("pdf")}
                      />
                      <Label htmlFor="format-pdf">PDF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="format-excel"
                        checked={formats.includes("excel")}
                        onCheckedChange={() => handleFormatChange("excel")}
                      />
                      <Label htmlFor="format-excel">Excel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="format-csv"
                        checked={formats.includes("csv")}
                        onCheckedChange={() => handleFormatChange("csv")}
                      />
                      <Label htmlFor="format-csv">CSV</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
