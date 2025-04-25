"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, RefreshCw, Search } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface QueryResultsProps {
  results: any[] | null
  error: string | null
  isLoading: boolean
}

export function QueryResults({ results, error, isLoading }: QueryResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Mock results for demonstration
  const mockResults = [
    { id: 1, username: "john_doe", email: "john@example.com", created_at: "2025-01-15T10:30:00" },
    { id: 2, username: "jane_smith", email: "jane@example.com", created_at: "2025-01-22T14:45:00" },
    { id: 3, username: "bob_johnson", email: "bob@example.com", created_at: "2025-02-05T09:15:00" },
    { id: 4, username: "alice_williams", email: "alice@example.com", created_at: "2025-02-18T16:20:00" },
    { id: 5, username: "charlie_brown", email: "charlie@example.com", created_at: "2025-03-10T11:05:00" },
  ]

  // Use mock data if results is null
  const displayResults = results || mockResults

  // Filter results based on search term
  const filteredResults = displayResults.filter((row) => {
    return Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // Paginate results
  const paginatedResults = filteredResults.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const totalPages = Math.ceil(filteredResults.length / rowsPerPage)

  const exportToCSV = () => {
    if (!filteredResults.length) return

    const headers = Object.keys(filteredResults[0])
    const csvRows = [
      headers.join(","),
      ...filteredResults.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
    ]
    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `query-results-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Query Results</CardTitle>
          <CardDescription>Executing your query...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-center text-sm text-muted-foreground">Executing query, please wait...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Query Error</CardTitle>
          <CardDescription>There was an error executing your query</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Query Results</CardTitle>
            <CardDescription>
              {filteredResults.length} {filteredResults.length === 1 ? "row" : "rows"} returned
            </CardDescription>
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={!filteredResults.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number.parseInt(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredResults.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(filteredResults[0]).map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResults.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.entries(row).map(([key, value]) => (
                      <TableCell key={key}>
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-muted-foreground/50"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No results found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "No results match your search criteria" : "Execute a query to see results"}
            </p>
          </div>
        )}

        {filteredResults.length > 0 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <span className="flex h-9 w-9 items-center justify-center">...</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(totalPages)
                        }}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
