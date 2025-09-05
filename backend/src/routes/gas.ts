import type { FastifyPluginAsync } from "fastify"
import { GasEnsureSchema, type GasTopUp } from "../types"
import { blockchainService } from "../blockchain"

const gasRoutes: FastifyPluginAsync = async (fastify) => {
  // Check gas balance and suggest top-up if needed
  fastify.post(
    "/ensure",
    {
      schema: {
        body: GasEnsureSchema,
        response: {
          200: {
            type: "object",
            properties: {
              needed: { type: "boolean" },
              currentBalanceUSD: { type: "string" },
              requiredUSD: { type: "string" },
              topUpSteps: { type: "array" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { chain, userAddress, estimatedGasUSD } = request.body as any

      try {
        const balanceData = await blockchainService.getNativeBalance(chain, userAddress as `0x${string}`)
        const currentBalanceUSD = Number.parseFloat(balanceData.balanceUSD)
        const requiredGas = Number.parseFloat(estimatedGasUSD)
        const buffer = requiredGas * 1.5 // 50% buffer

        const gasTopUp: GasTopUp = {
          needed: currentBalanceUSD < buffer,
          currentBalanceUSD: currentBalanceUSD.toFixed(2),
          requiredUSD: buffer.toFixed(2),
        }

        if (gasTopUp.needed) {
          const topUpAmount = (buffer - currentBalanceUSD).toFixed(2)

          const swapQuote = await blockchainService.getSwapQuote(chain, "USDC", "ETH", topUpAmount)

          gasTopUp.topUpSteps = [
            {
              type: "swap",
              dex: "1inch",
              estOut: swapQuote.amountOut,
            },
          ]

          // Add bridge step if cross-chain top-up needed
          if (chain !== "ethereum") {
            const bridgeQuote = await blockchainService.getBridgeQuote("ethereum", chain, "ETH", swapQuote.amountOut)
            gasTopUp.topUpSteps.push({
              type: "bridge",
              via: bridgeQuote.route,
              estOut: bridgeQuote.amountOut,
            })
          }
        }

        return gasTopUp
      } catch (error) {
        fastify.log.error("Gas ensure error:", error)

        // Fallback to mock data on error
        const mockCurrentBalance = Math.random() * 50
        const requiredGas = Number.parseFloat(estimatedGasUSD)
        const buffer = requiredGas * 1.5

        const gasTopUp: GasTopUp = {
          needed: mockCurrentBalance < buffer,
          currentBalanceUSD: mockCurrentBalance.toFixed(2),
          requiredUSD: buffer.toFixed(2),
        }

        if (gasTopUp.needed) {
          const topUpAmount = (buffer - mockCurrentBalance).toFixed(2)
          gasTopUp.topUpSteps = [
            {
              type: "swap",
              dex: "1inch",
              estOut: topUpAmount,
            },
          ]
        }

        return gasTopUp
      }
    },
  )

  // Get gas prices for different chains
  fastify.get("/prices", async (request, reply) => {
    try {
      const gasPrices = await blockchainService.getGasPrices()
      return { gasPrices, timestamp: new Date().toISOString() }
    } catch (error) {
      fastify.log.error("Gas prices error:", error)

      // Fallback to mock gas prices
      const gasPrices = {
        ethereum: { gwei: "25", usd: "0.85", fast: "30", standard: "25", safe: "20" },
        base: { gwei: "0.1", usd: "0.001", fast: "0.12", standard: "0.1", safe: "0.08" },
        arbitrum: { gwei: "0.5", usd: "0.005", fast: "0.6", standard: "0.5", safe: "0.4" },
        polygon: { gwei: "30", usd: "0.01", fast: "36", standard: "30", safe: "24" },
        optimism: { gwei: "0.2", usd: "0.002", fast: "0.24", standard: "0.2", safe: "0.16" },
      }

      return { gasPrices, timestamp: new Date().toISOString() }
    }
  })

  fastify.post("/analyze", async (request, reply) => {
    const { chain, userAddress, transactionType } = request.body as any

    try {
      const [balanceData, gasPrices] = await Promise.all([
        blockchainService.getNativeBalance(chain, userAddress),
        blockchainService.getGasPrices(),
      ])

      const chainGasData = gasPrices[chain]
      if (!chainGasData) {
        reply.code(400)
        return { error: "Unsupported chain" }
      }

      // Estimate gas based on transaction type
      const gasEstimates = {
        transfer: 21000,
        swap: 150000,
        bridge: 200000,
        approve: 50000,
      }

      const gasLimit = gasEstimates[transactionType as keyof typeof gasEstimates] || 21000
      const gasCostETH = (Number.parseFloat(chainGasData.gwei) * gasLimit) / 1e9
      const gasCostUSD = gasCostETH * 2400 // Mock ETH price

      return {
        balance: balanceData,
        gasPrice: chainGasData,
        estimate: {
          gasLimit: gasLimit.toString(),
          gasCostETH: gasCostETH.toFixed(8),
          gasCostUSD: gasCostUSD.toFixed(4),
        },
        sufficient: Number.parseFloat(balanceData.balanceUSD) > gasCostUSD * 1.2,
      }
    } catch (error) {
      reply.code(500)
      return { error: "Gas analysis failed", details: error instanceof Error ? error.message : "Unknown error" }
    }
  })
}

export default gasRoutes
