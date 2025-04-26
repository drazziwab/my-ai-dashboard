import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseMetrics } from "@/components/dashboard/database-metrics"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DatabaseMetricsPage() {
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
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Query performance chart loading...</p>
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
