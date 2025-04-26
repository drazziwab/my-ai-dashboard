import type { Metadata } from "next"
import { ModelManager } from "@/components/llm/model-manager"

export const metadata: Metadata = {
  title: "|my-ai| Models",
  description: "Manage your |my-ai| models",
}

export default function ModelsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">|my-ai| Models</h1>
        <p className="text-muted-foreground">Manage your |my-ai| models and configurations</p>
      </div>
      <ModelManager />
    </div>
  )
}
