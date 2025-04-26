"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  PenToolIcon as Tool,
  Wrench,
  BookOpen,
  Clock,
  Calendar,
  Mail,
} from "lucide-react"

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardNav({ className, ...props }: NavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      name: "Database",
      href: "/dashboard/database",
      icon: <Database className="mr-2 h-4 w-4" />,
      submenu: [
        {
          name: "Explorer",
          href: "/dashboard/database/explorer",
          icon: <Database className="mr-2 h-4 w-4" />,
        },
      ],
    },
    {
      name: "LLM",
      href: "/dashboard/llm",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      submenu: [
        {
          name: "Models",
          href: "/dashboard/llm/models",
          icon: <BookOpen className="mr-2 h-4 w-4" />,
        },
        {
          name: "Chat",
          href: "/dashboard/chat",
          icon: <MessageSquare className="mr-2 h-4 w-4" />,
        },
        {
          name: "RAG",
          href: "/dashboard/rag",
          icon: <Wrench className="mr-2 h-4 w-4" />,
        },
      ],
    },
    {
      name: "Tools",
      href: "/dashboard/tools",
      icon: <Tool className="mr-2 h-4 w-4" />,
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: <Clock className="mr-2 h-4 w-4" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics/real-time",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      submenu: [
        {
          name: "Reports",
          href: "/dashboard/reports",
          icon: <FileText className="mr-2 h-4 w-4" />,
          submenu: [
            {
              name: "Templates",
              href: "/dashboard/reports/templates",
              icon: <FileText className="mr-2 h-4 w-4" />,
            },
            {
              name: "Create",
              href: "/dashboard/reports/create",
              icon: <FileText className="mr-2 h-4 w-4" />,
            },
            {
              name: "Scheduled",
              href: "/dashboard/reports/scheduled",
              icon: <Calendar className="mr-2 h-4 w-4" />,
            },
          ],
        },
        {
          name: "History",
          href: "/dashboard/history",
          icon: <Clock className="mr-2 h-4 w-4" />,
        },
      ],
    },
    {
      name: "Google",
      href: "/dashboard/google",
      icon: <Mail className="mr-2 h-4 w-4" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <div className={cn("flex flex-col space-y-1", className)} {...props}>
      <div className="px-3 py-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">|my-ai|</h2>
      </div>
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          // Always show submenu for LLM and Analytics
          const alwaysShowSubmenu = item.name === "LLM" || item.name === "Analytics"

          return (
            <div key={item.name} className="space-y-1">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                {item.icon}
                {item.name}
              </Link>

              {item.submenu && (isActive || alwaysShowSubmenu) && (
                <div className="ml-6 space-y-1">
                  {item.submenu.map((subitem) => {
                    const isSubActive = pathname === subitem.href || pathname?.startsWith(`${subitem.href}/`)

                    // Always show Reports submenu
                    const alwaysShowReportsSubmenu = subitem.name === "Reports"

                    return (
                      <div key={subitem.name} className="space-y-1">
                        <Link
                          href={subitem.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                            isSubActive ? "bg-accent text-accent-foreground" : "transparent",
                          )}
                        >
                          {subitem.icon}
                          {subitem.name}
                        </Link>

                        {subitem.submenu && (isSubActive || alwaysShowReportsSubmenu) && (
                          <div className="ml-6 space-y-1">
                            {subitem.submenu.map((subsubitem) => {
                              const isSubSubActive =
                                pathname === subsubitem.href || pathname?.startsWith(`${subsubitem.href}/`)

                              return (
                                <Link
                                  key={subsubitem.name}
                                  href={subsubitem.href}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                                    isSubSubActive ? "bg-accent text-accent-foreground" : "transparent",
                                  )}
                                >
                                  {subsubitem.icon}
                                  {subsubitem.name}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
