import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseMetrics } from "@/components/dashboard/database-metrics"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

export default function DatabaseMetricsPage() {
  const queryData = [
    { time: "00:00", queries: 1200, latency: 42 },
    { time: "04:00", queries: 800, latency: 38 },
    { time: "08:00", queries: 2400, latency: 45 },
    { time: "12:00", queries: 3800, latency: 52 },
    { time: "16:00", queries: 3200, latency: 48 },
    { time: "20:00", queries: 2100, latency: 44 },
  ]

  return (
    <DashboardShell>
      <DashboardHeader heading="Database Metrics" text="Monitor your database performance and resource utilization." />
      <div className="grid gap-4 md:gap-8">
        <DatabaseMetrics className="w-full" />

        <Card>
          <CardHeader>
            <CardTitle>Query Performance</CardTitle>
            <CardDescription>Database query volume and latency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={queryData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} orientation="right" />
                  <Line
                    type="monotone"
                    dataKey="queries"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Database Tables</CardTitle>
            <CardDescription>Most accessed tables and their performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Size (MB)</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Read Ops</TableHead>
                  <TableHead>Write Ops</TableHead>
                  <TableHead>Avg Query Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">users</TableCell>
                  <TableCell>245</TableCell>
                  <TableCell>24,582</TableCell>
                  <TableCell>45,872</TableCell>
                  <TableCell>1,245</TableCell>
                  <TableCell>12ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">conversations</TableCell>
                  <TableCell>1,245</TableCell>
                  <TableCell>128,954</TableCell>
                  <TableCell>89,432</TableCell>
                  <TableCell>12,458</TableCell>
                  <TableCell>18ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">messages</TableCell>
                  <TableCell>3,842</TableCell>
                  <TableCell>542,872</TableCell>
                  <TableCell>124,582</TableCell>
                  <TableCell>24,582</TableCell>
                  <TableCell>22ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">embeddings</TableCell>
                  <TableCell>8,452</TableCell>
                  <TableCell>245,872</TableCell>
                  <TableCell>245,872</TableCell>
                  <TableCell>5,482</TableCell>
                  <TableCell>28ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">analytics</TableCell>
                  <TableCell>2,458</TableCell>
                  <TableCell>845,245</TableCell>
                  <TableCell>12,458</TableCell>
                  <TableCell>8,452</TableCell>
                  <TableCell>15ms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
