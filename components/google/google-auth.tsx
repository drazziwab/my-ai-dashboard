"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Mail, RefreshCw } from "lucide-react"

interface GoogleAuthProps {
  onAuthenticate: (email: string) => Promise<void>
  isAuthenticating: boolean
  error: string | null
}

export function GoogleAuth({ onAuthenticate, isAuthenticating, error }: GoogleAuthProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAuthenticate(email)
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Connect Google Account</CardTitle>
        <CardDescription>Connect your Google account to access Gmail, Calendar, Docs, and Sheets</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Note: In a real application, you would be redirected to Google&apos;s OAuth flow. This is a simplified
              demo that simulates the authentication process.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isAuthenticating}>
            {isAuthenticating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Connect Google Account
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
