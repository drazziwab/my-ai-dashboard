"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Tag,
  Trash,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { QueryDetails } from "@/components/history/query-details"
import { QueryMetrics } from "@/components/history/query-metrics"

// Sample data for query history
const queryHistory = [
  {
    id: "q-1001",
    query: "What are the latest sales figures for Q1 2025?",
    type: "llm",
    model: "GPT-4o",
    tokens: 1245,
    latency: "120ms",
    status: "success",
    timestamp: "2025-04-24 14:32:12",
    user: "john.doe@example.com",
    tags: ["sales", "reports"],
  },
  {
    id: "q-1002",
    query: "SELECT * FROM customers WHERE signup_date > '2025-01-01'",
    type: "database",
    database: "MSSQL",
    table: "customers",
    rows: 1245,
    latency: "45ms",
    status: "success",
    timestamp: "2025-04-24 14:30:22",
    user: "jane.smith@example.com",
    tags: ["customer-data"],
  },
  {
    id: "q-1003",
    query: "Summarize the quarterly report for the executive team",
    type: "llm",
    model: "Claude 3",
    tokens: 3782,
    latency: "320ms",
    status: "success",
    timestamp: "2025-04-24 13:45:08",
    user: "john.doe@example.com",
    tags: ["reports", "executive"],
  },
  {
    id: "q-1004",
    query: "SELECT AVG(response_time) FROM llm_requests GROUP BY model",
    type: "database",
    database: "MSSQL",
    table: "llm_requests",
    rows: 5,
    latency: "78ms",
    status: "success",
    timestamp: "2025-04-24 13:22:45",
    user: "admin@example.com",
    tags: ["analytics", "performance"],
  },
  {
    id: "q-1005",
    query: "Generate product descriptions for new items in the spring collection",
    type: "llm",
    model: "GPT-4o",
    tokens: 5421,
    latency: "450ms",
    status: "success",
    timestamp: "2025-04-24 12:18:45",
    user: "marketing@example.com",
    tags: ["marketing", "product"],
  },
  {
    id: "q-1006",
    query: "SELECT * FROM orders WHERE status = 'pending' AND created_at < '2025-04-20'",
    type: "database",
    database: "MSSQL",
    table: "orders",
    rows: 328,
    latency: "62ms",
    status: "success",
    timestamp: "2025-04-24 11:52:18",
    user: "support@example.com",
    tags: ["orders", "support"],
  },
  {
    id: "q-1007",
    query: "Analyze customer feedback sentiment for the new mobile app",
    type: "llm",
    model: "Claude 3",
    tokens: 2876,
    latency: "280ms",
    status: "error",
    error: "Model timeout after 30 seconds",
    timestamp: "2025-04-24 11:05:32",
    user: "product@example.com",
    tags: ["feedback", "mobile-app"],
  },
  {
    id: "q-1008",
    query: "UPDATE users SET status = 'active' WHERE email = 'test@example.com'",
    type: "database",
    database: "MSSQL",
    table: "users",
    rows: 1,
    latency: "35ms",
    status: "success",
    timestamp: "2025-04-24 10:48:22",
    user: "admin@example.com",
    tags: ["user-management"],
  },
  {
    id: "q-1009",
    query: "Translate product manual to Spanish, French, and German",
    type: "llm",
    model: "GPT-4o",
    tokens: 8932,
    latency: "780ms",
    status: "success",
    timestamp: "2025-04-24 10:22:17",
    user: "localization@example.com",
    tags: ["translation", "documentation"],
  },
  {
    id: "q-1010",
    query: "SELECT COUNT(*) FROM user_sessions GROUP BY device_type",
    type: "database",
    database: "MSSQL",
    table: "user_sessions",
    rows: 4,
    latency: "58ms",
    status: "success",
    timestamp: "2025-04-24 09:15:42",
    user: "analytics@example.com",
    tags: ["analytics", "user-data"],
  },
]

