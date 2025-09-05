// Example MCP interactions for testing and documentation

export const mcpExamples = {
  // Create a monthly USDC subscription from Base to Arbitrum
  createSubscription: {
    method: "tools/call",
    params: {
      name: "subscription.create",
      arguments: {
        name: "Monthly Savings",
        tokenSymbol: "USDC",
        amount: "100",
        receiverAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9",
        fromChain: "base",
        toChain: "arbitrum",
        frequency: "monthly",
      },
    },
  },

  // List all subscriptions
  listSubscriptions: {
    method: "tools/call",
    params: {
      name: "subscription.list",
      arguments: {},
    },
  },

  // Cancel a subscription
  cancelSubscription: {
    method: "tools/call",
    params: {
      name: "subscription.cancel",
      arguments: {
        id: "clp123abc456def789",
      },
    },
  },

  // Get route quote for cross-chain payment
  getRouteQuote: {
    method: "tools/call",
    params: {
      name: "route.quote",
      arguments: {
        fromChain: "ethereum",
        toChain: "polygon",
        tokenIn: "USDC",
        tokenOut: "USDC",
        amountIn: "50",
        receiverAddress: "0x8ba1f109551bD432803012645Hac136c22C501e",
      },
    },
  },

  // Check gas balance
  checkGasBalance: {
    method: "tools/call",
    params: {
      name: "gas.ensure",
      arguments: {
        chain: "arbitrum",
        userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9",
        estimatedGasUSD: "0.15",
      },
    },
  },

  // Scan transaction for risks
  scanRisks: {
    method: "tools/call",
    params: {
      name: "risk.scan",
      arguments: {
        tokenAddress: "0xA0b86a33E6441c8C06DD2b7c94b7E0e8c0c8c8c8",
        receiverAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9",
        chain: "ethereum",
        amount: "1000",
      },
    },
  },
}

// Sample prompts for Aya Wallet integration
export const ayaPrompts = [
  "Pay 10 USDC monthly to 0xABC on Arbitrum",
  "List my active subscriptions",
  "Cancel subscription with ID clp123abc456def789",
  "Show me the best route to send 50 USDC from Ethereum to Polygon",
  "Check if I have enough gas on Arbitrum for a $0.15 transaction",
  "Scan this transaction for security risks before I approve it",
]
