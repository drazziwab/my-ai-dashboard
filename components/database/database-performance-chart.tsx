"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const queryData = [
  { time: "00:00", queries: 1200, latency: 42 },
  { time: "04:00", queries: 800, latency: 38 },
  { time: "08:00", queries: 2400, latency: 45 },
  { time: "12:00", queries: 3800, latency: 52 },
  { time: "16:00", queries: 3200, latency: 48 },
  { time: "20:00", queries: 2100, latency: 44 },
]

export function DatabasePerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Performance</CardTitle>
        <CardDescription>Database query volume and latency over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={queryData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Line
                type="monotone"
                dataKey="queries"
                stroke="hsl(215, 100%, 50%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="hsl(280, 100%, 50%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
