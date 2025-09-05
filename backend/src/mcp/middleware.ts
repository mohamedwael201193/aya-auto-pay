import type { FastifyRequest, FastifyReply } from "fastify"

// MCP Authentication middleware (for production use)
export async function mcpAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // In production, implement proper authentication
  // For now, we'll allow all requests for development

  const authHeader = request.headers.authorization

  // Example: Bearer token validation
  if (process.env.NODE_ENV === "production" && !authHeader) {
    reply.code(401)
    return {
      error: {
        code: -32001,
        message: "Authentication required",
      },
    }
  }

  // Validate MCP client
  const userAgent = request.headers["user-agent"]
  if (userAgent && !userAgent.includes("MCP") && !userAgent.includes("Aya")) {
    // Log suspicious requests
    request.log.warn("Non-MCP client accessing MCP endpoints", { userAgent })
  }
}

// Rate limiting for MCP endpoints
export const mcpRateLimit = {
  max: 100, // requests
  timeWindow: "1 minute",
}

// CORS configuration for MCP
export const mcpCorsOptions = {
  origin: ["https://aya.app", "https://wallet.aya.app", "http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "X-MCP-Version"],
}
