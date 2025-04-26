import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

export const runtime = "nodejs"

const execPromise = promisify(exec)

// List of allowed commands for security
const ALLOWED_COMMANDS = [
  "ollama ps",
  "ollama list",
  "ollama rm",
  "ollama pull",
  "ollama run",
  "ollama serve",
  "ollama create",
  "ollama show",
]

export async function POST(request: Request) {
  try {
    const { command } = await request.json()

    // Security check - only allow specific Ollama commands
    const isAllowed = ALLOWED_COMMANDS.some((allowed) => command.startsWith(allowed))

    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Command not allowed for security reasons. Only Ollama commands are permitted.",
        },
        { status: 403 },
      )
    }

    // Execute the command
    const { stdout, stderr } = await execPromise(command)

    return NextResponse.json({
      success: true,
      output: stdout || stderr,
    })
  } catch (error) {
    console.error("Command execution failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
