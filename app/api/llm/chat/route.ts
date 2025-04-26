import { type NextRequest, NextResponse } from "next/server"
import sql from "mssql"
import { getConnection } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { model, messages } = await request.json()

    // Log the request to the database
    try {
      const pool = await getConnection()
      const request = pool
        .request()
        .input("model", sql.NVarChar, model)
        .input("prompt", sql.NVarChar, JSON.stringify(messages))
        .input("created_at", sql.DateTime, new Date())

      await request.query(`
        INSERT INTO LlmRequests (model, prompt, created_at)
        VALUES (@model, @prompt, @created_at)
      `)
    } catch (error) {
      console.error("Error logging LLM request to database:", error)
      // Continue even if logging fails
    }

    // Process the chat request
    // This is a simplified implementation - in a real app, you would call your LLM service
    const lastMessage = messages[messages.length - 1].content

    // Generate a response based on the last message
    let response = ""

    if (lastMessage.toLowerCase().includes("hello") || lastMessage.toLowerCase().includes("hi")) {
      response = "Hello! How can I assist you today?"
    } else if (lastMessage.toLowerCase().includes("help")) {
      response = "I'm here to help! What do you need assistance with?"
    } else if (lastMessage.toLowerCase().includes("weather")) {
      response =
        "I don't have access to real-time weather data, but I can help you find a weather service or answer other questions."
    } else if (lastMessage.toLowerCase().includes("name")) {
      response = "I am |my-ai|, your AI assistant. How can I help you today?"
    } else if (lastMessage.toLowerCase().includes("thank")) {
      response = "You're welcome! Is there anything else I can help you with?"
    } else {
      response = "I understand your message. How can I assist you further with that?"
    }

    // Add some random delay to simulate processing time
    const delay = Math.floor(Math.random() * 1000) + 500
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Log the response to the database
    try {
      const pool = await getConnection()
      const request2 = pool
        .request()
        .input("model", sql.NVarChar, model)
        .input("prompt", sql.NVarChar, JSON.stringify(messages))
        .input("response", sql.NVarChar, response)
        .input("tokens", sql.Int, response.split(" ").length * 2) // Rough estimate
        .input("duration_ms", sql.Int, delay)
        .input("created_at", sql.DateTime, new Date())

      await request2.query(`
        INSERT INTO LlmRequests (model, prompt, response, tokens, duration_ms, created_at)
        VALUES (@model, @prompt, @response, @tokens, @duration_ms, @created_at)
      `)
    } catch (error) {
      console.error("Error logging LLM response to database:", error)
      // Continue even if logging fails
    }

    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error("Error processing chat request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process chat request" },
      { status: 200 }, // Return 200 even for errors to handle them gracefully on the client
    )
  }
}
