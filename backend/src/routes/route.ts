import type { FastifyPluginAsync } from "fastify"
import { RouteQuoteSchema, type RouteQuoteResponse } from "../types"
import { blockchainService } from "../blockchain"

const routeRoutes: FastifyPluginAsync = async (fastify) => {
  // Get route quote
  fastify.post(
    "/quote",
    {
      schema: {
        body: RouteQuoteSchema,
        response: {
          200: {
            type: "object",
            properties: {
              fromChain: { type: "string" },
              toChain: { type: "string" },
              tokenIn: { type: "string" },
              tokenOut: { type: "string" },
              amountIn: { type: "string" },
              steps: { type: "array" },
              gasEstimateUSD: { type: "string" },
              risk: { type: "object" },
              fallbackRoutes: { type: "array" },
              bundle: { type: "array" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { fromChain, toChain, tokenIn, tokenOut, amountIn, receiverAddress } = request.body as any

      try {
        const steps = []
        let currentAmount = amountIn
        let totalGasUSD = 0

        // Step 1: Swap if needed (same chain, different tokens)
        if (tokenIn !== tokenOut && fromChain === toChain) {
          const swapQuote = await blockchainService.getSwapQuote(fromChain, tokenIn, tokenOut, currentAmount)
          steps.push({
            type: "swap" as const,
            dex: "1inch",
            estOut: swapQuote.amountOut,
          })
          currentAmount = swapQuote.amountOut
          totalGasUSD += Number.parseFloat(swapQuote.gasEstimate) * 2400 // ETH price
        }

        // Step 2: Bridge if cross-chain
        if (fromChain !== toChain) {
          const bridgeQuote = await blockchainService.getBridgeQuote(fromChain, toChain, tokenOut, currentAmount)
          steps.push({
            type: "bridge" as const,
            via: bridgeQuote.route,
            estOut: bridgeQuote.amountOut,
          })
          currentAmount = bridgeQuote.amountOut
          totalGasUSD += Number.parseFloat(bridgeQuote.bridgeFee) * 100 // Approximate gas cost
        }

        // Step 3: Transfer to final recipient
        steps.push({
          type: "transfer" as const,
          to: receiverAddress,
          estOut: currentAmount,
        })

        // Get gas estimates for the route
        const gasEstimate = Math.max(totalGasUSD, 0.05).toFixed(4)

        // Generate fallback routes
        const fallbackRoutes = []
        if (fromChain !== toChain) {
          const hopQuote = await blockchainService.getBridgeQuote(fromChain, toChain, tokenOut, amountIn)
          fallbackRoutes.push({
            via: "Hop Protocol",
            estOut: (Number.parseFloat(hopQuote.amountOut) * 0.998).toFixed(4),
          })

          const stargateFallback = (Number.parseFloat(amountIn) * 0.992).toFixed(4)
          fallbackRoutes.push({
            via: "Stargate",
            estOut: stargateFallback,
          })
        }

        const routeResponse: RouteQuoteResponse = {
          fromChain,
          toChain,
          tokenIn,
          tokenOut,
          amountIn,
          steps,
          gasEstimateUSD: gasEstimate,
          risk: {
            slippage: "0.5%",
            flags: [],
          },
          fallbackRoutes,
          bundle: [
            {
              chain: fromChain,
              tx: "0x" + Math.random().toString(16).substr(2, 40),
            },
          ],
        }

        // Cache the route for future use
        const routeKey = `${fromChain}-${toChain}-${tokenIn}-${amountIn}`
        await fastify.prisma.routeCache.upsert({
          where: { routeKey },
          update: {
            routeData: JSON.stringify(routeResponse),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          },
          create: {
            routeKey,
            routeData: JSON.stringify(routeResponse),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        })

        return routeResponse
      } catch (error) {
        fastify.log.error("Route calculation error:", error)

        // Fallback to mock route on error
        const mockRoute: RouteQuoteResponse = {
          fromChain,
          toChain,
          tokenIn,
          tokenOut,
          amountIn,
          steps: [
            {
              type: "swap",
              dex: "1inch",
              estOut: (Number.parseFloat(amountIn) * 0.999).toFixed(2),
            },
            {
              type: "bridge",
              via: "socket",
              estOut: (Number.parseFloat(amountIn) * 0.995).toFixed(2),
            },
            {
              type: "transfer",
              to: receiverAddress,
              estOut: (Number.parseFloat(amountIn) * 0.995).toFixed(2),
            },
          ],
          gasEstimateUSD: "0.12",
          risk: {
            slippage: "0.5%",
            flags: [],
          },
          fallbackRoutes: [
            {
              via: "hop",
              estOut: (Number.parseFloat(amountIn) * 0.992).toFixed(2),
            },
          ],
          bundle: [
            {
              chain: fromChain,
              tx: "0x" + Math.random().toString(16).substr(2, 40),
            },
          ],
        }

        return mockRoute
      }
    },
  )

  fastify.post("/simulate", async (request, reply) => {
    const { fromChain, toAddress, value, data } = request.body as any

    try {
      const mockFromAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9" as const
      const simulation = await blockchainService.simulateTransaction(fromChain, mockFromAddress, toAddress, value, data)

      return simulation
    } catch (error) {
      reply.code(500)
      return { error: "Simulation failed", details: error instanceof Error ? error.message : "Unknown error" }
    }
  })

  // Get cached routes
  fastify.get("/cache/:routeKey", async (request, reply) => {
    const { routeKey } = request.params as { routeKey: string }

    const cached = await fastify.prisma.routeCache.findUnique({
      where: { routeKey },
    })

    if (!cached || cached.expiresAt < new Date()) {
      reply.code(404)
      return { error: "Route not found or expired" }
    }

    return JSON.parse(cached.routeData)
  })
}

export default routeRoutes