export function QueryHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const handleAddFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  const filteredQueries = queryHistory.filter(
    (query) =>
      query.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (query.type === "llm" && query.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (query.type === "database" && query.table.toLowerCase().includes(searchTerm.toLowerCase())) ||
      query.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const paginatedQueries = filteredQueries.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage)

  return (
    <div className="space-y-6">
      {selectedQuery ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedQuery(null)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Query History
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" /> Export Query Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Tag className="mr-2 h-4 w-4" /> Add Tag
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Delete Query
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <QueryDetails query={queryHistory.find((q) => q.id === selectedQuery)!} />
        </div>
      ) : (
        <>
          <QueryMetrics />

          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                  <CardTitle>Query History</CardTitle>
                  <CardDescription>View and search your recent LLM and database queries</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Queries</h4>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Query Type</h5>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="filter-llm" />
                              <label htmlFor="filter-llm" className="text-sm">
                                LLM Queries
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="filter-db" />
                              <label htmlFor="filter-db" className="text-sm">
                                Database Queries
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Status</h5>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="filter-success" />
                              <label htmlFor="filter-success" className="text-sm">
                                Success
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="filter-error" />
                              <label htmlFor="filter-error" className="text-sm">
                                Error
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Date Range</h5>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor="date-from" className="text-xs">
                                From
                              </label>
                              <Input id="date-from" type="date" className="h-8" />
                            </div>
                            <div>
                              <label htmlFor="date-to" className="text-xs">
                                To
                              </label>
                              <Input id="date-to" type="date" className="h-8" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Tags</h5>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="analytics">Analytics</SelectItem>
                              <SelectItem value="reports">Reports</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="product">Product</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            Reset
                          </Button>
                          <Button size="sm">Apply Filters</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search queries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select defaultValue="10">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Rows per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <Badge key={filter} variant="outline" className="flex items-center gap-1">
                        {filter}
                        <button onClick={() => handleRemoveFilter(filter)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])}>
                      Clear all
                    </Button>
                  </div>
                )}
              </div>

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Queries</TabsTrigger>
                  <TabsTrigger value="llm">LLM Queries</TabsTrigger>
                  <TabsTrigger value="database">Database Queries</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">User</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedQueries.map((query) => (
                        <TableRow key={query.id}>
                          <TableCell>
                            <div className="font-medium">{query.id}</div>
                            <div className="max-w-[300px] truncate text-sm text-muted-foreground">{query.query}</div>
                          </TableCell>
                          <TableCell>
                            {query.type === "llm" ? (
                              <Badge variant="secondary">{query.model}</Badge>
                            ) : (
                              <Badge variant="outline">{query.database}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{query.timestamp}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={query.status === "success" ? "default" : "destructive"}>
                              {query.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-xs">{query.user}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedQuery(query.id)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(page * itemsPerPage, filteredQueries.length)}</span> of{" "}
                      <span className="font-medium">{filteredQueries.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous Page</span>
                      </Button>
                      <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Page</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="llm" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="hidden md:table-cell">Tokens</TableHead>
                        <TableHead className="hidden md:table-cell">Latency</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedQueries
                        .filter((query) => query.type === "llm")
                        .map((query) => (
                          <TableRow key={query.id}>
                            <TableCell>
                              <div className="font-medium">{query.id}</div>
                              <div className="max-w-[300px] truncate text-sm text-muted-foreground">{query.query}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{query.model}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{query.tokens}</TableCell>
                            <TableCell className="hidden md:table-cell">{query.latency}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant={query.status === "success" ? "default" : "destructive"}>
                                {query.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedQuery(query.id)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="database" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Database</TableHead>
                        <TableHead className="hidden md:table-cell">Table</TableHead>
                        <TableHead className="hidden md:table-cell">Rows</TableHead>
                        <TableHead className="hidden md:table-cell">Latency</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedQueries
                        .filter((query) => query.type === "database")
                        .map((query) => (
                          <TableRow key={query.id}>
                            <TableCell>
                              <div className="font-medium">{query.id}</div>
                              <div className="max-w-[300px] truncate text-sm text-muted-foreground">{query.query}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{query.database}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{query.table}</TableCell>
                            <TableCell className="hidden md:table-cell">{query.rows}</TableCell>
                            <TableCell className="hidden md:table-cell">{query.latency}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedQuery(query.id)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
