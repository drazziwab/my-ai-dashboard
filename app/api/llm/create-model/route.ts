import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, modelfile } = await request.json()

    // Extract model name from the modelfile
    const modelNameMatch = modelfile.match(/^FROM\s+(\S+)/i)
    if (!modelNameMatch) {
      throw new Error("Invalid Modelfile: missing FROM directive")
    }

    const modelName = modelNameMatch[1] + "-custom"

    // Create custom model in Ollama
    const response = await fetch(`${url}/api/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: modelName,
        modelfile: modelfile,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return NextResponse.json({
      success: true,
      message: `Custom model ${modelName} created successfully`,
    })
  } catch (error) {
    console.error("Failed to create custom Ollama model:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
