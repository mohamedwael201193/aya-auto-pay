import { z } from "zod"

// Subscription schemas
export const CreateSubscriptionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tokenSymbol: z.string().min(1),
  tokenAddress: z.string().min(1),
  amount: z.string().min(1),
  receiverAddress: z.string().min(1),
  fromChain: z.string().min(1),
  toChain: z.string().min(1),
  frequency: z.enum(["daily", "weekly", "monthly"]),
})

export const RouteQuoteSchema = z.object({
  fromChain: z.string().min(1),
  toChain: z.string().min(1),
  tokenIn: z.string().min(1),
  tokenOut: z.string().min(1),
  amountIn: z.string().min(1),
  receiverAddress: z.string().min(1),
})

export const GasEnsureSchema = z.object({
  chain: z.string().min(1),
  userAddress: z.string().min(1),
  estimatedGasUSD: z.string().min(1),
})

export const RiskScanSchema = z.object({
  tokenAddress: z.string().min(1),
  receiverAddress: z.string().min(1),
  chain: z.string().min(1),
  amount: z.string().min(1),
})

// Response types
export interface RouteStep {
  type: "swap" | "bridge" | "transfer"
  dex?: string
  via?: string
  to?: string
  estOut: string
}

export interface RouteQuoteResponse {
  fromChain: string
  toChain: string
  tokenIn: string
  tokenOut: string
  amountIn: string
  steps: RouteStep[]
  gasEstimateUSD: string
  risk: {
    slippage: string
    flags: string[]
  }
  fallbackRoutes: Array<{
    via: string
    estOut: string
  }>
  bundle: Array<{
    chain: string
    tx: string
  }>
}

export interface RiskAssessment {
  riskLevel: "low" | "medium" | "high"
  flags: string[]
  recommendations: string[]
  confidence: number
}

export interface GasTopUp {
  needed: boolean
  currentBalanceUSD: string
  requiredUSD: string
  topUpSteps?: RouteStep[]
}
