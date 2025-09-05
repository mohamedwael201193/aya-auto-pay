import {
  createPublicClient,
  http,
  formatEther,
  parseUnits,
  formatUnits,
  getContract,
  type Address,
  type Chain,
} from "viem"
import { mainnet, base, arbitrum, polygon, optimism } from "viem/chains"

// Chain configurations
export const SUPPORTED_CHAINS: Record<string, Chain> = {
  ethereum: mainnet,
  base: base,
  arbitrum: arbitrum,
  polygon: polygon,
  optimism: optimism,
}

// RPC URLs for different chains (use public RPCs for simulation)
const RPC_URLS: Record<string, string> = {
  ethereum: "https://eth.llamarpc.com",
  base: "https://mainnet.base.org",
  arbitrum: "https://arb1.arbitrum.io/rpc",
  polygon: "https://polygon-rpc.com",
  optimism: "https://mainnet.optimism.io",
}

// Common token addresses across chains
export const TOKEN_ADDRESSES: Record<string, Record<string, Address>> = {
  ethereum: {
    USDC: "0xA0b86a33E6441c8C06DD2b7c94b7E0e8c0c8c8c8",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  base: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    WETH: "0x4200000000000000000000000000000000000006",
  },
  arbitrum: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  polygon: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  },
  optimism: {
    USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    WETH: "0x4200000000000000000000000000000000000006",
  },
}

