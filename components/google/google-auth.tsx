"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface GoogleAuthProps {
  onAuthSuccess: () => void
  onAuthError: (error: string) => void
}

export function GoogleAuth({ onAuthSuccess, onAuthError }: GoogleAuthProps) {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authUrl, setAuthUrl] = useState<string | null>(null)

  const handleGenerateAuthUrl = async () => {
    if (!clientId || !clientSecret) {
      setError("Client ID and Client Secret are required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/google/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
        }),
      })

      const data = await response.json()

      if (response.ok && data.authUrl) {
        setAuthUrl(data.authUrl)
      } else {
        setError(data.error || "Failed to generate authentication URL")
        onAuthError(data.error || "Failed to generate authentication URL")
      }
    } catch (error) {
      console.error("Error generating auth URL:", error)
      setError("An error occurred while generating the authentication URL")
      onAuthError("An error occurred while generating the authentication URL")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = () => {
    if (authUrl) {
      // Open the auth URL in a new window
      const authWindow = window.open(authUrl, "googleAuth", "width=600,height=600")

      // Poll for the auth result
      const checkInterval = setInterval(() => {
        try {
          if (authWindow && authWindow.closed) {
            clearInterval(checkInterval)

            // Check if authentication was successful
            fetch("/api/google/auth-check")
              .then((response) => response.json())
              .then((data) => {
                if (data.isAuthenticated) {
                  onAuthSuccess()
                } else {
                  setError("Authentication failed or was cancelled")
                  onAuthError("Authentication failed or was cancelled")
                }
              })
              .catch((error) => {
                console.error("Error checking auth status:", error)
                setError("Failed to verify authentication status")
                onAuthError("Failed to verify authentication status")
              })
          }
        } catch (e) {
          // Handle cross-origin errors
          console.error("Error checking window status:", e)
        }
      }, 500)
    }
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
          <CardTitle>Google API Credentials</CardTitle>
          <CardDescription>Enter your Google API credentials to authenticate with Google services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input
              id="client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your Google Client ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input
              id="client-secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your Google Client Secret"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleGenerateAuthUrl} disabled={isLoading || !clientId || !clientSecret}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Auth URL"
            )}
          </Button>
          {authUrl && <Button onClick={handleAuth}>Authenticate with Google</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}
