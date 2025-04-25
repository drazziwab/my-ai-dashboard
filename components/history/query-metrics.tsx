"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function QueryMetrics() {
  // Sample data for query metrics
  const dailyData = [
    { date: "Apr 18", llmQueries: 1245, dbQueries: 3254, avgLatency: 245 },
    { date: "Apr 19", llmQueries: 1345, dbQueries: 3542, avgLatency: 232 },
    { date: "Apr 20", llmQueries: 1542, dbQueries: 3845, avgLatency: 256 },
    { date: "Apr 21", llmQueries: 1876, dbQueries: 4125, avgLatency: 278 },
    { date: "Apr 22", llmQueries: 1654, dbQueries: 3965, avgLatency: 245 },
    { date: "Apr 23", llmQueries: 1432, dbQueries: 3654, avgLatency: 234 },
    { date: "Apr 24", llmQueries: 1587, dbQueries: 3845, avgLatency: 242 },
  ]

  const hourlyData = [
    { time: "00:00", llmQueries: 45, dbQueries: 124, avgLatency: 232 },
    { time: "04:00", llmQueries: 32, dbQueries: 98, avgLatency: 225 },
    { time: "08:00", llmQueries: 87, dbQueries: 245, avgLatency: 245 },
    { time: "12:00", llmQueries: 154, dbQueries: 387, avgLatency: 278 },
    { time: "16:00", llmQueries: 132, dbQueries: 354, avgLatency: 265 },
    { time: "20:00", llmQueries: 98, dbQueries: 276, avgLatency: 242 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Metrics</CardTitle>
        <CardDescription>Overview of query volume and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="pt-4">
            <ChartContainer
              config={{
                llmQueries: {
                  label: "LLM Queries",
                  color: "hsl(var(--chart-1))",
                },
                dbQueries: {
                  label: "DB Queries",
                  color: "hsl(var(--chart-2))",
                },
                avgLatency: {
                  label: "Avg Latency (ms)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="llmQueries"
                    stroke="var(--color-llmQueries)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="dbQueries"
                    stroke="var(--color-dbQueries)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgLatency"
                    stroke="var(--color-avgLatency)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="hourly" className="pt-4">
            <ChartContainer
              config={{
                llmQueries: {
                  label: "LLM Queries",
                  color: "hsl(var(--chart-1))",
                },
                dbQueries: {
                  label: "DB Queries",
                  color: "hsl(var(--chart-2))",
                },
                avgLatency: {
                  label: "Avg Latency (ms)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="llmQueries"
                    stroke="var(--color-llmQueries)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="dbQueries"
                    stroke="var(--color-dbQueries)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgLatency"
                    stroke="var(--color-avgLatency)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium">Total Queries Today</div>
            <div className="mt-1 text-2xl font-bold">5,432</div>
            <div className="text-xs text-muted-foreground">+12.5% from yesterday</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium">LLM Queries</div>
            <div className="mt-1 text-2xl font-bold">1,587</div>
            <div className="text-xs text-muted-foreground">29.2% of total</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium">DB Queries</div>
            <div className="mt-1 text-2xl font-bold">3,845</div>
            <div className="text-xs text-muted-foreground">70.8% of total</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium">Avg. Latency</div>
            <div className="mt-1 text-2xl font-bold">242ms</div>
            <div className="text-xs text-muted-foreground">-1.2% from yesterday</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
