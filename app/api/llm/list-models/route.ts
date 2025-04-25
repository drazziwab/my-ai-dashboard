import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    // Fetch models from Ollama
    const response = await fetch(`${url}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to our format
    const models = data.models.map((model: any) => ({
      name: model.name,
      size: model.size,
      modified_at: model.modified_at,
      // Add additional fields with mock data for demonstration
      family: inferModelFamily(model.name),
      parameter_size: inferParameterSize(model.name),
      quantization_level: inferQuantizationLevel(model.name),
      status: "ready",
    }))

    // Return success response
    return NextResponse.json({
      success: true,
      models,
    })
  } catch (error) {
    console.error("Failed to list Ollama models:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// Helper functions to infer model metadata from name
function inferModelFamily(name: string): string {
  if (name.includes("llama")) return "LLaMA"
  if (name.includes("mistral")) return "Mistral"
  if (name.includes("phi")) return "Phi"
  if (name.includes("gemma")) return "Gemma"
  if (name.includes("codellama")) return "CodeLLaMA"
  if (name.includes("neural-chat")) return "Neural Chat"
  return "Unknown"
}

function inferParameterSize(name: string): string {
  if (name.includes("7b")) return "7B"
  if (name.includes("8b")) return "8B"
  if (name.includes("13b")) return "13B"
  if (name.includes("70b")) return "70B"
  if (name.includes("2b")) return "2B"
  if (name.includes("llama3") && !name.includes("8b")) return "8B"
  return "Unknown"
}

function inferQuantizationLevel(name: string): string {
  if (name.includes("q4_0")) return "Q4_0"
  if (name.includes("q4_1")) return "Q4_1"
  if (name.includes("q5_0")) return "Q5_0"
  if (name.includes("q5_1")) return "Q5_1"
  if (name.includes("q8_0")) return "Q8_0"
  return "None"
}
