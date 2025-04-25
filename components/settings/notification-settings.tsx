"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Bell, BellOff, CheckCircle2, Mail, MessageSquare, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [errorAlerts, setErrorAlerts] = useState(true)
  const [performanceAlerts, setPerformanceAlerts] = useState(true)
  const [usageAlerts, setUsageAlerts] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [emailAddress, setEmailAddress] = useState("admin@example.com")
  const [alertFrequency, setAlertFrequency] = useState("immediate")
  const [saveStatus, setSaveStatus] = useState<null | { success: boolean; message: string }>(null)

  const saveSettings = () => {
    // In a real app, this would save to a backend
    setSaveStatus({
      success: true,
      message: "Notification settings saved successfully",
    })

    // Clear the status after 3 seconds
    setTimeout(() => {
      setSaveStatus(null)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="channels">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="channels">Notification Channels</TabsTrigger>
              <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="channels" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="email-notifications" className="text-base">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email for important alerts
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                {emailNotifications && (
                  <div className="ml-9 space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      placeholder="your@email.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-4">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="in-app-notifications" className="text-base">
                        In-App Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Show notifications within the dashboard interface</p>
                    </div>
                  </div>
                  <Switch
                    id="in-app-notifications"
                    checked={inAppNotifications}
                    onCheckedChange={setInAppNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="alert-frequency" className="text-base">
                        Alert Frequency
                      </Label>
                      <p className="text-sm text-muted-foreground">How often you want to receive notifications</p>
                    </div>
                  </div>
                  <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="error-alerts" className="text-base">
                      Error Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">Notifications for query errors and failures</p>
                  </div>
                  <Switch id="error-alerts" checked={errorAlerts} onCheckedChange={setErrorAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="performance-alerts" className="text-base">
                      Performance Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for slow queries and performance issues
                    </p>
                  </div>
                  <Switch id="performance-alerts" checked={performanceAlerts} onCheckedChange={setPerformanceAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="usage-alerts" className="text-base">
                      Usage Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">Notifications for high token usage and quota limits</p>
                  </div>
                  <Switch id="usage-alerts" checked={usageAlerts} onCheckedChange={setUsageAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="security-alerts" className="text-base">
                      Security Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for security-related events and issues
                    </p>
                  </div>
                  <Switch id="security-alerts" checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center space-x-2">
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Quiet Hours</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set times when you don't want to receive notifications
                </p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input id="quiet-start" type="time" defaultValue="22:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input id="quiet-end" type="time" defaultValue="07:00" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-between">
            {saveStatus && (
              <Alert variant={saveStatus.success ? "default" : "destructive"} className="mr-4 flex-1">
                {saveStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{saveStatus.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{saveStatus.message}</AlertDescription>
              </Alert>
            )}
            <Button onClick={saveSettings} className={saveStatus ? "" : "ml-auto"}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
