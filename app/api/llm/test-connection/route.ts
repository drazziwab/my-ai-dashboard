import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    // Test connection to Ollama
    const response = await fetch(`${url}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Successfully connected to Ollama",
    })
  } catch (error) {
    console.error("Ollama connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
