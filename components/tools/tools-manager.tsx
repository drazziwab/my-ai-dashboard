"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FolderOpen, Plus } from "lucide-react"
import { ToolCard } from "@/components/tools/tool-card"
import { ToolExecution as ToolExecutionComponent } from "@/components/tools/tool-execution"

// Types
interface Tool {
  id: string
  name: string
  description: string
  script: string
  category: string
  lastRun?: Date
  createdAt: Date
  updatedAt: Date
}

interface ToolExecution {
  id: string
  toolId: string
  toolName: string
  status: "running" | "completed" | "failed"
  output: string
  startTime: Date
  endTime?: Date
  error?: string
}

export function ToolsManager() {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "1",
      name: "Database Backup",
      description: "Creates a backup of the MSSQL database",
      script: `
// This is a sample script for database backup
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
  try {
    // Connect to database
    await sql.connect({
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        trustServerCertificate: true
      }
    });
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = \`backup_\${process.env.DB_NAME}_\${timestamp}.bak\`;
    const backupPath = path.join('C:\\Backups', backupFileName);
    
    // Execute backup query
    const query = \`
      BACKUP DATABASE [${process.env.DB_NAME}]
      TO DISK = N'\${backupPath}'
      WITH NOFORMAT, NOINIT, NAME = N'${process.env.DB_NAME} Backup', 
      SKIP, NOREWIND, NOUNLOAD, STATS = 10
    \`;
    
    console.log(\`Starting backup to \${backupPath}...\`);
    await sql.query(query);
    
    console.log('Backup completed successfully!');
    return { success: true, message: \`Backup created at \${backupPath}\` };
  } catch (err) {
    console.error('Backup failed:', err);
    return { success: false, error: err.message };
  } finally {
    // Close the connection
    await sql.close();
  }
}

// Execute the backup
backupDatabase();
      `,
      category: "database",
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "LLM Model Status",
      description: "Checks the status of all installed LLM models",
      script: `
// This is a sample script to check LLM model status
const fetch = require('node-fetch');

async function checkModels() {
  try {
    console.log('Checking Ollama models...');
    
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    
    if (!data.models) {
      throw new Error('No models found in response');
    }
    
    console.log(\`Found \${data.models.length} models:\`);
    
    // Calculate total size
    let totalSize = 0;
    data.models.forEach(model => {
      totalSize += model.size;
    });
    
    // Format size in GB
    const formatSize = (bytes) => {
      return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    };
    
    // Display model details in a table
    console.table(data.models.map(model => ({
      name: model.name,
      size: formatSize(model.size),
      modified: new Date(model.modified).toLocaleString()
    })));
    
    console.log(\`Total storage used: \${formatSize(totalSize)}\`);
    
    return { 
      success: true, 
      models: data.models,
      totalSize: formatSize(totalSize)
    };
  } catch (err) {
    console.error('Error checking models:', err);
    return { success: false, error: err.message };
  }
}

// Execute the check
checkModels();
      `,
      category: "llm",
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ])

  const [executions, setExecutions] = useState<ToolExecution[]>([
    {
      id: "1",
      toolId: "1",
      toolName: "Database Backup",
      status: "completed",
      output: "Backup completed successfully!\nBackup created at C:\\Backups\\backup_master_2023-04-15-12-30-45.bak",
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45 * 1000),
    },
    {
      id: "2",
      toolId: "2",
      toolName: "LLM Model Status",
      status: "completed",
      output:
        "Found 5 models:\n┌─────────┬──────────┬────────┬─────────────────────────┐\n│ (index) │   name    │  size   │        modified         │\n├─────────┼──────────┼────────┼─────────────────────────┤\n│    0    │ 'llama3' │ '4.2 GB' │ '4/15/2023, 10:30:45 AM' │\n│    1    │ 'mistral' │ '4.1 GB' │ '4/10/2023, 9:15:22 AM'  │\n│    2    │ 'phi3'    │ '1.8 GB' │ '4/12/2023, 3:45:12 PM'  │\n│    3    │ 'gemma:2b'│ '1.2 GB' │ '4/8/2023, 11:20:33 AM'  │\n│    4    │ 'codellama'│ '3.9 GB' │ '4/5/2023, 2:10:18 PM'   │\n└─────────┴──────────┴────────┴─────────────────────────┘\nTotal storage used: 15.20 GB",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 1000),
    },
  ])

  const [activeTab, setActiveTab] = useState("all")
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newTool, setNewTool] = useState<Omit<Tool, "id" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    script: "",
    category: "general",
  })

  const handleCreateTool = () => {
    const tool: Tool = {
      ...newTool,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setTools((prev) => [...prev, tool])
    setIsCreating(false)
    setNewTool({
      name: "",
      description: "",
      script: "",
      category: "general",
    })
  }

  const handleUpdateTool = (updatedTool: Tool) => {
    setTools((prev) =>
      prev.map((tool) => (tool.id === updatedTool.id ? { ...updatedTool, updatedAt: new Date() } : tool)),
    )
    setSelectedTool(null)
  }

  const handleDeleteTool = (id: string) => {
    setTools((prev) => prev.filter((tool) => tool.id !== id))
    if (selectedTool?.id === id) {
      setSelectedTool(null)
    }
  }

  const handleRunTool = (tool: Tool) => {
    // Create a new execution
    const execution: ToolExecution = {
      id: Date.now().toString(),
      toolId: tool.id,
      toolName: tool.name,
      status: "running",
      output: "Running script...",
      startTime: new Date(),
    }

    setExecutions((prev) => [execution, ...prev])

    // Simulate script execution
    setTimeout(() => {
      setExecutions((prev) =>
        prev.map((exec) =>
          exec.id === execution.id
            ? {
                ...exec,
                status: "completed",
                output:
                  tool.id === "1"
                    ? "Backup completed successfully!\nBackup created at C:\\Backups\\backup_master_" +
                      new Date().toISOString().replace(/[:.]/g, "-") +
                      ".bak"
                    : "Found 5 models:\n┌─────────┬──────────┬────────┬─────────────────────────┐\n│ (index) │   name    │  size   │        modified         │\n├─────────┼──────────┼────────┼─────────────────────────┤\n│    0    │ 'llama3' │ '4.2 GB' │ '" +
                      new Date().toLocaleString() +
                      "' │\n│    1    │ 'mistral' │ '4.1 GB' │ '4/10/2023, 9:15:22 AM'  │\n│    2    │ 'phi3'    │ '1.8 GB' │ '4/12/2023, 3:45:12 PM'  │\n│    3    │ 'gemma:2b'│ '1.2 GB' │ '4/8/2023, 11:20:33 AM'  │\n│    4    │ 'codellama'│ '3.9 GB' │ '4/5/2023, 2:10:18 PM'   │\n└─────────┴──────────┴────────┴─────────────────────────┘\nTotal storage used: 15.20 GB",
                endTime: new Date(),
              }
            : exec,
        ),
      )

      // Update the tool's lastRun
      setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, lastRun: new Date() } : t)))
    }, 3000)
  }

  const filteredTools = activeTab === "all" ? tools : tools.filter((tool) => tool.category === activeTab)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Tools</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px]">
              <DialogHeader>
                <DialogTitle>Create New Tool</DialogTitle>
                <DialogDescription>Create a custom script to automate tasks and processes.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={newTool.category}
                    onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="general">General</option>
                    <option value="database">Database</option>
                    <option value="llm">LLM</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newTool.description}
                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Label htmlFor="script" className="text-right pt-2">
                    Script
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">JavaScript</Badge>
                        <Badge variant="outline">Node.js</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                    </div>
                    <Textarea
                      id="script"
                      value={newTool.script}
                      onChange={(e) => setNewTool({ ...newTool, script: e.target.value })}
                      className="font-mono min-h-[300px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Write JavaScript code that will be executed by Node.js. You can use environment variables and npm
                      packages.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTool} disabled={!newTool.name || !newTool.script}>
                  Create Tool
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={() => setSelectedTool(tool)}
                onRun={() => handleRunTool(tool)}
                onDelete={() => handleDeleteTool(tool.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={() => setSelectedTool(tool)}
                onRun={() => handleRunTool(tool)}
                onDelete={() => handleDeleteTool(tool.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="llm" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={() => setSelectedTool(tool)}
                onRun={() => handleRunTool(tool)}
                onDelete={() => handleDeleteTool(tool.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={() => setSelectedTool(tool)}
                onRun={() => handleRunTool(tool)}
                onDelete={() => handleDeleteTool(tool.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedTool && (
        <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle>Edit Tool: {selectedTool.name}</DialogTitle>
              <DialogDescription>Update your tool configuration and script.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={selectedTool.name}
                  onChange={(e) => setSelectedTool({ ...selectedTool, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <select
                  id="edit-category"
                  value={selectedTool.category}
                  onChange={(e) => setSelectedTool({ ...selectedTool, category: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="general">General</option>
                  <option value="database">Database</option>
                  <option value="llm">LLM</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={selectedTool.description}
                  onChange={(e) => setSelectedTool({ ...selectedTool, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="edit-script" className="text-right pt-2">
                  Script
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">JavaScript</Badge>
                      <Badge variant="outline">Node.js</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                  <Textarea
                    id="edit-script"
                    value={selectedTool.script}
                    onChange={(e) => setSelectedTool({ ...selectedTool, script: e.target.value })}
                    className="font-mono min-h-[300px]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTool(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateTool(selectedTool)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Separator className="my-4" />

      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent tool executions and their results</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {executions.map((execution) => (
                <ToolExecutionComponent key={execution.id} execution={execution} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
