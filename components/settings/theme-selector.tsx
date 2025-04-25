"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Check, Moon, Sun } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"

// Define theme types
type ThemeColor = {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  displayName: string
}

const colorThemes: ThemeColor[] = [
  {
    name: "blue",
    displayName: "Blue",
    primary: "hsl(221.2 83.2% 53.3%)",
    secondary: "hsl(215 27.9% 16.9%)",
    accent: "hsl(210 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
  {
    name: "purple",
    displayName: "Purple",
    primary: "hsl(262.1 83.3% 57.8%)",
    secondary: "hsl(263 50% 30%)",
    accent: "hsl(264 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
  {
    name: "green",
    displayName: "Green",
    primary: "hsl(142.1 76.2% 36.3%)",
    secondary: "hsl(142 71% 45%)",
    accent: "hsl(140 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
  {
    name: "orange",
    displayName: "Orange",
    primary: "hsl(24.6 95% 53.1%)",
    secondary: "hsl(20 84% 38%)",
    accent: "hsl(30 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
  {
    name: "red",
    displayName: "Red",
    primary: "hsl(0 72.2% 50.6%)",
    secondary: "hsl(0 84% 60%)",
    accent: "hsl(0 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
  {
    name: "teal",
    displayName: "Teal",
    primary: "hsl(168 76.2% 36.3%)",
    secondary: "hsl(168 71% 45%)",
    accent: "hsl(166 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
  {
    name: "indigo",
    displayName: "Indigo",
    primary: "hsl(243.4 75.4% 58.6%)",
    secondary: "hsl(243 75% 59%)",
    accent: "hsl(244 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
  {
    name: "pink",
    displayName: "Pink",
    primary: "hsl(330 81.2% 60.6%)",
    secondary: "hsl(330 84% 65%)",
    accent: "hsl(330 40% 96.1%)",
    background: "hsl(0 0% 100%)",
  },
]

type UITheme = {
  name: string
  displayName: string
  borderRadius: string
  cardStyle: string
  buttonStyle: string
}

const uiThemes: UITheme[] = [
  {
    name: "default",
    displayName: "Default",
    borderRadius: "0.5rem",
    cardStyle: "shadow",
    buttonStyle: "default",
  },
  {
    name: "minimal",
    displayName: "Minimal",
    borderRadius: "0.25rem",
    cardStyle: "flat",
    buttonStyle: "minimal",
  },
  {
    name: "rounded",
    displayName: "Rounded",
    borderRadius: "1rem",
    cardStyle: "shadow",
    buttonStyle: "rounded",
  },
  {
    name: "glassmorphism",
    displayName: "Glassmorphism",
    borderRadius: "0.75rem",
    cardStyle: "glass",
    buttonStyle: "glass",
  },
  {
    name: "neumorphism",
    displayName: "Neumorphism",
    borderRadius: "0.5rem",
    cardStyle: "neumorphic",
    buttonStyle: "neumorphic",
  },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = useState("blue")
  const [uiTheme, setUITheme] = useState("default")
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)

    // Load saved preferences
    const savedColorTheme = localStorage.getItem("colorTheme") || "blue"
    const savedUITheme = localStorage.getItem("uiTheme") || "default"

    setColorTheme(savedColorTheme)
    setUITheme(savedUITheme)
  }, [])

  // Avoid hydration mismatch
  if (!mounted) {
    return null
  }

  const handleColorThemeChange = (themeName: string) => {
    setColorTheme(themeName)
    localStorage.setItem("colorTheme", themeName)
    // In a real app, this would apply CSS variables
    document.documentElement.style.setProperty("--theme-color", themeName)
  }

  const handleUIThemeChange = (themeName: string) => {
    setUITheme(themeName)
    localStorage.setItem("uiTheme", themeName)
    // In a real app, this would apply CSS variables
    document.documentElement.style.setProperty("--ui-theme", themeName)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
          <CardDescription>Customize how your dashboard looks and feels</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="color">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="color">Color Theme</TabsTrigger>
              <TabsTrigger value="ui">UI Style</TabsTrigger>
              <TabsTrigger value="mode">Display Mode</TabsTrigger>
            </TabsList>

            <TabsContent value="color" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {colorThemes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`relative cursor-pointer overflow-hidden rounded-md border p-4 transition-all hover:shadow-md ${
                      colorTheme === theme.name ? "border-primary ring-2 ring-primary" : "border-border"
                    }`}
                    onClick={() => handleColorThemeChange(theme.name)}
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="h-10 w-full rounded-md" style={{ backgroundColor: theme.primary }} />
                      <div className="h-3 w-full rounded-sm" style={{ backgroundColor: theme.secondary }} />
                      <div className="h-3 w-full rounded-sm" style={{ backgroundColor: theme.accent }} />
                    </div>
                    <div className="mt-2 text-center text-xs font-medium">{theme.displayName}</div>
                    {colorTheme === theme.name && (
                      <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ui" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
                {uiThemes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`relative cursor-pointer overflow-hidden rounded-md border p-4 transition-all hover:shadow-md ${
                      uiTheme === theme.name ? "border-primary ring-2 ring-primary" : "border-border"
                    }`}
                    onClick={() => handleUIThemeChange(theme.name)}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {/* UI Theme Preview */}
                      <div
                        className={`h-24 w-full rounded-${theme.name === "rounded" ? "xl" : "md"} bg-muted p-2 ${
                          theme.cardStyle === "shadow"
                            ? "shadow-md"
                            : theme.cardStyle === "glass"
                              ? "bg-opacity-50 backdrop-blur-sm"
                              : theme.cardStyle === "neumorphic"
                                ? "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.8)]"
                                : ""
                        }`}
                      >
                        <div className="h-4 w-3/4 rounded-sm bg-muted-foreground/30" />
                        <div className="mt-2 h-2 w-1/2 rounded-sm bg-muted-foreground/20" />
                        <div className="mt-auto flex justify-end">
                          <div
                            className={`h-6 w-16 rounded-${theme.name === "rounded" ? "full" : "md"} bg-primary ${
                              theme.buttonStyle === "minimal"
                                ? "bg-opacity-90"
                                : theme.buttonStyle === "glass"
                                  ? "bg-opacity-70 backdrop-blur-sm"
                                  : theme.buttonStyle === "neumorphic"
                                    ? "shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,0.8)]"
                                    : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center text-xs font-medium">{theme.displayName}</div>
                    {uiTheme === theme.name && (
                      <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mode" className="space-y-4 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {theme === "dark" ? (
                        <Moon className="h-6 w-6 text-primary" />
                      ) : (
                        <Sun className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">
                        {theme === "dark" ? "Currently enabled" : "Currently disabled"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? "dark" : "light")
                    }}
                  />
                </div>

                <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-2 gap-4">
                  <Label
                    htmlFor="light"
                    className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                      theme === "light" ? "border-primary" : ""
                    }`}
                  >
                    <RadioGroupItem value="light" id="light" className="sr-only" />
                    <div className="mb-3 h-24 w-full rounded-md bg-[#FFFFFF] shadow-sm">
                      <div className="m-2 h-3 w-1/2 rounded-sm bg-slate-200" />
                      <div className="m-2 h-3 w-3/4 rounded-sm bg-slate-200" />
                      <div className="m-2 h-3 w-1/3 rounded-sm bg-slate-200" />
                    </div>
                    <div className="text-center font-medium">Light</div>
                  </Label>
                  <Label
                    htmlFor="dark"
                    className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                      theme === "dark" ? "border-primary" : ""
                    }`}
                  >
                    <RadioGroupItem value="dark" id="dark" className="sr-only" />
                    <div className="mb-3 h-24 w-full rounded-md bg-[#1F2937] shadow-sm">
                      <div className="m-2 h-3 w-1/2 rounded-sm bg-slate-600" />
                      <div className="m-2 h-3 w-3/4 rounded-sm bg-slate-600" />
                      <div className="m-2 h-3 w-1/3 rounded-sm bg-slate-600" />
                    </div>
                    <div className="text-center font-medium">Dark</div>
                  </Label>
                </RadioGroup>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">System Preference</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically switch between light and dark themes based on your system preferences.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={() => setTheme("system")}>
                    Use System Theme
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chart Colors</CardTitle>
          <CardDescription>Customize the colors used in charts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <Label className="mb-2 block">Primary</Label>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-md bg-[hsl(var(--chart-1))]" />
                  <input type="color" defaultValue="#0088FE" className="h-10 w-full" />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Secondary</Label>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-md bg-[hsl(var(--chart-2))]" />
                  <input type="color" defaultValue="#00C49F" className="h-10 w-full" />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Tertiary</Label>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-md bg-[hsl(var(--chart-3))]" />
                  <input type="color" defaultValue="#FFBB28" className="h-10 w-full" />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Quaternary</Label>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-md bg-[hsl(var(--chart-4))]" />
                  <input type="color" defaultValue="#FF8042" className="h-10 w-full" />
                </div>
              </div>
            </div>
            <Button className="mt-4">Save Chart Colors</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
