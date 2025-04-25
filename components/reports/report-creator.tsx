"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Database, LineChart, PieChart, BarChart, TableIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SqlQueryBuilder } from "@/components/reports/sql-query-builder"
import { ReportPreview } from "@/components/reports/report-preview"
import { ReportScheduler } from "@/components/reports/report-scheduler"

export function ReportCreator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [reportType, setReportType] = useState<string>("")
  const [chartType, setChartType] = useState<string>("")
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [sqlQuery, setSqlQuery] = useState("")

  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSave = () => {
    // Here you would save the report configuration
    console.log("Saving report:", {
      name: reportName,
      description: reportDescription,
      type: reportType,
      chartType,
      sqlQuery,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Report</CardTitle>
        <CardDescription>Design a custom report with SQL queries and visualizations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "border border-input"}`}
              >
                1
              </div>
              <div className="text-sm font-medium">Basic Info</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "border border-input"}`}
              >
                2
              </div>
              <div className="text-sm font-medium">Data Source</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "border border-input"}`}
              >
                3
              </div>
              <div className="text-sm font-medium">Visualization</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 4 ? "bg-primary text-primary-foreground" : "border border-input"}`}
              >
                4
              </div>
              <div className="text-sm font-medium">Schedule</div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Enter report description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer ${reportType === "chart" ? "border-primary" : ""}`}
                  onClick={() => setReportType("chart")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <LineChart className="h-12 w-12 text-primary" />
                    <h3 className="mt-2 font-medium">Chart</h3>
                    <p className="text-sm text-muted-foreground">Visualize data with charts</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer ${reportType === "table" ? "border-primary" : ""}`}
                  onClick={() => setReportType("table")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <TableIcon className="h-12 w-12 text-primary" />
                    <h3 className="mt-2 font-medium">Table</h3>
                    <p className="text-sm text-muted-foreground">Display data in tabular format</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {reportType === "chart" && (
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card
                    className={`cursor-pointer ${chartType === "line" ? "border-primary" : ""}`}
                    onClick={() => setChartType("line")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <LineChart className="h-8 w-8 text-primary" />
                      <h3 className="mt-2 text-sm font-medium">Line Chart</h3>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer ${chartType === "bar" ? "border-primary" : ""}`}
                    onClick={() => setChartType("bar")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <BarChart className="h-8 w-8 text-primary" />
                      <h3 className="mt-2 text-sm font-medium">Bar Chart</h3>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer ${chartType === "pie" ? "border-primary" : ""}`}
                    onClick={() => setChartType("pie")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <PieChart className="h-8 w-8 text-primary" />
                      <h3 className="mt-2 text-sm font-medium">Pie Chart</h3>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Database Connection</Label>
              <Select defaultValue="mssql">
                <SelectTrigger>
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mssql">
                    <div className="flex items-center">
                      <Database className="mr-2 h-4 w-4" />
                      MSSQL Database
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SqlQueryBuilder onQueryChange={setSqlQuery} />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <ReportPreview reportType={reportType} chartType={chartType} sqlQuery={sqlQuery} />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <ReportScheduler />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        ) : (
          <div />
        )}
        {currentStep < 4 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSave}>Save Report</Button>
        )}
      </CardFooter>
    </Card>
  )
}
