import Link from "next/link"
import { Brain } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Brain className="h-6 w-6" />
        <span>LLMs Analytics</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  )
}
