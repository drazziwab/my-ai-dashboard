"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Eye, FileSpreadsheet, LineChart, MoreHorizontal, PieChart, Trash } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample data for reports
const reports = [
  {
    id: "rep-001",
    name: "LLM Usage by Model",
    description: "Breakdown of token usage across different LLM models",
    type: "chart",
    chartType: "pie",
    lastRun: "2025-04-24 10:15:22",
    scheduled: true,
    frequency: "Daily",
    createdBy: "admin@example.com",
  },
  {
    id: "rep-002",
    name: "Database Performance Trends",
    description: "Weekly trends of database performance metrics",
    type: "chart",
    chartType: "line",
    lastRun: "2025-04-23 14:30:45",
    scheduled: true,
    frequency: "Weekly",
    createdBy: "admin@example.com",
  },
  {
    id: "rep-003",
    name: "User Activity Report",
    description: "Detailed breakdown of user interactions with the system",
    type: "table",
    lastRun: "2025-04-22 09:45:12",
    scheduled: false,
    frequency: "N/A",
    createdBy: "admin@example.com",
  },
  {
    id: "rep-004",
    name: "Error Rate Analysis",
    description: "Analysis of error rates by LLM model and query type",
    type: "chart",
    chartType: "bar",
    lastRun: "2025-04-21 16:20:33",
    scheduled: true,
    frequency: "Monthly",
    createdBy: "admin@example.com",
  },
  {
    id: "rep-005",
    name: "Cost Optimization Report",
    description: "Token usage and cost analysis for optimization opportunities",
    type: "table",
    lastRun: "2025-04-20 11:10:05",
    scheduled: true,
    frequency: "Weekly",
    createdBy: "admin@example.com",
  },
]

export function ReportsList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>View and manage your custom reports</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/reports/scheduled">
                <Calendar className="mr-2 h-4 w-4" />
                Scheduled Reports
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Last Run</TableHead>
                  <TableHead className="hidden md:table-cell">Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">{report.description}</div>
                    </TableCell>
                    <TableCell>
                      {report.type === "chart" ? (
                        <div className="flex items-center">
                          {report.chartType === "pie" ? (
                            <PieChart className="mr-2 h-4 w-4" />
                          ) : (
                            <LineChart className="mr-2 h-4 w-4" />
                          )}
                          Chart
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          Table
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{report.lastRun}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {report.scheduled ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.frequency}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not scheduled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/reports/${report.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/reports/${report.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" /> Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="charts" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Chart Type</TableHead>
                  <TableHead className="hidden md:table-cell">Last Run</TableHead>
                  <TableHead className="hidden md:table-cell">Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports
                  .filter((report) => report.type === "chart")
                  .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </TableCell>
                      <TableCell>
                        {report.chartType === "pie" ? (
                          <div className="flex items-center">
                            <PieChart className="mr-2 h-4 w-4" />
                            Pie Chart
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <LineChart className="mr-2 h-4 w-4" />
                            Line Chart
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{report.lastRun}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {report.scheduled ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {report.frequency}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not scheduled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/${report.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/${report.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" /> Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="tables" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Last Run</TableHead>
                  <TableHead className="hidden md:table-cell">Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports
                  .filter((report) => report.type === "table")
                  .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{report.lastRun}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {report.scheduled ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {report.frequency}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not scheduled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/${report.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/${report.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" /> Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Frequency</TableHead>
                  <TableHead className="hidden md:table-cell">Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports
                  .filter((report) => report.scheduled)
                  .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </TableCell>
                      <TableCell>
                        {report.type === "chart" ? (
                          <div className="flex items-center">
                            {report.chartType === "pie" ? (
                              <PieChart className="mr-2 h-4 w-4" />
                            ) : (
                              <LineChart className="mr-2 h-4 w-4" />
                            )}
                            Chart
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Table
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{report.lastRun}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/${report.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/${report.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" /> Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
