import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

export const runtime = "nodejs"

const execPromise = promisify(exec)

export async function GET(request: Request) {
  try {
    // Get the URL from query parameters or default to localhost
    const url = new URL(request.url)
    const ollamaUrl = url.searchParams.get("url") || "http://localhost:11434"

    // Try to get model status using the Ollama API first
    try {
      const response = await fetch(`${ollamaUrl}/api/ps`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          success: true,
          models: data.models || [],
          source: "api",
        })
      }
    } catch (apiError) {
      console.log("API method failed, falling back to CLI:", apiError)
    }

    // Fallback to CLI command if API fails
    try {
      const { stdout } = await execPromise("ollama ps")

      // Parse the CLI output
      const lines = stdout.trim().split("\n")
      if (lines.length <= 1) {
        return NextResponse.json({
          success: true,
          models: [],
          source: "cli",
        })
      }

      // Skip the header line
      const modelLines = lines.slice(1)
      const models = modelLines
        .map((line) => {
          const parts = line.trim().split(/\s+/)
          // Expected format: NAME ID SIZE PROCESSOR UNTIL
          if (parts.length >= 5) {
            return {
              name: parts[0],
              id: parts[1],
              size: parts[2],
              processor: parts[3],
              until: parts.slice(4).join(" "),
            }
          }
          return null
        })
        .filter(Boolean)

      return NextResponse.json({
        success: true,
        models,
        source: "cli",
      })
    } catch (cliError) {
      throw new Error(`Failed to get model status: ${(cliError as Error).message}`)
    }
  } catch (error) {
    console.error("Failed to get model status:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    const ollamaUrl = url || "http://localhost:11434"

    // Create a new request with the URL as a query parameter
    const newUrl = new URL(request.url)
    newUrl.searchParams.set("url", ollamaUrl)
    const newRequest = new Request(newUrl, request)

    return GET(newRequest)
  } catch (error) {
    return GET(request)
  }
}
