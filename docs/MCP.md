# MCP Integration Guide

## Overview

Aya AutoPay supports MCP (Model Context Protocol) for seamless AI agent integration. This allows AI assistants to manage subscriptions and payments using natural language.

## Setup

1. Start the MCP server:
\`\`\`bash
cd backend
npm run mcp
\`\`\`

2. The MCP server runs on `http://localhost:3001/mcp`

3. Access the manifest at `http://localhost:3001/mcp/manifest`

## Available Tools

### create_subscription
Create a new payment subscription

**Parameters:**
- `recipientAddress` (string): Ethereum address to receive payments
- `amount` (string): Payment amount
- `token` (string): Token symbol (USDC, USDT, DAI, etc.)
- `frequency` (string): Payment frequency (daily, weekly, monthly)
- `sourceChain` (string): Source blockchain
- `destinationChain` (string): Destination blockchain

**Example:**
\`\`\`json
{
  "name": "create_subscription",
  "arguments": {
    "recipientAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    "amount": "100",
    "token": "USDC",
    "frequency": "monthly",
    "sourceChain": "ethereum",
    "destinationChain": "arbitrum"
  }
}
\`\`\`

### list_subscriptions
Retrieve all subscriptions

**Parameters:**
- `status` (optional): Filter by status

### update_subscription
Modify existing subscription

**Parameters:**
- `subscriptionId` (string): Subscription ID
- `updates` (object): Fields to update

### get_optimal_route
Find best cross-chain route

**Parameters:**
- `fromChain` (string): Source chain
- `toChain` (string): Destination chain
- `token` (string): Token symbol
- `amount` (string): Amount to transfer

### estimate_gas
Calculate transaction costs

**Parameters:**
- `chain` (string): Blockchain network
- `to` (string): Recipient address
- `value` (string): Transaction value
- `data` (optional): Transaction data

### scan_address
Security risk assessment

**Parameters:**
- `address` (string): Address to scan
- `chain` (string): Blockchain network

## Natural Language Examples

AI agents can interpret commands like:

- "Pay 100 USDC monthly to 0xABC on Arbitrum"
- "List my active subscriptions"
- "Pause subscription #123"
- "Find cheapest route from Ethereum to Polygon for 50 USDT"
- "Check if address 0xDEF is safe"
- "Estimate gas for sending 1 ETH to 0xGHI"

## Integration Example

\`\`\`typescript
import { MCPClient } from '@modelcontextprotocol/client'

const client = new MCPClient({
  serverUrl: 'http://localhost:3001/mcp'
})

// Create subscription via MCP
const result = await client.callTool('create_subscription', {
  recipientAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
  amount: '100',
  token: 'USDC',
  frequency: 'monthly',
  sourceChain: 'ethereum',
  destinationChain: 'arbitrum'
})

console.log('Subscription created:', result)
\`\`\`

## Error Handling

MCP tools return structured error responses:

\`\`\`json
{
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "Recipient address is not a valid Ethereum address",
    "details": {
      "address": "invalid-address"
    }
  }
}
\`\`\`

## Testing

Run MCP examples:
\`\`\`bash
npm run test:mcp
\`\`\`

This executes sample MCP tool calls to verify integration.
