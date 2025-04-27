"use client"

import Link from "next/link"
import { UserButton } from "@/components/user-button"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">|my-ai|</span>
          </Link>
          <div className="hidden md:flex">
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="font-medium transition-colors hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/dashboard/models" className="font-medium transition-colors hover:text-foreground/80">
                Models
              </Link>
              <Link href="/dashboard/tasks" className="font-medium transition-colors hover:text-foreground/80">
                Tasks
              </Link>
              <Link href="/dashboard/settings" className="font-medium transition-colors hover:text-foreground/80">
                Settings
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="mr-2">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <UserButton />
        </div>
      </div>
    </header>
  )
}
