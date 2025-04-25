"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pie, PieChart, Cell, Legend } from "recharts"
import { Calendar, Download, FileSpreadsheet, Printer, RefreshCw } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ReportViewerProps {
  id: string
}

export function ReportViewer({ id }: ReportViewerProps) {
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  // Mock data for the chart
  const data = [
    { model_name: "GPT-4o", request_count: 12458, avg_response_time: 245.32 },
    { model_name: "Claude 3", request_count: 8245, avg_response_time: 312.18 },
    { model_name: "Llama 3", request_count: 3124, avg_response_time: 178.45 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  useEffect(() => {
    // In a real app, this would fetch the report data from the API
    const fetchReport = async () => {
      setIsLoading(true)
      try {
        // Mock data for the example
        const reportData = {
          id: "rep-001",
          name: "LLM Usage by Model",
          description: "Breakdown of token usage across different LLM models",
          type: "chart",
          chartType: "pie",
          lastRun: "2025-04-24 10:15:22",
          createdBy: "admin@example.com",
        }

        setReport(reportData)
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [id])

  const handleRefresh = () => {
    // In a real app, this would refresh the report data
    console.log("Refreshing report data with date range:", date)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{report.name}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {report.type === "chart" && report.chartType === "pie" && (
            <ChartContainer
              config={{
                request_count: {
                  label: "Request Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[500px]"
            >
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={200}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>Raw data used to generate this report</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Last Run</p>
              <p className="text-sm text-muted-foreground">{report.lastRun}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created By</p>
              <p className="text-sm text-muted-foreground">{report.createdBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
