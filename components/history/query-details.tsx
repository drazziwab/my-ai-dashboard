"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Tag, User } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface QueryDetailsProps {
  query: {
    id: string
    query: string
    type: string
    status: string
    timestamp: string
    user: string
    tags: string[]
    [key: string]: any
  }
}

export function QueryDetails({ query }: QueryDetailsProps) {
  // Sample performance data
  const performanceData = [
    { name: "Parsing", value: 12 },
    { name: "Execution", value: query.type === "llm" ? 380 : 28 },
    { name: "Processing", value: 25 },
    { name: "Response", value: 15 },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                Query Details
                <Badge variant={query.status === "success" ? "default" : "destructive"}>{query.status}</Badge>
              </CardTitle>
              <CardDescription>ID: {query.id}</CardDescription>
            </div>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                {query.timestamp}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-1 h-4 w-4" />
                {query.user}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Query</h3>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{query.query}</pre>
            </div>

            <div className="flex flex-wrap gap-2">
              {query.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                {query.type === "llm" && <TabsTrigger value="response">Response</TabsTrigger>}
                {query.type === "database" && <TabsTrigger value="results">Results</TabsTrigger>}
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {query.type === "llm" ? (
                    <>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium">Model</div>
                        <div className="mt-1 text-2xl font-bold">{query.model}</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium">Tokens</div>
                        <div className="mt-1 text-2xl font-bold">{query.tokens}</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium">Latency</div>
                        <div className="mt-1 text-2xl font-bold">{query.latency}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium">Database</div>
                        <div className="mt-1 text-2xl font-bold">{query.database}</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium">Table</div>
                        <div className="mt-1 text-2xl font-bold">{query.table}</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium">Rows</div>
                        <div className="mt-1 text-2xl font-bold">{query.rows}</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium">Latency</div>
                        <div className="mt-1 text-2xl font-bold">{query.latency}</div>
                      </div>
                    </>
                  )}
                </div>

                {query.status === "error" && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="text-sm font-medium text-destructive">Error</div>
                    <div className="mt-1 text-sm">{query.error}</div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="performance" className="pt-4">
                <ChartContainer
                  config={{
                    value: {
                      label: "Time (ms)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ChartContainer>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {performanceData.map((item) => (
                    <div key={item.name} className="rounded-lg border p-4">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="mt-1 text-xl font-bold">{item.value}ms</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {query.type === "llm" && (
                <TabsContent value="response" className="pt-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 text-sm font-medium">Response</h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {query.id === "q-1001"
                        ? "The latest sales figures for Q1 2025 show a 12.5% increase compared to Q4 2024, with total revenue reaching $24.8 million. The strongest performing product categories were AI Solutions (+18.2%) and Cloud Services (+15.7%), while Hardware saw a modest growth of 5.3%. North America remains the strongest market with 45% of total sales, followed by Europe (30%) and Asia-Pacific (20%)."
                        : query.id === "q-1003"
                          ? "Executive Summary: Q1 2025\n\nFinancial Performance:\n- Revenue: $24.8M (↑12.5% QoQ, ↑18.7% YoY)\n- Gross Margin: 68.2% (↑2.1% QoQ)\n- Operating Expenses: $12.3M (↑5.2% QoQ)\n- Net Income: $4.9M (↑22.5% QoQ, ↑35.2% YoY)\n- Cash Reserves: $42.3M\n\nKey Highlights:\n- AI Solutions division exceeded targets by 15%\n- New enterprise clients: 12 (↑33% QoQ)\n- Customer retention rate: 94.8%\n- Successfully launched 3 new product features\n\nStrategic Outlook:\n- On track to meet annual growth targets\n- Planned expansion into APAC region in Q3\n- R&D investments increased by 18% for next-gen AI capabilities"
                          : query.id === "q-1005"
                            ? "Spring Collection Product Descriptions:\n\n1. Cloud Comfort Hoodie\nEmbrace the changing seasons with our Cloud Comfort Hoodie, crafted from sustainable bamboo-cotton blend fabric. This lightweight yet cozy hoodie features breathable material perfect for spring evenings, with minimalist design elements and our signature hidden pocket for your essentials. Available in four nature-inspired colors: Misty Morning, Spring Leaf, Sunset Coral, and Ocean Blue.\n\n2. Eco-Trek Hiking Shoes\nHit the spring trails with confidence in our Eco-Trek Hiking Shoes. Designed with recycled materials and natural rubber soles, these lightweight hikers offer superior grip on varied terrain while maintaining breathability for warmer days. The responsive cushioning adapts to your stride, while the quick-dry mesh upper keeps you comfortable through creek crossings and spring showers.\n\n3. Blossom Weekender Bag\nOur Blossom Weekender Bag combines style and functionality for your spring getaways. Crafted from water-resistant waxed canvas with vegan leather accents, this spacious bag features smart organization with dedicated laptop sleeve, shoe compartment, and multiple pockets. The adjustable shoulder strap and reinforced handles offer versatile carrying options for weekend adventures or daily commutes."
                            : query.id === "q-1007"
                              ? "[ERROR: Model timeout after 30 seconds]"
                              : query.id === "q-1009"
                                ? "[Translated content in Spanish, French, and German - output truncated due to length]"
                                : "Sample response text for this query would appear here."}
                    </div>
                  </div>
                </TabsContent>
              )}

              {query.type === "database" && (
                <TabsContent value="results" className="pt-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 text-sm font-medium">Query Results</h3>
                    <div className="overflow-auto">
                      {query.id === "q-1002" ? (
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">id</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">email</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                                signup_date
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            <tr>
                              <td className="px-4 py-2 text-sm">1001</td>
                              <td className="px-4 py-2 text-sm">John Smith</td>
                              <td className="px-4 py-2 text-sm">john.smith@example.com</td>
                              <td className="px-4 py-2 text-sm">2025-01-15</td>
                              <td className="px-4 py-2 text-sm">active</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">1002</td>
                              <td className="px-4 py-2 text-sm">Jane Doe</td>
                              <td className="px-4 py-2 text-sm">jane.doe@example.com</td>
                              <td className="px-4 py-2 text-sm">2025-01-22</td>
                              <td className="px-4 py-2 text-sm">active</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">1003</td>
                              <td className="px-4 py-2 text-sm">Robert Johnson</td>
                              <td className="px-4 py-2 text-sm">robert.j@example.com</td>
                              <td className="px-4 py-2 text-sm">2025-02-05</td>
                              <td className="px-4 py-2 text-sm">active</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">1004</td>
                              <td className="px-4 py-2 text-sm">Emily Wilson</td>
                              <td className="px-4 py-2 text-sm">emily.w@example.com</td>
                              <td className="px-4 py-2 text-sm">2025-03-12</td>
                              <td className="px-4 py-2 text-sm">active</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">1005</td>
                              <td className="px-4 py-2 text-sm">Michael Brown</td>
                              <td className="px-4 py-2 text-sm">michael.b@example.com</td>
                              <td className="px-4 py-2 text-sm">2025-03-28</td>
                              <td className="px-4 py-2 text-sm">active</td>
                            </tr>
                          </tbody>
                        </table>
                      ) : query.id === "q-1004" ? (
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">model</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                                avg_response_time
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            <tr>
                              <td className="px-4 py-2 text-sm">GPT-4o</td>
                              <td className="px-4 py-2 text-sm">245.32 ms</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Claude 3</td>
                              <td className="px-4 py-2 text-sm">312.18 ms</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Llama 3</td>
                              <td className="px-4 py-2 text-sm">178.45 ms</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Mistral</td>
                              <td className="px-4 py-2 text-sm">201.87 ms</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Gemini</td>
                              <td className="px-4 py-2 text-sm">267.92 ms</td>
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-sm text-muted-foreground">Query results would be displayed here.</div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
