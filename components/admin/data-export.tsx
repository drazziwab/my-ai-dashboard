"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react"

export function DataExport() {
  const [exportType, setExportType] = useState("llm_requests")
  const [format, setFormat] = useState("csv")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 30)))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [exportHistory, setExportHistory] = useState<any[]>([])

  const exportTypes = [
    { value: "llm_requests", label: "LLM Requests" },
    { value: "database_queries", label: "Database Queries" },
    { value: "system_metrics", label: "System Metrics" },
    { value: "user_activity", label: "User Activity" },
    { value: "system_status", label: "System Status" },
  ]

  const fetchExportHistory = async () => {
    try {
      const response = await fetch("/api/admin/exports/history")
      const data = await response.json()

      if (data.success) {
        setExportHistory(data.exports)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch export history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching export history:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching export history",
        variant: "destructive",
      })
    }
  }

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/exports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exportType,
          format,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          includeHeaders,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if it's a JSON response (error) or a file download
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.message || "Export failed")
        }
      } else {
        // It's a file download
        const blob = await response.blob()
        const filename =
          response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") ||
          `export_${exportType}_${new Date().toISOString().split("T")[0]}.${format}`

        // Create a download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Update export history
        fetchExportHistory()

        toast({
          title: "Success",
          description: "Export completed successfully",
        })
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "An error occurred during export",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Export system data for analysis or backup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-type">Data Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger id="export-type">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-headers"
              checked={includeHeaders}
              onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
            />
            <Label htmlFor="include-headers">Include column headers</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleExport} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>History of your recent data exports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Exported At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {exportHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No export history found
                    </td>
                  </tr>
                ) : (
                  exportHistory.map((export_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {exportTypes.find((t) => t.value === export_.type)?.label || export_.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{export_.format.toUpperCase()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {new Date(export_.start_date).toLocaleDateString()} -{" "}
                        {new Date(export_.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {new Date(export_.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {export_.size_kb ? `${export_.size_kb} KB` : "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Download the export
                            window.location.href = `/api/admin/exports/download/${export_.export_id}`
                          }}
                        >
                          {export_.format === "csv" ? (
                            <FileText className="h-4 w-4" />
                          ) : export_.format === "xlsx" ? (
                            <FileSpreadsheet className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
