"use client"

import { useState } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside
          className={cn(
            "fixed inset-y-0 z-30 flex w-[220px] flex-col border-r bg-background transition-transform lg:w-[280px]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-14 items-center border-b px-4">
            <span className="font-semibold">LLMs Analytics</span>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-3 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <DashboardNav />
          </div>
        </aside>
        <div className="flex w-full flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background px-4 md:hidden">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <span className="font-semibold">LLMs Analytics</span>
          </header>
          <main className="flex w-full flex-col overflow-hidden">
            <div className={cn("flex-1 space-y-4 p-4 md:p-8 pt-6", className)} {...props}>
              {children}
            </div>
          </main>
        </div>
      </div>
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
