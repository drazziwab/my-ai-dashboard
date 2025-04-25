"use client"
import { Card, CardContent } from "@/components/ui/card"

interface GoogleCalendarProps {
  userEmail: string
}

export function GoogleCalendar({ userEmail }: GoogleCalendarProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <iframe
            src="https://calendar.google.com/calendar/embed"
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="no"
            title="Google Calendar Embed"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  )
}
