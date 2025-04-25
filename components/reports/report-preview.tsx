"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis, Cell, Legend } from "recharts"

interface ReportPreviewProps {
  reportType: string
  chartType?: string
  sqlQuery: string
}

export function ReportPreview({ reportType, chartType, sqlQuery }: ReportPreviewProps) {
  // Mock data for preview
  const data = [
    { model_name: "GPT-4o", request_count: 12458, avg_response_time: 245.32 },
    { model_name: "Claude 3", request_count: 8245, avg_response_time: 312.18 },
    { model_name: "Llama 3", request_count: 3124, avg_response_time: 178.45 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Preview of your report based on sample data</CardDescription>
        </CardHeader>
        <CardContent>
          {reportType === "chart" && chartType === "line" && (
            <ChartContainer
              config={{
                request_count: {
                  label: "Request Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[400px]"
            >
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model_name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="request_count"
                  stroke="var(--color-request_count)"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          )}

          {reportType === "chart" && chartType === "bar" && (
            <ChartContainer
              config={{
                request_count: {
                  label: "Request Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[400px]"
            >
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model_name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="request_count" fill="var(--color-request_count)" />
              </BarChart>
            </ChartContainer>
          )}

          {reportType === "chart" && chartType === "pie" && (
            <ChartContainer
              config={{
                request_count: {
                  label: "Request Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[400px]"
            >
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="request_count"
                  nameKey="model_name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          )}

          {reportType === "table" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Request Count</TableHead>
                  <TableHead>Avg Response Time (ms)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.model_name}</TableCell>
                    <TableCell>{row.request_count.toLocaleString()}</TableCell>
                    <TableCell>{row.avg_response_time.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SQL Query</CardTitle>
          <CardDescription>The SQL query that will be used to generate this report</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">{sqlQuery || "No SQL query provided"}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