// ERC20 ABI for token interactions
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export class BlockchainService {
  private clients: Record<string, ReturnType<typeof createPublicClient>> = {}

  constructor() {
    // Initialize public clients for each supported chain
    for (const [chainName, chain] of Object.entries(SUPPORTED_CHAINS)) {
      this.clients[chainName] = createPublicClient({
        chain,
        transport: http(RPC_URLS[chainName]),
      })
    }
  }

  // Get native token balance (ETH, MATIC, etc.)
  async getNativeBalance(chain: string, address: Address): Promise<{ balance: string; balanceUSD: string }> {
    try {
      const client = this.clients[chain]
      if (!client) throw new Error(`Unsupported chain: ${chain}`)

      const balance = await client.getBalance({ address })
      const balanceFormatted = formatEther(balance)

      // Mock price conversion (in production, use price oracles)
      const mockPrices: Record<string, number> = {
        ethereum: 2400, // ETH price
        base: 2400, // ETH price (Base uses ETH)
        arbitrum: 2400, // ETH price (Arbitrum uses ETH)
        polygon: 0.8, // MATIC price
        optimism: 2400, // ETH price (Optimism uses ETH)
      }

      const priceUSD = mockPrices[chain] || 0
      const balanceUSD = (Number.parseFloat(balanceFormatted) * priceUSD).toFixed(2)

      return {
        balance: balanceFormatted,
        balanceUSD,
      }
    } catch (error) {
      console.error(`Error getting native balance for ${chain}:`, error)
      // Return mock data on error for simulation
      return {
        balance: (Math.random() * 5).toFixed(4),
        balanceUSD: (Math.random() * 10000).toFixed(2),
      }
    }
  }

  // Get ERC20 token balance
  async getTokenBalance(
    chain: string,
    tokenAddress: Address,
    userAddress: Address,
  ): Promise<{ balance: string; balanceUSD: string; decimals: number; symbol: string }> {
    try {
      const client = this.clients[chain]
      if (!client) throw new Error(`Unsupported chain: ${chain}`)

      const contract = getContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        client,
      })

      const [balance, decimals, symbol] = await Promise.all([
        contract.read.balanceOf([userAddress]),
        contract.read.decimals(),
        contract.read.symbol(),
      ])

      const balanceFormatted = formatUnits(balance, decimals)

      // Mock token prices (in production, use price feeds)
      const mockTokenPrices: Record<string, number> = {
        USDC: 1.0,
        USDT: 1.0,
        WETH: 2400,
        WBTC: 43000,
      }

      const priceUSD = mockTokenPrices[symbol] || 1
      const balanceUSD = (Number.parseFloat(balanceFormatted) * priceUSD).toFixed(2)

      return {
        balance: balanceFormatted,
        balanceUSD,
        decimals,
        symbol,
      }
    } catch (error) {
      console.error(`Error getting token balance for ${chain}:`, error)
      // Return mock data on error for simulation
      return {
        balance: (Math.random() * 1000).toFixed(2),
        balanceUSD: (Math.random() * 1000).toFixed(2),
        decimals: 6,
        symbol: "MOCK",
      }
    }
  }

  // Simulate transaction gas estimation
  async estimateGas(
    chain: string,
    from: Address,
    to: Address,
    value?: bigint,
    data?: `0x${string}`,
  ): Promise<{ gasLimit: string; gasPrice: string; gasCostETH: string; gasCostUSD: string }> {
    try {
      const client = this.clients[chain]
      if (!client) throw new Error(`Unsupported chain: ${chain}`)

      const [gasPrice, gasEstimate] = await Promise.all([
        client.getGasPrice(),
        client.estimateGas({
          account: from,
          to,
          value: value || 0n,
          data,
        }),
      ])

      const gasCostWei = gasPrice * gasEstimate
      const gasCostETH = formatEther(gasCostWei)

      // Mock ETH price for USD conversion
      const ethPriceUSD = 2400
      const gasCostUSD = (Number.parseFloat(gasCostETH) * ethPriceUSD).toFixed(4)

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        gasCostETH,
        gasCostUSD,
      }
    } catch (error) {
      console.error(`Error estimating gas for ${chain}:`, error)
      // Return mock gas estimation on error
      const mockGasLimit = "21000"
      const mockGasPrice = parseUnits("20", "gwei").toString()
      const mockGasCostETH = "0.00042"
      const mockGasCostUSD = "1.01"

      return {
        gasLimit: mockGasLimit,
        gasPrice: mockGasPrice,
        gasCostETH: mockGasCostETH,
        gasCostUSD: mockGasCostUSD,
      }
    }
  }

  // Simulate DEX swap quote
  async getSwapQuote(
    chain: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<{
    amountOut: string
    priceImpact: string
    route: string[]
    gasEstimate: string
  }> {
    // Simulate DEX aggregator response
    const slippage = Math.random() * 0.01 + 0.001 // 0.1% - 1.1% slippage
    const amountOut = (Number.parseFloat(amountIn) * (1 - slippage)).toFixed(6)

    const dexes = ["Uniswap V3", "1inch", "Curve", "Balancer", "SushiSwap"]
    const selectedDex = dexes[Math.floor(Math.random() * dexes.length)]

    return {
      amountOut,
      priceImpact: (slippage * 100).toFixed(3) + "%",
      route: [tokenIn, tokenOut],
      gasEstimate: (Math.random() * 0.01 + 0.005).toFixed(6), // 0.005-0.015 ETH
    }
  }

  // Simulate cross-chain bridge quote
  async getBridgeQuote(
    fromChain: string,
    toChain: string,
    token: string,
    amount: string,
  ): Promise<{
    amountOut: string
    bridgeFee: string
    estimatedTime: string
    route: string
  }> {
    // Simulate bridge aggregator response
    const bridgeFee = Number.parseFloat(amount) * 0.001 // 0.1% bridge fee
    const amountOut = (Number.parseFloat(amount) - bridgeFee).toFixed(6)

    const bridges = ["Socket", "Hop Protocol", "Stargate", "Across", "Synapse"]
    const selectedBridge = bridges[Math.floor(Math.random() * bridges.length)]

    // Estimate time based on chains
    const timeEstimates: Record<string, number> = {
      ethereum: 15, // minutes
      base: 2,
      arbitrum: 10,
      polygon: 5,
      optimism: 7,
    }

    const avgTime = (timeEstimates[fromChain] + timeEstimates[toChain]) / 2

    return {
      amountOut,
      bridgeFee: bridgeFee.toFixed(6),
      estimatedTime: `${Math.round(avgTime)} minutes`,
      route: selectedBridge,
    }
  }

  // Simulate transaction execution
  async simulateTransaction(
    chain: string,
    from: Address,
    to: Address,
    value?: string,
    data?: `0x${string}`,
  ): Promise<{
    success: boolean
    gasUsed: string
    txHash: string
    blockNumber: string
    logs: any[]
  }> {
    try {
      const client = this.clients[chain]
      if (!client) throw new Error(`Unsupported chain: ${chain}`)

      // Get current block number for simulation
      const blockNumber = await client.getBlockNumber()

      // Simulate transaction execution (90% success rate)
      const success = Math.random() > 0.1

      if (!success) {
        throw new Error("Transaction simulation failed: Insufficient gas or reverted")
      }

      // Generate mock transaction hash
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}` as `0x${string}`

      return {
        success: true,
        gasUsed: (Math.random() * 100000 + 21000).toFixed(0),
        txHash,
        blockNumber: blockNumber.toString(),
        logs: [],
      }
    } catch (error) {
      return {
        success: false,
        gasUsed: "0",
        txHash: "0x",
        blockNumber: "0",
        logs: [],
      }
    }
  }

  // Get real-time gas prices across chains
  async getGasPrices(): Promise<
    Record<string, { gwei: string; usd: string; fast: string; standard: string; safe: string }>
  > {
    const gasPrices: Record<string, any> = {}

    for (const [chainName, client] of Object.entries(this.clients)) {
      try {
        const gasPrice = await client.getGasPrice()
        const gasPriceGwei = formatUnits(gasPrice, "gwei")

        // Mock different speed tiers
        const basePrice = Number.parseFloat(gasPriceGwei)
        const fast = (basePrice * 1.2).toFixed(1)
        const standard = basePrice.toFixed(1)
        const safe = (basePrice * 0.8).toFixed(1)

        // Mock USD conversion (in production, use price feeds)
        const ethPrice = 2400
        const usdCost = ((Number.parseFloat(gasPriceGwei) * 21000 * ethPrice) / 1e9).toFixed(4)

        gasPrices[chainName] = {
          gwei: gasPriceGwei,
          usd: usdCost,
          fast,
          standard,
          safe,
        }
      } catch (error) {
        // Fallback to mock data
        gasPrices[chainName] = {
          gwei: (Math.random() * 50 + 10).toFixed(1),
          usd: (Math.random() * 2 + 0.5).toFixed(4),
          fast: (Math.random() * 60 + 15).toFixed(1),
          standard: (Math.random() * 50 + 10).toFixed(1),
          safe: (Math.random() * 40 + 8).toFixed(1),
        }
      }
    }

    return gasPrices
  }

  // Check if address is a contract
  async isContract(chain: string, address: Address): Promise<boolean> {
    try {
      const client = this.clients[chain]
      if (!client) return false

      const code = await client.getCode({ address })
      return code !== undefined && code !== "0x"
    } catch (error) {
      return false
    }
  }

  // Get token information
  async getTokenInfo(
    chain: string,
    tokenAddress: Address,
  ): Promise<{
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    isContract: boolean
  }> {
    try {
      const client = this.clients[chain]
      if (!client) throw new Error(`Unsupported chain: ${chain}`)

      const contract = getContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        client,
      })

      const [name, symbol, decimals] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        contract.read.decimals(),
      ])

      const isContract = await this.isContract(chain, tokenAddress)

      return {
        name,
        symbol,
        decimals,
        totalSupply: "1000000000", // Mock total supply
        isContract,
      }
    } catch (error) {
      console.error(`Error getting token info for ${chain}:`, error)
      return {
        name: "Unknown Token",
        symbol: "UNK",
        decimals: 18,
        totalSupply: "0",
        isContract: false,
      }
    }
  }
}

// Singleton instance
export const blockchainService = new BlockchainService()
