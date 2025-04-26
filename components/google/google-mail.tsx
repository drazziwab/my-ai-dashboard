"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Mail, RefreshCw, Search, Send } from "lucide-react"

interface Email {
  id: string
  from: string
  to: string
  subject: string
  snippet: string
  date: string
  read: boolean
}

interface GoogleMailProps {
  isConnected: boolean
}

export function GoogleMail({ isConnected }: GoogleMailProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showComposeEmail, setShowComposeEmail] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    if (isConnected) {
      fetchEmails()
    }
  }, [isConnected])

  const fetchEmails = async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/google/gmail/list")

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEmails(data.emails || [])
        } else {
          setError(data.error || "Failed to fetch emails")
        }
      } else {
        setError("Failed to fetch emails")
      }
    } catch (error) {
      console.error("Error fetching emails:", error)
      setError("An error occurred while fetching emails")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!isConnected || !searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/google/gmail/search?q=${encodeURIComponent(searchQuery)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEmails(data.emails || [])
        } else {
          setError(data.error || "Failed to search emails")
        }
      } else {
        setError("Failed to search emails")
      }
    } catch (error) {
      console.error("Error searching emails:", error)
      setError("An error occurred while searching emails")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!isConnected || !emailTo || !emailSubject || !emailBody) return

    setSendingEmail(true)
    setError(null)

    try {
      const response = await fetch("/api/google/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          body: emailBody,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Reset form and hide compose
          setEmailTo("")
          setEmailSubject("")
          setEmailBody("")
          setShowComposeEmail(false)

          // Refresh emails
          fetchEmails()
        } else {
          setError(data.error || "Failed to send email")
        }
      } else {
        setError("Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setError("An error occurred while sending the email")
    } finally {
      setSendingEmail(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gmail Integration</CardTitle>
          <CardDescription>Connect your Gmail account to access your emails</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              You need to connect your Gmail account first. Go to the Overview tab and connect Gmail.
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
              <CardTitle>Gmail</CardTitle>
              <CardDescription>Access and manage your emails</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchEmails} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setShowComposeEmail(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showComposeEmail ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="recipient@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Message</Label>
                <Textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowComposeEmail(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={sendingEmail || !emailTo || !emailSubject || !emailBody}>
                  {sendingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : emails.length > 0 ? (
                <div className="space-y-2">
                  {emails.map((email) => (
                    <Card key={email.id} className={email.read ? "bg-muted/50" : ""}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div className="font-medium">{email.from}</div>
                          <div className="text-xs text-muted-foreground">{email.date}</div>
                        </div>
                        <div className="font-medium">{email.subject}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{email.snippet}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No emails found. Try refreshing or changing your search query.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
