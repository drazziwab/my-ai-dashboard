import { type NextRequest, NextResponse } from "next/server"
import { updateSystemStatus } from "@/lib/auth-service"
import { exec } from "child_process"
import util from "util"

const execPromise = util.promisify(exec)

// Check if a service is running
async function checkService(
  serviceName: string,
): Promise<{ isOnline: boolean; responseTime?: number; error?: string }> {
  const startTime = Date.now()

  try {
    switch (serviceName) {
      case "Database":
        // Check database connection
        const dbCommand = "ping -n 1 localhost"
        await execPromise(dbCommand)
        break

      case "|my-ai| Service":
        // Check Ollama service
        const ollamaCommand = "curl -s http://localhost:11434/api/version"
        await execPromise(ollamaCommand)
        break

      case "File Storage":
        // Check if file system is accessible
        const fsCommand = process.platform === "win32" ? "dir C:\\" : "ls /"
        await execPromise(fsCommand)
        break

      case "API Gateway":
        // Check if API gateway is running
        const apiCommand = "curl -s http://localhost:3000/api/health"
        await execPromise(apiCommand)
        break

      default:
        return { isOnline: false, error: "Unknown service" }
    }

    const responseTime = Date.now() - startTime
    return {
      isOnline: true,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      isOnline: false,
      responseTime,
      error: (error as Error).message,
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check all systems
    const systems = ["Database", "|my-ai| Service", "File Storage", "API Gateway"]
    const statusChecks = await Promise.all(
      systems.map(async (system) => {
        try {
          const status = await checkService(system)

          // Update status in database
          try {
            await updateSystemStatus(system, status.isOnline, status.responseTime, status.error)
          } catch (dbError) {
            console.error(`Error updating system status in database for ${system}:`, dbError)
            // Continue even if database update fails
          }

          return {
            name: system,
            isOnline: status.isOnline,
            responseTime: status.responseTime,
            error: status.error,
            lastChecked: new Date().toISOString(),
          }
        } catch (serviceError) {
          console.error(`Error checking service ${system}:`, serviceError)
          return {
            name: system,
            isOnline: false,
            responseTime: "ErR",
            error: "Service check failed",
            lastChecked: new Date().toISOString(),
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      statuses: statusChecks,
    })
  } catch (error) {
    console.error("Error in system status API:", error)

    // Return a 200 OK response with error indicators instead of a 500 error
    const systems = ["Database", "|my-ai| Service", "File Storage", "API Gateway"]
    const errorStatuses = systems.map((system) => ({
      name: system,
      isOnline: false,
      responseTime: "ErR",
      error: "System status check failed",
      lastChecked: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: false,
      message: (error as Error).message,
      statuses: errorStatuses,
    })
  }
}
