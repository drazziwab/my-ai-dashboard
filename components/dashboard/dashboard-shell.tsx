"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure hydration is complete before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b bg-background md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <span className="ml-3 font-semibold">|my-ai|</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Sidebar - always visible on desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[240px] border-r bg-background transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className="font-semibold">|my-ai|</span>
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">
          <DashboardNav />
        </div>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 hidden w-full border-t p-4 md:flex md:items-center md:justify-between">
          <ThemeToggle />
          <UserNav />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className={cn("container mx-auto p-4 md:p-6 lg:p-8", className)} {...props}>
          {children}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
