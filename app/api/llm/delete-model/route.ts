import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, model } = await request.json()

    // Delete model from Ollama
    const response = await fetch(`${url}/api/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: model }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return NextResponse.json({
      success: true,
      message: `Model ${model} deleted successfully`,
    })
  } catch (error) {
    console.error("Failed to delete Ollama model:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
