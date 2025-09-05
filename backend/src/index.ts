import Fastify from "fastify"
import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import { PrismaClient } from "@prisma/client"
import { mcpPlugin } from "./mcp"

import subscriptionRoutes from "./routes/subscription"
import routeRoutes from "./routes/route"
import gasRoutes from "./routes/gas"
import riskRoutes from "./routes/risk"

const prisma = new PrismaClient()
const fastify = Fastify({
  logger: true,
})

// Register plugins
fastify.register(cors, {
  origin: true,
})

fastify.register(swagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Aya AutoPay API",
      description: "AI-powered subscription and payment automation API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
  },
})

fastify.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
})

// Add Prisma to Fastify context
fastify.decorate("prisma", prisma)

// Register routes
fastify.register(subscriptionRoutes, { prefix: "/api/subscription" })
fastify.register(routeRoutes, { prefix: "/api/route" })
fastify.register(gasRoutes, { prefix: "/api/gas" })
fastify.register(riskRoutes, { prefix: "/api/risk" })
fastify.register(mcpPlugin, { prefix: "/mcp" })

// Health check
fastify.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" })
    console.log("🚀 Aya AutoPay Backend running on http://localhost:3001")
    console.log("📚 API Documentation: http://localhost:3001/docs")
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  await fastify.close()
  process.exit(0)
})
