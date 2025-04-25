import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LlmMetrics } from "@/components/dashboard/llm-metrics"
import { RecentQueries } from "@/components/dashboard/recent-queries"

export default function LlmAnalyticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="LLM Analytics" text="Detailed metrics and performance data for your LLM usage." />
      <div className="grid gap-4 md:gap-8">
        <LlmMetrics className="w-full" />

        <Card>
          <CardHeader>
            <CardTitle>Model Performance Comparison</CardTitle>
            <CardDescription>Compare metrics across different LLM models</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gpt4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gpt4">GPT-4o</TabsTrigger>
                <TabsTrigger value="claude">Claude 3</TabsTrigger>
                <TabsTrigger value="llama">Llama 3</TabsTrigger>
              </TabsList>
              <TabsContent value="gpt4" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <h3 className="text-lg font-medium">Average Response Time</h3>
                    <p className="text-3xl font-bold">245ms</p>
                    <p className="text-sm text-muted-foreground">-12% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Token Efficiency</h3>
                    <p className="text-3xl font-bold">0.87</p>
                    <p className="text-sm text-muted-foreground">+5% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Error Rate</h3>
                    <p className="text-3xl font-bold">0.12%</p>
                    <p className="text-sm text-muted-foreground">-2% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Usage Share</h3>
                    <p className="text-3xl font-bold">68%</p>
                    <p className="text-sm text-muted-foreground">+8% from last week</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="claude" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <h3 className="text-lg font-medium">Average Response Time</h3>
                    <p className="text-3xl font-bold">312ms</p>
                    <p className="text-sm text-muted-foreground">-5% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Token Efficiency</h3>
                    <p className="text-3xl font-bold">0.92</p>
                    <p className="text-sm text-muted-foreground">+3% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Error Rate</h3>
                    <p className="text-3xl font-bold">0.08%</p>
                    <p className="text-sm text-muted-foreground">-4% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Usage Share</h3>
                    <p className="text-3xl font-bold">24%</p>
                    <p className="text-sm text-muted-foreground">+2% from last week</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="llama" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <h3 className="text-lg font-medium">Average Response Time</h3>
                    <p className="text-3xl font-bold">178ms</p>
                    <p className="text-sm text-muted-foreground">-18% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Token Efficiency</h3>
                    <p className="text-3xl font-bold">0.79</p>
                    <p className="text-sm text-muted-foreground">+1% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Error Rate</h3>
                    <p className="text-3xl font-bold">0.22%</p>
                    <p className="text-sm text-muted-foreground">-1% from last week</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Usage Share</h3>
                    <p className="text-3xl font-bold">8%</p>
                    <p className="text-sm text-muted-foreground">+3% from last week</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <RecentQueries />
      </div>
    </DashboardShell>
  )
}
