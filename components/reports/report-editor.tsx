"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SqlQueryBuilder } from "@/components/reports/sql-query-builder"
import { ReportPreview } from "@/components/reports/report-preview"
import { ReportScheduler } from "@/components/reports/report-scheduler"

interface ReportEditorProps {
  id: string
}

export function ReportEditor({ id }: ReportEditorProps) {
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [reportType, setReportType] = useState("")
  const [chartType, setChartType] = useState("")
  const [sqlQuery, setSqlQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
          sqlQuery: `SELECT model_name, COUNT(*) as request_count, AVG(response_time_ms) as avg_response_time
FROM llm_requests
WHERE request_timestamp BETWEEN @start_date AND @end_date
GROUP BY model_name
ORDER BY request_count DESC`,
        }

        setReportName(reportData.name)
        setReportDescription(reportData.description)
        setReportType(reportData.type)
        setChartType(reportData.chartType)
        setSqlQuery(reportData.sqlQuery)
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [id])

  const handleSave = () => {
    // In a real app, this would save the report data to the API
    console.log("Saving report:", {
      id,
      name: reportName,
      description: reportDescription,
      type: reportType,
      chartType,
      sqlQuery,
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Report</CardTitle>
        <CardDescription>Modify your existing report configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="data">Data Source</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 pt-4">
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
          </TabsContent>

          <TabsContent value="data" className="space-y-6 pt-4">
            <SqlQueryBuilder onQueryChange={setSqlQuery} />
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6 pt-4">
            <ReportPreview reportType={reportType} chartType={chartType} sqlQuery={sqlQuery} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 pt-4">
            <ReportScheduler />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
