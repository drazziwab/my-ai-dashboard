"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { RefreshCw, Clock, AlertCircle, CheckCircle2, Activity, Zap, TrendingUp, Database, Brain } from "lucide-react"

interface MetricCard {
  title: string
  value: string | number
  description: string
  change: number
  icon: React.ReactNode
}

export function RealTimeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("1h")
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: "Active Users",
      value: 0,
      description: "Users currently online",
      change: 0,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "|my-ai| Requests",
      value: 0,
      description: "Requests in last hour",
      change: 0,
      icon: <Brain className="h-4 w-4" />,
    },
    {
      title: "DB Queries",
      value: 0,
      description: "Queries in last hour",
      change: 0,
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: "Response Time",
      value: "0ms",
      description: "Average response time",
      change: 0,
      icon: <Zap className="h-4 w-4" />,
    },
  ])
  const [llmData, setLlmData] = useState<any[]>([])
  const [dbData, setDbData] = useState<any[]>([])
  const [systemData, setSystemData] = useState<any[]>([])
  const [userActivityData, setUserActivityData] = useState<any[]>([])

  const fetchRealTimeData = async () => {
    setIsLoading(true)
    try {
      // Fetch metrics
      const metricsResponse = await fetch(`/api/analytics/metrics?timeRange=${timeRange}`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()

        if (metricsData.success) {
          setMetrics([
            {
              title: "Active Users",
              value: metricsData.activeUsers || "ErR",
              description: "Users currently online",
              change: metricsData.activeUsersChange || 0,
              icon: <Activity className="h-4 w-4" />,
            },
            {
              title: "|my-ai| Requests",
              value: metricsData.llmRequests || "ErR",
              description: `Requests in last ${timeRange}`,
              change: metricsData.llmRequestsChange || 0,
              icon: <Brain className="h-4 w-4" />,
            },
            {
              title: "DB Queries",
              value: metricsData.dbQueries || "ErR",
              description: `Queries in last ${timeRange}`,
              change: metricsData.dbQueriesChange || 0,
              icon: <Database className="h-4 w-4" />,
            },
            {
              title: "Response Time",
              value: metricsData.avgResponseTime ? `${metricsData.avgResponseTime}ms` : "ErR",
              description: "Average response time",
              change: metricsData.avgResponseTimeChange || 0,
              icon: <Zap className="h-4 w-4" />,
            },
          ])
        }
      } else {
        console.error("Error fetching metrics:", metricsResponse.statusText)
      }

      // Fetch LLM data
      const llmResponse = await fetch(`/api/analytics/llm?timeRange=${timeRange}`)
      if (llmResponse.ok) {
        const llmResponseData = await llmResponse.json()
        if (llmResponseData.success) {
          setLlmData(llmResponseData.data || [])
        }
      } else {
        console.error("Error fetching LLM data:", llmResponse.statusText)
      }

      // Fetch DB data
      const dbResponse = await fetch(`/api/analytics/database?timeRange=${timeRange}`)
      if (dbResponse.ok) {
        const dbResponseData = await dbResponse.json()
        if (dbResponseData.success) {
          setDbData(dbResponseData.data || [])
        }
      } else {
        console.error("Error fetching DB data:", dbResponse.statusText)
      }

      // Fetch system data
      const systemResponse = await fetch(`/api/analytics/system?timeRange=${timeRange}`)
      if (systemResponse.ok) {
        const systemResponseData = await systemResponse.json()
        if (systemResponseData.success) {
          setSystemData(systemResponseData.data || [])
        }
      } else {
        console.error("Error fetching system data:", systemResponse.statusText)
      }

      // Fetch user activity data
      const userActivityResponse = await fetch(`/api/analytics/user-activity?timeRange=${timeRange}`)
      if (userActivityResponse.ok) {
        const userActivityResponseData = await userActivityResponse.json()
        if (userActivityResponseData.success) {
          setUserActivityData(userActivityResponseData.data || [])
        }
      } else {
        console.error("Error fetching user activity data:", userActivityResponse.statusText)
      }
    } catch (error) {
      console.error("Error fetching real-time data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRealTimeData()

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchRealTimeData, 500) // Update every 500ms as requested

    return () => clearInterval(intervalId)
  }, [timeRange])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="llm">|my-ai| Analytics</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>
        <div className="flex gap-2 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">Last 15 min</SelectItem>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchRealTimeData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="text-muted-foreground">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
              <div className="mt-2 flex items-center text-xs">
                {metric.change > 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : metric.change < 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />
                ) : (
                  <Activity className="mr-1 h-3 w-3 text-yellow-500" />
                )}
                <span
                  className={
                    metric.change > 0 ? "text-green-500" : metric.change < 0 ? "text-red-500" : "text-yellow-500"
                  }
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}% from previous period
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>|my-ai| Requests</CardTitle>
              <CardDescription>Requests over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  requests: {
                    label: "Requests",
                    color: "hsl(var(--chart-1))",
                  },
                  tokens: {
                    label: "Tokens",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={llmData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="var(--color-requests)" />
                    <Line type="monotone" dataKey="tokens" stroke="var(--color-tokens)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Database Queries</CardTitle>
              <CardDescription>Query performance</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  queries: {
                    label: "Queries",
                    color: "hsl(var(--chart-3))",
                  },
                  duration: {
                    label: "Avg Duration (ms)",
                    color: "hsl(var(--chart-4))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dbData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="queries" stroke="var(--color-queries)" />
                    <Line type="monotone" dataKey="duration" stroke="var(--color-duration)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>CPU, RAM, and GPU usage</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                cpu: {
                  label: "CPU Usage",
                  color: "hsl(var(--chart-1))",
                },
                ram: {
                  label: "RAM Usage",
                  color: "hsl(var(--chart-2))",
                },
                gpu: {
                  label: "GPU Usage",
                  color: "hsl(var(--chart-3))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="var(--color-cpu)" />
                  <Line type="monotone" dataKey="ram" stroke="var(--color-ram)" />
                  <Line type="monotone" dataKey="gpu" stroke="var(--color-gpu)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="llm" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Model Usage</CardTitle>
              <CardDescription>Requests by model</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={llmData.filter((d) => d.modelBreakdown)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#8884d8" name="Requests" />
                  <Bar dataKey="tokens" fill="#82ca9d" name="Tokens (K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
              <CardDescription>Average response time by model (ms)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={llmData.filter((d) => d.modelBreakdown)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="responseTime" fill="#ff7300" name="Avg Response Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Token Usage Over Time</CardTitle>
            <CardDescription>Prompt vs. completion tokens</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                promptTokens: {
                  label: "Prompt Tokens",
                  color: "hsl(var(--chart-1))",
                },
                completionTokens: {
                  label: "Completion Tokens",
                  color: "hsl(var(--chart-2))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={llmData.filter((d) => d.tokenBreakdown)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="promptTokens" stroke="var(--color-promptTokens)" />
                  <Line type="monotone" dataKey="completionTokens" stroke="var(--color-completionTokens)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="database" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Query Types</CardTitle>
              <CardDescription>Distribution of query types</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dbData.filter((d) => d.queryTypes)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Query Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Query Performance</CardTitle>
              <CardDescription>Execution time by query type (ms)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dbData.filter((d) => d.queryTypes)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgTime" fill="#82ca9d" name="Avg Execution Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Database Performance</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dbData
                .filter((d) => d.metrics)
                .flatMap((d) => d.metrics)
                .map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <span className="text-sm text-muted-foreground">{metric.value}%</span>
                    </div>
                    <Progress
                      value={metric.value}
                      className="h-2"
                      indicatorClassName={
                        metric.value > 80 ? "bg-red-500" : metric.value > 60 ? "bg-yellow-500" : "bg-green-500"
                      }
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>CPU & RAM Usage</CardTitle>
              <CardDescription>System resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  cpu: {
                    label: "CPU Usage",
                    color: "hsl(var(--chart-1))",
                  },
                  ram: {
                    label: "RAM Usage",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={systemData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="var(--color-cpu)" />
                    <Line type="monotone" dataKey="ram" stroke="var(--color-ram)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>GPU & Disk Usage</CardTitle>
              <CardDescription>Hardware resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  gpu: {
                    label: "GPU Usage",
                    color: "hsl(var(--chart-3))",
                  },
                  disk: {
                    label: "Disk Usage",
                    color: "hsl(var(--chart-4))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={systemData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="gpu" stroke="var(--color-gpu)" />
                    <Line type="monotone" dataKey="disk" stroke="var(--color-disk)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current status of all systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemData
                .filter((d) => d.statuses)
                .flatMap((d) => d.statuses)
                .map((status, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      status.isOnline
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                        : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          status.isOnline
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {status.isOnline ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{status.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {status.isOnline ? `Response: ${status.responseTime}ms` : status.error || "Offline"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        status.isOnline ? "bg-green-500 shadow-glow-green" : "bg-red-500 shadow-glow-red"
                      }`}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Users over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  activeUsers: {
                    label: "Active Users",
                    color: "hsl(var(--chart-1))",
                  },
                  newUsers: {
                    label: "New Users",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="activeUsers" stroke="var(--color-activeUsers)" />
                    <Line type="monotone" dataKey="newUsers" stroke="var(--color-newUsers)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Actions performed by users</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData.filter((d) => d.activityTypes)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Activity Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>Latest actions performed by users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {userActivityData
                    .filter((d) => d.recentActivity)
                    .flatMap((d) => d.recentActivity)
                    .map((activity, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                              {activity.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{activity.username}</div>
                              <div className="text-xs text-muted-foreground">{activity.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Badge
                            variant={
                              activity.type === "|my-ai| Request"
                                ? "default"
                                : activity.type === "Database Query"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {activity.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{activity.details}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{activity.time}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
