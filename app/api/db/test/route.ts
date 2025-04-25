export async function GET(req: Request) {
  return new Response(JSON.stringify({
    success: true,
    message: "Database connection successful"
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
