"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, BrainCircuit, Database, FileText, LineChart, PieChart, Plus, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

// Types
interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  query: string
  thumbnail: string
}

export function ReportTemplates() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const templates: ReportTemplate[] = [
    {
      id: "1",
      name: "LLM Usage by Model",
      description: "Shows usage statistics for different LLM models over time",
      category: "llm",
      tags: ["usage", "models", "performance"],
      query:
        "SELECT model_name, COUNT(*) as usage_count, AVG(response_time) as avg_response_time FROM llm_requests GROUP BY model_name ORDER BY usage_count DESC",
      thumbnail: "llm-usage-by-model.png",
    },
    {
      id: "2",
      name: "Database Query Performance",
      description: "Analyzes database query performance and identifies slow queries",
      category: "database",
      tags: ["performance", "optimization", "queries"],
      query:
        "SELECT query_text, execution_time, execution_count FROM query_logs WHERE execution_time > 1000 ORDER BY execution_time DESC",
      thumbnail: "db-query-performance.png",
    },
    {
      id: "3",
      name: "User Activity Dashboard",
      description: "Comprehensive view of user activity and engagement",
      category: "users",
      tags: ["activity", "engagement", "users"],
      query:
        "SELECT user_id, COUNT(*) as action_count, MAX(timestamp) as last_activity FROM user_actions GROUP BY user_id ORDER BY action_count DESC",
      thumbnail: "user-activity.png",
    },
    {
      id: "4",
      name: "LLM Token Usage Trends",
      description: "Tracks token usage trends over time for cost optimization",
      category: "llm",
      tags: ["tokens", "cost", "trends"],
      query:
        "SELECT DATE_TRUNC('day', timestamp) as day, SUM(prompt_tokens) as prompt_tokens, SUM(completion_tokens) as completion_tokens FROM llm_requests GROUP BY day ORDER BY day",
      thumbnail: "token-usage-trends.png",
    },
    {
      id: "5",
      name: "Database Table Growth",
      description: "Monitors the growth of database tables over time",
      category: "database",
      tags: ["storage", "growth", "tables"],
      query:
        "SELECT table_name, row_count, pg_size_pretty(total_bytes) as size FROM table_stats ORDER BY total_bytes DESC",
      thumbnail: "table-growth.png",
    },
    {
      id: "6",
      name: "LLM Error Analysis",
      description: "Analyzes errors and failures in LLM requests",
      category: "llm",
      tags: ["errors", "troubleshooting", "reliability"],
      query:
        "SELECT error_type, COUNT(*) as error_count, model_name FROM llm_requests WHERE status = 'error' GROUP BY error_type, model_name ORDER BY error_count DESC",
      thumbnail: "llm-error-analysis.png",
    },
    {
      id: "7",
      name: "Query Patterns by Hour",
      description: "Visualizes database query patterns throughout the day",
      category: "database",
      tags: ["patterns", "time-series", "optimization"],
      query:
        "SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as query_count FROM query_logs GROUP BY hour ORDER BY hour",
      thumbnail: "query-patterns-hour.png",
    },
    {
      id: "8",
      name: "User Retention Analysis",
      description: "Analyzes user retention and churn over time",
      category: "users",
      tags: ["retention", "churn", "engagement"],
      query:
        "WITH cohorts AS (...) SELECT cohort_month, month_number, COUNT(DISTINCT user_id) as active_users FROM cohorts GROUP BY cohort_month, month_number ORDER BY cohort_month, month_number",
      thumbnail: "user-retention.png",
    },
  ]

  const filteredTemplates = templates
    .filter((template) => activeTab === "all" || template.category === activeTab)
    .filter(
      (template) =>
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )

  const handleUseTemplate = (template: ReportTemplate) => {
    // In a real implementation, this would create a new report based on the template
    // For now, we'll just navigate to the create report page
    router.push("/dashboard/reports/create")
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "llm":
        return <BrainCircuit className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      case "users":
        return <Users className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="w-[250px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-2 py-0">
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(template.category)}
                    <span className="capitalize">{template.category}</span>
                  </div>
                </Badge>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                {template.category === "llm" && <LineChart className="h-12 w-12 text-muted-foreground" />}
                {template.category === "database" && <BarChart3 className="h-12 w-12 text-muted-foreground" />}
                {template.category === "users" && <PieChart className="h-12 w-12 text-muted-foreground" />}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleUseTemplate(template)}>
                <Plus className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}
