import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, model } = await request.json()

    // Start model download in Ollama
    const response = await fetch(`${url}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: model }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // In a real application, you would stream the download progress
    // For this example, we'll just return success

    return NextResponse.json({
      success: true,
      message: `Started downloading model: ${model}`,
    })
  } catch (error) {
    console.error("Failed to download Ollama model:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
