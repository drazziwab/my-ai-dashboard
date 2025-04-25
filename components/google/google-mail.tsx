"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search } from "lucide-react"

interface GoogleMailProps {
  userEmail: string
}

export function GoogleMail({ userEmail }: GoogleMailProps) {
  const [loading, setLoading] = useState(true)
  const [emails, setEmails] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch emails from the Gmail API
      // For now, we'll just simulate it with mock data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockEmails = [
        {
          id: "email-1",
          from: "john.doe@example.com",
          subject: "Weekly Team Meeting",
          snippet: "Hi team, Just a reminder about our weekly meeting tomorrow at 10 AM...",
          date: "2025-04-24T14:32:12.000Z",
          unread: true,
        },
        {
          id: "email-2",
          from: "support@acme.com",
          subject: "Your recent order #12345",
          snippet: "Thank you for your recent order. Your items have been shipped and should arrive...",
          date: "2025-04-24T12:18:45.000Z",
          unread: false,
        },
        {
          id: "email-3",
          from: "newsletter@tech-daily.com",
          subject: "Tech Daily: Latest AI Developments",
          snippet: "This week in AI: New breakthroughs in natural language processing, computer vision advances...",
          date: "2025-04-24T10:05:32.000Z",
          unread: true,
        },
        {
          id: "email-4",
          from: "jane.smith@example.com",
          subject: "Project Proposal Review",
          snippet: "I've reviewed the project proposal and have some feedback. Overall, it looks good but...",
          date: "2025-04-23T16:45:22.000Z",
          unread: false,
        },
        {
          id: "email-5",
          from: "calendar@google.com",
          subject: "Upcoming event reminder: Quarterly Review",
          snippet: "This is a reminder about your event 'Quarterly Review' scheduled for tomorrow at 2 PM...",
          date: "2025-04-23T14:12:08.000Z",
          unread: false,
        },
      ]

      setEmails(mockEmails)
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter emails based on search term
  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.snippet.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" onClick={fetchEmails} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No emails found</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <Card
                key={email.id}
                className={`cursor-pointer hover:bg-muted/50 ${email.unread ? "border-l-4 border-l-primary" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{email.from}</div>
                    <div className="text-xs text-muted-foreground">{new Date(email.date).toLocaleString()}</div>
                  </div>
                  <div className={`text-sm ${email.unread ? "font-semibold" : ""}`}>{email.subject}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{email.snippet}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="rounded-md border p-4">
        <iframe
          src="https://mail.google.com/mail/u/0/embed"
          width="100%"
          height="500"
          frameBorder="0"
          title="Gmail Embed"
        ></iframe>
      </div>
    </div>
  )
}
