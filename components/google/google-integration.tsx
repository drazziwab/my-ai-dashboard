"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GoogleAuth } from "@/components/google/google-auth"
import { GoogleMail } from "@/components/google/google-mail"
import { GoogleCalendar } from "@/components/google/google-calendar"
import { GoogleDocs } from "@/components/google/google-docs"
import { GoogleSheets } from "@/components/google/google-sheets"
import { AlertCircle, CheckCircle, Mail, Calendar, FileText, Table } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface GoogleService {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  scopes: string[]
  isConnected: boolean
}

export function GoogleIntegration() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [services, setServices] = useState<GoogleService[]>([
    {
      id: "gmail",
      name: "Gmail",
      description: "Access and manage your emails",
      icon: <Mail className="h-5 w-5" />,
      scopes: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"],
      isConnected: false,
    },
    {
      id: "calendar",
      name: "Calendar",
      description: "View and manage your calendar events",
      icon: <Calendar className="h-5 w-5" />,
      scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
      isConnected: false,
    },
    {
      id: "docs",
      name: "Docs",
      description: "Create and edit Google Docs",
      icon: <FileText className="h-5 w-5" />,
      scopes: ["https://www.googleapis.com/auth/documents", "https://www.googleapis.com/auth/drive.file"],
      isConnected: false,
    },
    {
      id: "sheets",
      name: "Sheets",
      description: "Create and edit Google Sheets",
      icon: <Table className="h-5 w-5" />,
      scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
      isConnected: false,
    },
  ])

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/google/auth-status")
        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(data.isAuthenticated)

          if (data.connectedServices) {
            setServices((prev) =>
              prev.map((service) => ({
                ...service,
                isConnected: data.connectedServices.includes(service.id),
              })),
            )
          }
        } else {
          console.error("Failed to check auth status:", response.statusText)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setError("Failed to check authentication status")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const handleConnect = async (serviceId: string) => {
    try {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return

      const response = await fetch("/api/google/connect-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          scopes: service.scopes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, isConnected: true } : s)))
        } else {
          setError(data.error || "Failed to connect service")
        }
      } else {
        setError("Failed to connect service")
      }
    } catch (error) {
      console.error("Error connecting service:", error)
      setError("An error occurred while connecting the service")
    }
  }

  const handleDisconnect = async (serviceId: string) => {
    try {
      const response = await fetch("/api/google/disconnect-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serviceId }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, isConnected: false } : s)))
        } else {
          setError(data.error || "Failed to disconnect service")
        }
      } else {
        setError("Failed to disconnect service")
      }
    } catch (error) {
      console.error("Error disconnecting service:", error)
      setError("An error occurred while disconnecting the service")
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="gmail">Gmail</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="docs">Docs</TabsTrigger>
        <TabsTrigger value="sheets">Sheets</TabsTrigger>
      </TabsList>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {service.icon}
                    <CardTitle>{service.name}</CardTitle>
                  </div>
                  {service.isConnected ? <CheckCircle className="h-5 w-5 text-green-500" /> : null}
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  Status:{" "}
                  <span className={service.isConnected ? "text-green-500" : "text-yellow-500"}>
                    {service.isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                {service.isConnected ? (
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect(service.id)}>
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleConnect(service.id)} disabled={!isAuthenticated}>
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {!isAuthenticated && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Google Authentication</CardTitle>
              <CardDescription>Authenticate with Google to use these services</CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleAuth onAuthSuccess={() => setIsAuthenticated(true)} onAuthError={(error) => setError(error)} />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="gmail">
        <GoogleMail isConnected={services.find((s) => s.id === "gmail")?.isConnected || false} />
      </TabsContent>

      <TabsContent value="calendar">
        <GoogleCalendar isConnected={services.find((s) => s.id === "calendar")?.isConnected || false} />
      </TabsContent>

      <TabsContent value="docs">
        <GoogleDocs isConnected={services.find((s) => s.id === "docs")?.isConnected || false} />
      </TabsContent>

      <TabsContent value="sheets">
        <GoogleSheets isConnected={services.find((s) => s.id === "sheets")?.isConnected || false} />
      </TabsContent>
    </Tabs>
  )
}
