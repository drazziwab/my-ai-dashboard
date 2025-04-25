import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, model, message, systemPrompt, options } = await request.json()

    // Send chat request to Ollama
    const response = await fetch(`${url}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are a helpful AI assistant.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        options,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      response: data.message.content,
    })
  } catch (error) {
    console.error("Chat request failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
