"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, Clock, Loader2, Plus, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface CalendarEvent {
  id: string
  summary: string
  description: string
  start: string
  end: string
  location: string
}

interface GoogleCalendarProps {
  isConnected: boolean
}

export function GoogleCalendar({ isConnected }: GoogleCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    summary: "",
    description: "",
    location: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: "10:00",
  })
  const [addingEvent, setAddingEvent] = useState(false)

  useEffect(() => {
    if (isConnected) {
      fetchEvents()
    }
  }, [isConnected])

  const fetchEvents = async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/google/calendar/list")

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvents(data.events || [])
        } else {
          setError(data.error || "Failed to fetch calendar events")
        }
      } else {
        setError("Failed to fetch calendar events")
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      setError("An error occurred while fetching calendar events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEvent = async () => {
    if (!isConnected) return

    setAddingEvent(true)
    setError(null)

    try {
      const response = await fetch("/api/google/calendar/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: newEvent.summary,
          description: newEvent.description,
          location: newEvent.location,
          start: `${newEvent.startDate}T${newEvent.startTime}:00`,
          end: `${newEvent.endDate}T${newEvent.endTime}:00`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Reset form and close dialog
          setNewEvent({
            summary: "",
            description: "",
            location: "",
            startDate: format(new Date(), "yyyy-MM-dd"),
            startTime: "09:00",
            endDate: format(new Date(), "yyyy-MM-dd"),
            endTime: "10:00",
          })
          setShowAddEvent(false)

          // Refresh events
          fetchEvents()
        } else {
          setError(data.error || "Failed to create event")
        }
      } else {
        setError("Failed to create event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      setError("An error occurred while creating the event")
    } finally {
      setAddingEvent(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Integration</CardTitle>
          <CardDescription>Connect your Google Calendar to manage your events</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              You need to connect your Google Calendar first. Go to the Overview tab and connect Calendar.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>View and manage your calendar events</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchEvents} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Calendar Event</DialogTitle>
                    <DialogDescription>Create a new event in your Google Calendar</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input
                        id="event-title"
                        value={newEvent.summary}
                        onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                        placeholder="Meeting with Team"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Conference Room A"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-start-date">Start Date</Label>
                        <Input
                          id="event-start-date"
                          type="date"
                          value={newEvent.startDate}
                          onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-start-time">Start Time</Label>
                        <Input
                          id="event-start-time"
                          type="time"
                          value={newEvent.startTime}
                          onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-end-date">End Date</Label>
                        <Input
                          id="event-end-date"
                          type="date"
                          value={newEvent.endDate}
                          onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-end-time">End Time</Label>
                        <Input
                          id="event-end-time"
                          type="time"
                          value={newEvent.endTime}
                          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Input
                        id="event-description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Discuss project updates"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent} disabled={addingEvent || !newEvent.summary}>
                      {addingEvent ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Event"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{event.summary}</h3>
                        {event.location && <div className="text-sm text-muted-foreground">{event.location}</div>}
                        {event.description && <div className="text-sm mt-2">{event.description}</div>}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(new Date(event.start), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No events found. Try refreshing or adding a new event.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
