"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Table, Plus } from "lucide-react"

interface GoogleSheetsProps {
  userEmail: string
}

export function GoogleSheets({ userEmail }: GoogleSheetsProps) {
  const [loading, setLoading] = useState(true)
  const [spreadsheets, setSpreadsheets] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null)

  useEffect(() => {
    fetchSpreadsheets()
  }, [])

  const fetchSpreadsheets = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch spreadsheets from the Google Sheets API
      // For now, we'll just simulate it with mock data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockSpreadsheets = [
        {
          id: "sheet-1",
          name: "Budget 2025",
          lastModified: "2025-04-24T14:32:12.000Z",
          url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT",
        },
        {
          id: "sheet-2",
          name: "Project Timeline",
          lastModified: "2025-04-22T12:18:45.000Z",
          url: "https://docs.google.com/spreadsheets/d/e/2PACX-2vT",
        },
        {
          id: "sheet-3",
          name: "Sales Data Q1 2025",
          lastModified: "2025-04-15T10:05:32.000Z",
          url: "https://docs.google.com/spreadsheets/d/e/2PACX-3vT",
        },
        {
          id: "sheet-4",
          name: "Team Performance Metrics",
          lastModified: "2025-04-10T16:45:22.000Z",
          url: "https://docs.google.com/spreadsheets/d/e/2PACX-4vT",
        },
        {
          id: "sheet-5",
          name: "Inventory Tracking",
          lastModified: "2025-03-28T14:12:08.000Z",
          url: "https://docs.google.com/spreadsheets/d/e/2PACX-5vT",
        },
      ]

      setSpreadsheets(mockSpreadsheets)
    } catch (error) {
      console.error("Error fetching spreadsheets:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter spreadsheets based on search term
  const filteredSpreadsheets = spreadsheets.filter((sheet) =>
    sheet.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spreadsheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" onClick={fetchSpreadsheets} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Spreadsheet
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filteredSpreadsheets.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No spreadsheets found</p>
              </div>
            ) : (
              filteredSpreadsheets.map((sheet) => (
                <Card
                  key={sheet.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedSheet(sheet.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Table className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="font-medium">{sheet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Last modified: {new Date(sheet.lastModified).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <iframe
            src="https://docs.google.com/spreadsheets/d/e/2PACX-1vT/preview"
            width="100%"
            height="500"
            frameBorder="0"
            title="Google Sheets Embed"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  )
}
