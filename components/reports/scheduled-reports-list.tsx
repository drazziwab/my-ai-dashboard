"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit, Eye, FileSpreadsheet, Mail, MoreHorizontal, Trash } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample data for scheduled reports
const scheduledReports = [
  {
    id: "rep-001",
    name: "LLM Usage by Model",
    description: "Breakdown of token usage across different LLM models",
    type: "chart",
    chartType: "pie",
    frequency: "Daily",
    nextRun: "2025-04-25 10:00:00",
    recipients: ["admin@example.com", "team@example.com"],
    format: "PDF",
  },
  {
    id: "rep-002",
    name: "Database Performance Trends",
    description: "Weekly trends of database performance metrics",
    type: "chart",
    chartType: "line",
    frequency: "Weekly",
    nextRun: "2025-04-30 09:00:00",
    recipients: ["admin@example.com", "dba@example.com"],
    format: "PDF, Excel",
  },
  {
    id: "rep-004",
    name: "Error Rate Analysis",
    description: "Analysis of error rates by LLM model and query type",
    type: "chart",
    chartType: "bar",
    frequency: "Monthly",
    nextRun: "2025-05-01 08:00:00",
    recipients: ["admin@example.com", "engineering@example.com"],
    format: "PDF",
  },
  {
    id: "rep-005",
    name: "Cost Optimization Report",
    description: "Token usage and cost analysis for optimization opportunities",
    type: "table",
    frequency: "Weekly",
    nextRun: "2025-04-27 07:00:00",
    recipients: ["admin@example.com", "finance@example.com"],
    format: "PDF, Excel, CSV",
  },
]

export function ScheduledReportsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Reports</CardTitle>
        <CardDescription>View and manage your scheduled report deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead className="hidden md:table-cell">Next Run</TableHead>
              <TableHead className="hidden md:table-cell">Recipients</TableHead>
              <TableHead className="hidden md:table-cell">Format</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className="font-medium">{report.name}</div>
                  <div className="text-sm text-muted-foreground">{report.description}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {report.frequency}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{report.nextRun}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {report.recipients.map((recipient, index) => (
                    <div key={index} className="text-sm">
                      {recipient}
                    </div>
                  ))}
                </TableCell>
                <TableCell className="hidden md:table-cell">{report.format}</TableCell>
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
                          <Calendar className="mr-2 h-4 w-4" /> Edit Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" /> Edit Recipients
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileSpreadsheet className="mr-2 h-4 w-4" /> Run Now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete Schedule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
