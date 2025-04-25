"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { DatabaseSettings } from "@/components/settings/database-settings"
import { LlmSettings } from "@/components/settings/llm-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("appearance")

  return (
    <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="database">Database</TabsTrigger>
        <TabsTrigger value="llm">LLM Models</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="appearance">
        <ThemeSelector />
      </TabsContent>
      <TabsContent value="database">
        <DatabaseSettings />
      </TabsContent>
      <TabsContent value="llm">
        <LlmSettings />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>
    </Tabs>
  )
}
