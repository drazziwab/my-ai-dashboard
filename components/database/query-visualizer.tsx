"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Download, BarChartIcon, LineChartIcon, PieChartIcon } from "lucide-react"

interface QueryVisualizerProps {
  results: any[] | null
}

export function QueryVisualizer({ results }: QueryVisualizerProps) {
  const [chartType, setChartType] = useState("bar")
  const [xAxisField, setXAxisField] = useState("")
  const [yAxisField, setYAxisField] = useState("")

  // Mock results for demonstration
  const mockResults = [
    { model: "GPT-4o", requests: 12458, avg_response_time: 245.32 },
    { model: "Claude 3", requests: 8245, avg_response_time: 312.18 },
    { model: "Llama 3", requests: 3124, avg_response_time: 178.45 },
    { model: "Mistral", requests: 5678, avg_response_time: 201.87 },
    { model: "Gemini", requests: 7890, avg_response_time: 267.92 },
  ]

  // Use mock data if results is null
  const displayResults = results || mockResults

  // Get all fields from the first result
  const fields = displayResults.length > 0 ? Object.keys(displayResults[0]) : []

  // Set default fields if not set
  if (fields.length > 0 && !xAxisField) {
    setXAxisField(fields[0])
  }
  if (fields.length > 1 && !yAxisField) {
    // Try to find a numeric field for y-axis
    const numericField = fields.find((field) => typeof displayResults[0][field] === "number")
    setYAxisField(numericField || fields[1])
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const exportChart = () => {
    // In a real app, this would export the chart as an image
    alert("Chart export functionality would be implemented here")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>Visualize your query results with charts</CardDescription>
          </div>
          <Button variant="outline" onClick={exportChart}>
            <Download className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Tabs value={chartType} onValueChange={setChartType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bar" className="flex items-center gap-2">
                  <BarChartIcon className="h-4 w-4" />
                  Bar
                </TabsTrigger>
                <TabsTrigger value="line" className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  Line
                </TabsTrigger>
                <TabsTrigger value="pie" className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Pie
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            <Select value={xAxisField} onValueChange={setXAxisField}>
              <SelectTrigger>
                <SelectValue placeholder="X-Axis Field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={yAxisField} onValueChange={setYAxisField}>
              <SelectTrigger>
                <SelectValue placeholder="Y-Axis Field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {chartType === "bar" && (
            <ChartContainer
              config={{
                [yAxisField]: {
                  label: yAxisField,
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayResults} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxisField} angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey={yAxisField} fill="var(--color-yAxisField)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {chartType === "line" && (
            <ChartContainer
              config={{
                [yAxisField]: {
                  label: yAxisField,
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayResults} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxisField} angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey={yAxisField}
                    stroke="var(--color-yAxisField)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {chartType === "pie" && (
            <ChartContainer
              config={{
                [yAxisField]: {
                  label: yAxisField,
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <Pie
                    data={displayResults}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey={yAxisField}
                    nameKey={xAxisField}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {displayResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
