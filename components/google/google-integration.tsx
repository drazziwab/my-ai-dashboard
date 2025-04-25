"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, FileText, Table } from "lucide-react"
import { GoogleAuth } from "@/components/google/google-auth"
import { GoogleCalendar } from "@/components/google/google-calendar"
import { GoogleMail } from "@/components/google/google-mail"
import { GoogleDocs } from "@/components/google/google-docs"
import { GoogleSheets } from "@/components/google/google-sheets"

export function GoogleIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    // In a real app, this would check if the user is authenticated with Google
    // For now, we'll just simulate it
    const mockAuthStatus = localStorage.getItem("googleAuthStatus")
    const mockUserEmail = localStorage.getItem("googleUserEmail")

    if (mockAuthStatus === "authenticated" && mockUserEmail) {
      setIsAuthenticated(true)
      setUserEmail(mockUserEmail)
    } else {
      setIsAuthenticated(false)
      setUserEmail(null)
    }
  }

  const handleAuthenticate = async (email: string) => {
    setIsAuthenticating(true)
    setAuthError(null)

    try {
      // In a real app, this would authenticate with Google
      // For now, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store auth status in localStorage for demo purposes
      localStorage.setItem("googleAuthStatus", "authenticated")
      localStorage.setItem("googleUserEmail", email)

      setIsAuthenticated(true)
      setUserEmail(email)
    } catch (error) {
      setAuthError((error as Error).message)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleSignOut = async () => {
    // In a real app, this would sign out from Google
    // For now, we'll just simulate it
    localStorage.removeItem("googleAuthStatus")
    localStorage.removeItem("googleUserEmail")

    setIsAuthenticated(false)
    setUserEmail(null)
  }

  return (
    <div className="space-y-4">
      {!isAuthenticated ? (
        <GoogleAuth onAuthenticate={handleAuthenticate} isAuthenticating={isAuthenticating} error={authError} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                  <CardTitle>Google Integration</CardTitle>
                  <CardDescription>Access your Google services</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    Signed in as <span className="font-medium">{userEmail}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mail">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="mail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Gmail
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="docs" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Docs
                  </TabsTrigger>
                  <TabsTrigger value="sheets" className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Sheets
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mail" className="mt-4">
                  <GoogleMail userEmail={userEmail!} />
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                  <GoogleCalendar userEmail={userEmail!} />
                </TabsContent>

                <TabsContent value="docs" className="mt-4">
                  <GoogleDocs userEmail={userEmail!} />
                </TabsContent>

                <TabsContent value="sheets" className="mt-4">
                  <GoogleSheets userEmail={userEmail!} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
