"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, TableIcon } from "lucide-react"

interface SqlQueryBuilderProps {
  onQueryChange: (query: string) => void
}

export function SqlQueryBuilder({ onQueryChange }: SqlQueryBuilderProps) {
  const [query, setQuery] =
    useState<string>(`SELECT model_name, COUNT(*) as request_count, AVG(response_time_ms) as avg_response_time
FROM llm_requests
WHERE request_timestamp BETWEEN @start_date AND @end_date
GROUP BY model_name
ORDER BY request_count DESC`)
  const [previewData, setPreviewData] = useState<any[]>([
    { model_name: "GPT-4o", request_count: 12458, avg_response_time: 245.32 },
    { model_name: "Claude 3", request_count: 8245, avg_response_time: 312.18 },
    { model_name: "Llama 3", request_count: 3124, avg_response_time: 178.45 },
  ])

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    onQueryChange(newQuery)
  }

  const handleRunQuery = () => {
    // In a real app, this would execute the query against the database
    console.log("Running query:", query)
    // For now, we'll just use our mock data
    onQueryChange(query)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">SQL Query</Label>
        <div className="flex items-center gap-2">
          <Select defaultValue="llm_requests">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="llm_requests">
                <div className="flex items-center">
                  <TableIcon className="mr-2 h-4 w-4" />
                  llm_requests
                </div>
              </SelectItem>
              <SelectItem value="database_metrics">
                <div className="flex items-center">
                  <TableIcon className="mr-2 h-4 w-4" />
                  database_metrics
                </div>
              </SelectItem>
              <SelectItem value="user_activity">
                <div className="flex items-center">
                  <TableIcon className="mr-2 h-4 w-4" />
                  user_activity
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRunQuery}>
            <Play className="mr-2 h-4 w-4" />
            Run Query
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">SQL Editor</TabsTrigger>
          <TabsTrigger value="builder">Query Builder</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Card>
            <CardContent className="p-4">
              <textarea
                className="w-full min-h-[200px] font-mono text-sm p-4 border rounded-md"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="builder">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Fields</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="field-model" className="rounded" defaultChecked />
                        <label htmlFor="field-model">model_name</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="field-count" className="rounded" defaultChecked />
                        <label htmlFor="field-count">COUNT(*) as request_count</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="field-avg" className="rounded" defaultChecked />
                        <label htmlFor="field-avg">AVG(response_time_ms) as avg_response_time</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Filters</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-date" className="rounded" defaultChecked />
                        <label htmlFor="filter-date">request_timestamp BETWEEN @start_date AND @end_date</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Group By</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="group-model" className="rounded" defaultChecked />
                      <label htmlFor="group-model">model_name</label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Order By</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="order-count" className="rounded" defaultChecked />
                      <label htmlFor="order-count">request_count DESC</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>model_name</TableHead>
                    <TableHead>request_count</TableHead>
                    <TableHead>avg_response_time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.model_name}</TableCell>
                      <TableCell>{row.request_count}</TableCell>
                      <TableCell>{row.avg_response_time.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Tip:</strong> Use parameters like @start_date and @end_date for dynamic date filtering.
        </p>
      </div>
    </div>
  )
}
