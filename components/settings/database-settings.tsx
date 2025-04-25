"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2, Database, ExternalLink, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export function DatabaseSettings() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<null | { success: boolean; message: string }>(null)
  const [formData, setFormData] = useState({
    server: "CASH",
    database: "master",
    username: "placeholder",
    password: "placeholder",
    encrypt: true,
    trustServerCertificate: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const testConnection = async () => {
    setIsConnecting(true)
    setConnectionStatus(null)

    try {
      const response = await fetch("/api/database/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus({
          success: true,
          message: `Successfully connected to database. Server version: ${data.version}`,
        })
      } else {
        setConnectionStatus({
          success: false,
          message: `Connection failed: ${data.error}`,
        })
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Connection failed: ${(error as Error).message}`,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const saveSettings = async () => {
    try {
      const response = await fetch("/api/database/save-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus({
          success: true,
          message: "Database settings saved successfully",
        })
      } else {
        setConnectionStatus({
          success: false,
          message: `Failed to save settings: ${data.error}`,
        })
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Failed to save settings: ${(error as Error).message}`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
          <CardDescription>Configure your MSSQL database connection settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connection">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="connection" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server">Server</Label>
                  <Input
                    id="server"
                    name="server"
                    placeholder="localhost"
                    value={formData.server}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    name="database"
                    placeholder="master"
                    value={formData.database}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="sa"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="encrypt"
                  name="encrypt"
                  checked={formData.encrypt}
                  onCheckedChange={(checked) => setFormData({ ...formData, encrypt: checked as boolean })}
                />
                <Label htmlFor="encrypt">Encrypt connection</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trustServerCertificate"
                  name="trustServerCertificate"
                  checked={formData.trustServerCertificate}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, trustServerCertificate: checked as boolean })
                  }
                />
                <Label htmlFor="trustServerCertificate">Trust server certificate (for local development)</Label>
              </div>

              {connectionStatus && (
                <Alert variant={connectionStatus.success ? "default" : "destructive"}>
                  {connectionStatus.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{connectionStatus.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{connectionStatus.message}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="connectionString">Connection String</Label>
                <Textarea
                  id="connectionString"
                  placeholder="Server=localhost;Database=master;User Id=sa;Password=yourpassword;"
                  className="font-mono h-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connectionTimeout">Connection Timeout (seconds)</Label>
                <Input id="connectionTimeout" type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commandTimeout">Command Timeout (seconds)</Label>
                <Input id="commandTimeout" type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poolSize">Connection Pool Size</Label>
                <Input id="poolSize" type="number" defaultValue={10} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={testConnection} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
          <Button onClick={saveSettings}>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Explorer</CardTitle>
          <CardDescription>Browse your database schema and run queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Database className="mx-auto h-12 w-12 text-primary/50" />
            <p className="mt-2">Use the Database Explorer to browse tables and run SQL queries</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/database/explorer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Database Explorer
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
