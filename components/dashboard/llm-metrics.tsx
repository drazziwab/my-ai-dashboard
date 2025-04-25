"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface LlmMetricsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LlmMetrics({ className }: LlmMetricsProps) {
  const data = [
    { date: "Apr 01", tokens: 2400, requests: 240, latency: 120 },
    { date: "Apr 02", tokens: 1398, requests: 139, latency: 150 },
    { date: "Apr 03", tokens: 9800, requests: 980, latency: 110 },
    { date: "Apr 04", tokens: 3908, requests: 390, latency: 90 },
    { date: "Apr 05", tokens: 4800, requests: 480, latency: 100 },
    { date: "Apr 06", tokens: 3800, requests: 380, latency: 115 },
    { date: "Apr 07", tokens: 4300, requests: 430, latency: 95 },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>LLM Performance Metrics</CardTitle>
        <CardDescription>Monitor token usage, request volume, and response times</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tokens">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tokens">Token Usage</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
          </TabsList>
          <TabsContent value="tokens" className="space-y-4">
            <ChartContainer
              config={{
                tokens: {
                  label: "Tokens",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-tokens)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="requests" className="space-y-4">
            <ChartContainer
              config={{
                requests: {
                  label: "Requests",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-requests)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="latency" className="space-y-4">
            <ChartContainer
              config={{
                latency: {
                  label: "Latency (ms)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="var(--color-latency)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
