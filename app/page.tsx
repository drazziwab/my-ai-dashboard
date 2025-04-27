"use client"

import { DashboardHeader } from "../components/dashboard-header"

export default function Page() {
  return (
    <div>
      <DashboardHeader />
      <main className="container py-6">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard.</p>
      </main>
    </div>
  )
}
