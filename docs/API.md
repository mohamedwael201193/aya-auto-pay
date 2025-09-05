# Aya AutoPay API Documentation

## Base URL
\`\`\`
http://localhost:3001/api
\`\`\`

## Authentication
Currently using development mode. Production will require API keys.

## Endpoints

### Subscriptions

#### POST /subscription
Create a new subscription

**Request Body:**
\`\`\`json
{
  "recipientAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "amount": "100.00",
  "token": "USDC",
  "frequency": "monthly",
  "sourceChain": "ethereum",
  "destinationChain": "arbitrum"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "clq1234567890",
  "recipientAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "amount": "100.00",
  "token": "USDC",
  "frequency": "monthly",
  "sourceChain": "ethereum",
  "destinationChain": "arbitrum",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "nextExecution": "2024-02-15T10:30:00Z"
}
\`\`\`

#### GET /subscription
List all subscriptions

**Query Parameters:**
- `status` (optional): Filter by status (active, paused, cancelled)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
\`\`\`json
{
  "subscriptions": [...],
  "total": 25,
  "limit": 50,
  "offset": 0
}
\`\`\`

#### PUT /subscription/:id
Update subscription

**Request Body:**
\`\`\`json
{
  "status": "paused",
  "amount": "150.00"
}
\`\`\`

#### DELETE /subscription/:id
Cancel subscription

### Routes

#### POST /route/optimize
Find optimal cross-chain route

**Request Body:**
\`\`\`json
{
  "fromChain": "ethereum",
  "toChain": "arbitrum",
  "token": "USDC",
  "amount": "100.00"
}
\`\`\`

**Response:**
\`\`\`json
{
  "route": {
    "fromChain": "ethereum",
    "toChain": "arbitrum",
    "token": "USDC",
    "amount": "100.00",
    "estimatedGas": "0.008",
    "estimatedTime": "300",
    "path": [
      {
        "protocol": "Arbitrum Bridge",
        "fee": "0.001"
      }
    ]
  }
}
\`\`\`

### Gas Management

#### GET /gas/prices
Get current gas prices

**Query Parameters:**
- `chains`: Comma-separated list of chains

**Response:**
\`\`\`json
{
  "ethereum": {
    "slow": "20",
    "standard": "25",
    "fast": "35"
  },
  "arbitrum": {
    "slow": "0.1",
    "standard": "0.2",
    "fast": "0.3"
  }
}
\`\`\`

#### POST /gas/estimate
Estimate gas for transaction

**Request Body:**
\`\`\`json
{
  "chain": "ethereum",
  "to": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "value": "1000000000000000000",
  "data": "0x"
}
\`\`\`

### Risk Assessment

#### POST /risk/scan
Scan address for risks

**Request Body:**
\`\`\`json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "chain": "ethereum"
}
\`\`\`

**Response:**
\`\`\`json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "riskScore": 15,
  "riskLevel": "low",
  "flags": [],
  "recommendations": [
    "Address appears safe for transactions"
  ]
}
\`\`\`

## Error Handling

All endpoints return errors in the following format:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid recipient address format",
    "details": {
      "field": "recipientAddress",
      "value": "invalid-address"
    }
  }
}
\`\`\`

## Rate Limits

- 100 requests per minute per IP
- 1000 requests per hour per IP
- MCP endpoints: 50 requests per minute
