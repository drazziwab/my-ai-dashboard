"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus, RefreshCw, Table } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Spreadsheet {
  id: string
  name: string
  url: string
  lastModified: string
}

interface GoogleSheetsProps {
  isConnected: boolean
}

export function GoogleSheets({ isConnected }: GoogleSheetsProps) {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [newSheet, setNewSheet] = useState({
    title: "",
    rows: 20,
    columns: 10,
  })
  const [creatingSheet, setCreatingSheet] = useState(false)

  useEffect(() => {
    if (isConnected) {
      fetchSpreadsheets()
    }
  }, [isConnected])

  const fetchSpreadsheets = async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/google/sheets/list")

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSpreadsheets(data.spreadsheets || [])
        } else {
          setError(data.error || "Failed to fetch spreadsheets")
        }
      } else {
        setError("Failed to fetch spreadsheets")
      }
    } catch (error) {
      console.error("Error fetching spreadsheets:", error)
      setError("An error occurred while fetching spreadsheets")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSpreadsheet = async () => {
    if (!isConnected || !newSheet.title) return

    setCreatingSheet(true)
    setError(null)

    try {
      const response = await fetch("/api/google/sheets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newSheet.title,
          rows: newSheet.rows,
          columns: newSheet.columns,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Reset form and close dialog
          setNewSheet({
            title: "",
            rows: 20,
            columns: 10,
          })
          setShowCreateSheet(false)

          // Refresh spreadsheets
          fetchSpreadsheets()
        } else {
          setError(data.error || "Failed to create spreadsheet")
        }
      } else {
        setError("Failed to create spreadsheet")
      }
    } catch (error) {
      console.error("Error creating spreadsheet:", error)
      setError("An error occurred while creating the spreadsheet")
    } finally {
      setCreatingSheet(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Integration</CardTitle>
          <CardDescription>Connect your Google Sheets to create and manage spreadsheets</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              You need to connect your Google Sheets first. Go to the Overview tab and connect Sheets.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Sheets</CardTitle>
              <CardDescription>Create and manage your Google Sheets</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSpreadsheets} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={showCreateSheet} onOpenChange={setShowCreateSheet}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Spreadsheet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Spreadsheet</DialogTitle>
                    <DialogDescription>Create a new Google Sheet with specified dimensions</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="sheet-title">Spreadsheet Title</Label>
                      <Input
                        id="sheet-title"
                        value={newSheet.title}
                        onChange={(e) => setNewSheet({ ...newSheet, title: e.target.value })}
                        placeholder="Sales Data 2025"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sheet-rows">Rows</Label>
                        <Input
                          id="sheet-rows"
                          type="number"
                          min="1"
                          max="1000"
                          value={newSheet.rows}
                          onChange={(e) => setNewSheet({ ...newSheet, rows: Number.parseInt(e.target.value) || 20 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sheet-columns">Columns</Label>
                        <Input
                          id="sheet-columns"
                          type="number"
                          min="1"
                          max="26"
                          value={newSheet.columns}
                          onChange={(e) => setNewSheet({ ...newSheet, columns: Number.parseInt(e.target.value) || 10 })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateSheet(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSpreadsheet} disabled={creatingSheet || !newSheet.title}>
                      {creatingSheet ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Spreadsheet"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : spreadsheets.length > 0 ? (
            <div className="space-y-2">
              {spreadsheets.map((sheet) => (
                <Card key={sheet.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Table className="h-5 w-5 mr-2 text-green-500" />
                        <div>
                          <a
                            href={sheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {sheet.name}
                          </a>
                          <div className="text-xs text-muted-foreground">Last modified: {sheet.lastModified}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={sheet.url} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No spreadsheets found. Try refreshing or creating a new spreadsheet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
