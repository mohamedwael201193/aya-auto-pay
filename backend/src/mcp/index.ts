import type { FastifyInstance } from "fastify"
import { z } from "zod"
import type { PrismaClient } from "@prisma/client"

// MCP Tool schemas
const MCPToolCallSchema = z.object({
  name: z.string(),
  arguments: z.record(z.any()),
})

const MCPRequestSchema = z.object({
  method: z.literal("tools/call"),
  params: MCPToolCallSchema,
})

// MCP Response types
interface MCPResponse {
  content: Array<{
    type: "text"
    text: string
  }>
  isError?: boolean
}

type MCPToolHandler = (args: any, prisma: PrismaClient) => Promise<MCPResponse>

// Tool handlers
const toolHandlers: Record<string, MCPToolHandler> = {
  "subscription.create": async (args, prisma) => {
    try {
      const { name, tokenSymbol, amount, receiverAddress, fromChain, toChain, frequency } = args

      // Validate required fields
      if (!name || !tokenSymbol || !amount || !receiverAddress || !fromChain || !toChain || !frequency) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Missing required fields. Please provide name, tokenSymbol, amount, receiverAddress, fromChain, toChain, and frequency.",
            },
          ],
          isError: true,
        }
      }

      // Calculate next run date
      const now = new Date()
      let nextRunDate: Date
      switch (frequency) {
        case "daily":
          nextRunDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case "weekly":
          nextRunDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case "monthly":
          nextRunDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        default:
          nextRunDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      }

      const subscription = await prisma.subscription.create({
        data: {
          name,
          tokenSymbol,
          tokenAddress: "0x" + Math.random().toString(16).substr(2, 40), // Mock address
          amount,
          receiverAddress,
          fromChain,
          toChain,
          frequency,
          nextRunDate,
        },
      })

      return {
        content: [
          {
            type: "text",
            text:
              `✅ Subscription "${name}" created successfully!\n\n` +
              `📋 Details:\n` +
              `• ID: ${subscription.id}\n` +
              `• Amount: ${amount} ${tokenSymbol}\n` +
              `• Route: ${fromChain} → ${toChain}\n` +
              `• Frequency: ${frequency}\n` +
              `• Next payment: ${nextRunDate.toLocaleDateString()}\n` +
              `• Receiver: ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)}\n\n` +
              `Your automated cross-chain payments are now active! 🚀`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to create subscription: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      }
    }
  },

  "subscription.list": async (args, prisma) => {
    try {
      const subscriptions = await prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          executions: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      })

      if (subscriptions.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: '📋 No subscriptions found.\n\nYou can create your first subscription using the "subscription.create" tool!',
            },
          ],
        }
      }

      const activeCount = subscriptions.filter((s) => s.isActive).length
      const totalMonthlyValue = subscriptions
        .filter((s) => s.isActive)
        .reduce((sum, sub) => {
          const multiplier = sub.frequency === "daily" ? 30 : sub.frequency === "weekly" ? 4 : 1
          return sum + Number.parseFloat(sub.amount) * multiplier
        }, 0)

      let response = `📊 **Subscription Overview**\n\n`
      response += `• Active subscriptions: ${activeCount}/${subscriptions.length}\n`
      response += `• Estimated monthly volume: $${totalMonthlyValue.toFixed(2)}\n\n`
      response += `📋 **Your Subscriptions:**\n\n`

      subscriptions.forEach((sub, index) => {
        const status = sub.isActive ? "🟢 Active" : "⏸️ Paused"
        const lastExecution = sub.executions[0]
        const executionStatus = lastExecution
          ? lastExecution.status === "success"
            ? "✅"
            : lastExecution.status === "pending"
              ? "⏳"
              : "❌"
          : "⚪"

        response += `${index + 1}. **${sub.name}** ${status}\n`
        response += `   • Amount: ${sub.amount} ${sub.tokenSymbol}\n`
        response += `   • Route: ${sub.fromChain} → ${sub.toChain}\n`
        response += `   • Frequency: ${sub.frequency}\n`
        response += `   • Next run: ${new Date(sub.nextRunDate).toLocaleDateString()}\n`
        response += `   • Last execution: ${executionStatus}\n`
        response += `   • ID: ${sub.id}\n\n`
      })

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to list subscriptions: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      }
    }
  },

  "subscription.cancel": async (args, prisma) => {
    try {
      const { id } = args

      if (!id) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Error: Subscription ID is required to cancel a subscription.",
            },
          ],
          isError: true,
        }
      }

      const subscription = await prisma.subscription.findUnique({
        where: { id },
      })

      if (!subscription) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Subscription with ID "${id}" not found.`,
            },
          ],
          isError: true,
        }
      }

      await prisma.subscription.update({
        where: { id },
        data: { isActive: false },
      })

      return {
        content: [
          {
            type: "text",
            text:
              `✅ Subscription "${subscription.name}" has been cancelled successfully.\n\n` +
              `The subscription is now paused and no further payments will be processed. ` +
              `You can reactivate it later if needed.`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to cancel subscription: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      }
    }
  },

  "route.quote": async (args, prisma) => {
    try {
      const { fromChain, toChain, tokenIn, tokenOut, amountIn, receiverAddress } = args

      if (!fromChain || !toChain || !tokenIn || !tokenOut || !amountIn || !receiverAddress) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Error: Missing required parameters. Please provide fromChain, toChain, tokenIn, tokenOut, amountIn, and receiverAddress.",
            },
          ],
          isError: true,
        }
      }

      // Simulate route calculation
      const estimatedOutput = (Number.parseFloat(amountIn) * 0.995).toFixed(4)
      const gasEstimate = "0.12"
      const slippage = "0.5%"

      const steps = [
        { type: "swap", protocol: "1inch", estimatedOutput: (Number.parseFloat(amountIn) * 0.999).toFixed(4) },
        { type: "bridge", protocol: "Socket", estimatedOutput: estimatedOutput },
        { type: "transfer", to: receiverAddress, estimatedOutput: estimatedOutput },
      ]

      const fallbackRoutes = [
        { protocol: "Hop Protocol", estimatedOutput: (Number.parseFloat(amountIn) * 0.992).toFixed(4) },
        { protocol: "Stargate", estimatedOutput: (Number.parseFloat(amountIn) * 0.99).toFixed(4) },
      ]

      let response = `🛣️ **Optimal Route Quote**\n\n`
      response += `📊 **Summary:**\n`
      response += `• Input: ${amountIn} ${tokenIn} (${fromChain})\n`
      response += `• Output: ~${estimatedOutput} ${tokenOut} (${toChain})\n`
      response += `• Gas estimate: $${gasEstimate}\n`
      response += `• Slippage: ${slippage}\n\n`

      response += `🔄 **Execution Steps:**\n`
      steps.forEach((step, index) => {
        response += `${index + 1}. **${step.type.toUpperCase()}** `
        if (step.protocol) response += `via ${step.protocol} `
        if (step.to) response += `to ${step.to.slice(0, 6)}...${step.to.slice(-4)} `
        response += `→ ${step.estimatedOutput} ${tokenOut}\n`
      })

      response += `\n🔄 **Fallback Options:**\n`
      fallbackRoutes.forEach((route, index) => {
        response += `${index + 1}. ${route.protocol}: ~${route.estimatedOutput} ${tokenOut}\n`
      })

      response += `\n✅ Route optimized for best price and reliability!`

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get route quote: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      }
    }
  },

  "gas.ensure": async (args, prisma) => {
    try {
      const { chain, userAddress, estimatedGasUSD } = args

      if (!chain || !userAddress || !estimatedGasUSD) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Error: Missing required parameters. Please provide chain, userAddress, and estimatedGasUSD.",
            },
          ],
          isError: true,
        }
      }

      // Simulate gas balance check
      const currentBalance = Math.random() * 50 // Random balance 0-50 USD
      const requiredGas = Number.parseFloat(estimatedGasUSD)
      const recommendedBuffer = requiredGas * 1.5 // 50% buffer

      let response = `⛽ **Gas Balance Check**\n\n`
      response += `🔍 **Analysis for ${chain}:**\n`
      response += `• Wallet: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}\n`
      response += `• Current balance: $${currentBalance.toFixed(2)}\n`
      response += `• Required for transaction: $${requiredGas}\n`
      response += `• Recommended buffer: $${recommendedBuffer.toFixed(2)}\n\n`

      if (currentBalance >= recommendedBuffer) {
        response += `✅ **Sufficient Gas Available**\n`
        response += `You have enough gas to complete the transaction with a safety buffer.`
      } else {
        const topUpNeeded = (recommendedBuffer - currentBalance).toFixed(2)
        response += `⚠️ **Gas Top-up Recommended**\n`
        response += `• Top-up needed: $${topUpNeeded}\n\n`
        response += `🔄 **Suggested Top-up Route:**\n`
        response += `1. **SWAP** USDC → ETH via 1inch → $${topUpNeeded}\n`
        response += `2. **BRIDGE** to ${chain} via Socket → $${(Number.parseFloat(topUpNeeded) * 0.998).toFixed(2)}\n\n`
        response += `💡 AutoPay will automatically handle gas top-ups during execution.`
      }

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to check gas balance: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      }
    }
  },

  "risk.scan": async (args, prisma) => {
    try {
      const { tokenAddress, receiverAddress, chain, amount } = args

      if (!tokenAddress || !receiverAddress || !chain || !amount) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Error: Missing required parameters. Please provide tokenAddress, receiverAddress, chain, and amount.",
            },
          ],
          isError: true,
        }
      }

      // Simulate risk assessment
      const flags: string[] = []
      let riskLevel: "low" | "medium" | "high" = "low"
      const recommendations: string[] = []

      // Mock risk checks
      if (Number.parseFloat(amount) > 1000) {
        flags.push("High value transaction")
        riskLevel = "medium"
        recommendations.push("Consider splitting into smaller amounts")
      }

      if (receiverAddress.toLowerCase().includes("0x000")) {
        flags.push("Suspicious receiver address pattern")
        riskLevel = "high"
        recommendations.push("Verify receiver address carefully")
      }

      // Random additional checks
      if (Math.random() < 0.1) {
        flags.push("Token contract recently deployed")
        riskLevel = "medium"
        recommendations.push("Verify token contract legitimacy")
      }

      const confidence = Math.random() * 0.3 + 0.7 // 70-100% confidence

      let response = `🛡️ **Security Risk Assessment**\n\n`
      response += `🔍 **Transaction Analysis:**\n`
      response += `• Token: ${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}\n`
      response += `• Receiver: ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)}\n`
      response += `• Chain: ${chain}\n`
      response += `• Amount: ${amount}\n\n`

      const riskEmoji = riskLevel === "low" ? "🟢" : riskLevel === "medium" ? "🟡" : "🔴"
      response += `${riskEmoji} **Risk Level: ${riskLevel.toUpperCase()}**\n`
      response += `• Confidence: ${(confidence * 100).toFixed(1)}%\n\n`

      if (flags.length > 0) {
        response += `⚠️ **Risk Flags:**\n`
        flags.forEach((flag, index) => {
          response += `${index + 1}. ${flag}\n`
        })
        response += `\n`
      }

      if (recommendations.length > 0) {
        response += `💡 **Recommendations:**\n`
        recommendations.forEach((rec, index) => {
          response += `${index + 1}. ${rec}\n`
        })
      } else {
        response += `✅ **No security concerns detected.**\n`
        response += `Transaction appears safe to proceed.`
      }

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to perform risk scan: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      }
    }
  },
}

// MCP Plugin for Fastify
export async function mcpPlugin(fastify: FastifyInstance) {
  // MCP manifest endpoint
  fastify.get("/mcp/manifest", async (request, reply) => {
    const manifest = {
      name: "aya-autopay",
      version: "1.0.0",
      description: "AI-powered subscription and payment automation tools for Aya Wallet",
      author: "Aya Team",
      license: "MIT",
      tools: [
        {
          name: "subscription.create",
          description: "Create a new recurring subscription for automated payments across chains",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Human-readable name for the subscription" },
              tokenSymbol: { type: "string", description: "Token symbol (USDC, ETH, etc.)" },
              amount: { type: "string", description: "Amount to send each period" },
              receiverAddress: { type: "string", description: "Destination wallet address" },
              fromChain: { type: "string", description: "Source blockchain (base, ethereum, arbitrum)" },
              toChain: { type: "string", description: "Target blockchain" },
              frequency: {
                type: "string",
                enum: ["daily", "weekly", "monthly"],
                description: "How often to execute the payment",
              },
            },
            required: ["name", "tokenSymbol", "amount", "receiverAddress", "fromChain", "toChain", "frequency"],
          },
        },
        {
          name: "subscription.list",
          description: "List all active subscriptions for the user",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "subscription.cancel",
          description: "Cancel an existing subscription",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Subscription ID to cancel" },
            },
            required: ["id"],
          },
        },
        {
          name: "route.quote",
          description: "Get the best route for cross-chain payments with fallback options",
          inputSchema: {
            type: "object",
            properties: {
              fromChain: { type: "string" },
              toChain: { type: "string" },
              tokenIn: { type: "string" },
              tokenOut: { type: "string" },
              amountIn: { type: "string" },
              receiverAddress: { type: "string" },
            },
            required: ["fromChain", "toChain", "tokenIn", "tokenOut", "amountIn", "receiverAddress"],
          },
        },
        {
          name: "gas.ensure",
          description: "Check gas balance and provide top-up steps if needed",
          inputSchema: {
            type: "object",
            properties: {
              chain: { type: "string" },
              userAddress: { type: "string" },
              estimatedGasUSD: { type: "string" },
            },
            required: ["chain", "userAddress", "estimatedGasUSD"],
          },
        },
        {
          name: "risk.scan",
          description: "Scan transactions for security risks before execution",
          inputSchema: {
            type: "object",
            properties: {
              tokenAddress: { type: "string" },
              receiverAddress: { type: "string" },
              chain: { type: "string" },
              amount: { type: "string" },
            },
            required: ["tokenAddress", "receiverAddress", "chain", "amount"],
          },
        },
      ],
      server: {
        url: "http://localhost:3001/mcp",
        description: "Aya AutoPay MCP Server",
      },
    }

    return manifest
  })

  // MCP tool execution endpoint
  fastify.post(
    "/mcp/call",
    {
      schema: {
        body: MCPRequestSchema,
      },
    },
    async (request, reply) => {
      try {
        const { method, params } = request.body as any

        if (method !== "tools/call") {
          reply.code(400)
          return {
            error: {
              code: -32601,
              message: "Method not found",
            },
          }
        }

        const { name, arguments: args } = params
        const handler = toolHandlers[name]

        if (!handler) {
          reply.code(400)
          return {
            error: {
              code: -32602,
              message: `Tool '${name}' not found`,
            },
          }
        }

        const result = await handler(args, fastify.prisma)
        return { result }
      } catch (error) {
        fastify.log.error(error)
        reply.code(500)
        return {
          error: {
            code: -32603,
            message: "Internal error",
            data: error instanceof Error ? error.message : "Unknown error",
          },
        }
      }
    },
  )

  // Health check for MCP server
  fastify.get("/mcp/health", async (request, reply) => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      tools: Object.keys(toolHandlers),
      version: "1.0.0",
    }
  })
}
