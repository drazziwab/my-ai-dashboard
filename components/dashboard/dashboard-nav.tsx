"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Brain,
  Database,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Wrench,
  BookOpen,
  CheckSquare,
  Mail,
} from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "LLM Analytics",
      href: "/dashboard/llm",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      title: "Database",
      href: "/dashboard/database",
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Query History",
      href: "/dashboard/history",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: "Chat",
      href: "/dashboard/chat",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      title: "RAG",
      href: "/dashboard/rag",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Tasks",
      href: "/dashboard/tasks",
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      title: "Tools",
      href: "/dashboard/tools",
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      title: "Google",
      href: "/dashboard/google",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {item.icon}
          <span className="ml-3">{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}
