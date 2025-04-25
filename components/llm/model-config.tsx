"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, X } from "lucide-react"

interface ModelConfigProps {
  modelName: string
  onClose: () => void
  ollamaUrl: string
}

export function ModelConfig({ modelName, onClose, ollamaUrl }: ModelConfigProps) {
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxTokens: 2048,
    systemPrompt: "You are a helpful AI assistant.",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<null | { success: boolean; message: string }>(null)

  // Fetch model configuration on mount
  useEffect(() => {
    const fetchModelConfig = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch the model's configuration
        // For this example, we'll just simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock configuration
        setModelConfig({
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxTokens: 2048,
          systemPrompt: "You are a helpful AI assistant.",
        })
      } catch (error) {
        console.error("Error fetching model configuration:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModelConfig()
  }, [modelName])

  const saveModelConfig = async () => {
    try {
      const response = await fetch("/api/llm/save-model-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: ollamaUrl,
          model: modelName,
          config: modelConfig,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus({
          success: true,
          message: "Model configuration saved successfully",
        })
      } else {
        setSaveStatus({
          success: false,
          message: `Failed to save configuration: ${data.error}`,
        })
      }
    } catch (error) {
      setSaveStatus({
        success: false,
        message: `Failed to save configuration: ${(error as Error).message}`,
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Configure Model: {modelName}</CardTitle>
          <CardDescription>Adjust parameters and behavior for this model</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature: {modelConfig.temperature}</Label>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[modelConfig.temperature]}
                onValueChange={(value) => setModelConfig({ ...modelConfig, temperature: value[0] })}
              />
              <p className="text-xs text-muted-foreground">
                Controls randomness: Lower values are more deterministic, higher values are more creative.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="topP">Top P: {modelConfig.topP}</Label>
              </div>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.05}
                value={[modelConfig.topP]}
                onValueChange={(value) => setModelConfig({ ...modelConfig, topP: value[0] })}
              />
              <p className="text-xs text-muted-foreground">
                Controls diversity via nucleus sampling: 0.9 considers the top 90% of probability mass.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="topK">Top K: {modelConfig.topK}</Label>
              </div>
              <Slider
                id="topK"
                min={1}
                max={100}
                step={1}
                value={[modelConfig.topK]}
                onValueChange={(value) => setModelConfig({ ...modelConfig, topK: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Limits vocabulary to K most likely tokens at each step.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxTokens">Max Tokens: {modelConfig.maxTokens}</Label>
              </div>
              <Slider
                id="maxTokens"
                min={10}
                max={4096}
                step={1}
                value={[modelConfig.maxTokens]}
                onValueChange={(value) => setModelConfig({ ...modelConfig, maxTokens: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Maximum number of tokens to generate in the response.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                placeholder="You are a helpful AI assistant."
                value={modelConfig.systemPrompt}
                onChange={(e) => setModelConfig({ ...modelConfig, systemPrompt: e.target.value })}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Instructions that define the behavior and capabilities of the model.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex-1">
          {saveStatus && (
            <Alert variant={saveStatus.success ? "default" : "destructive"} className="mr-4">
              {saveStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{saveStatus.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{saveStatus.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveModelConfig}>Save Configuration</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
