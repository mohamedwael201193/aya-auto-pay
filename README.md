# Aya AutoPay

AI-powered blockchain payment automation tool that enables seamless cross-chain subscription management and automated payments.

## 🚀 Features

- **Cross-Chain Subscriptions**: Automate recurring payments across multiple blockchains
- **AI Integration**: Natural language payment commands via MCP (Model Context Protocol)
- **Smart Routing**: Optimal path finding for cross-chain transactions
- **Gas Optimization**: Real-time gas price monitoring and optimization
- **Risk Management**: Advanced security scanning and MEV protection
- **Modern UI**: Clean, responsive dashboard with real-time updates

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Framer Motion** for animations

### Backend
- **Fastify** server with TypeScript
- **Prisma ORM** with SQLite database
- **viem** for blockchain interactions
- **MCP** integration for AI agents

### Blockchain Integration
- Multi-chain support (Ethereum, Arbitrum, Polygon, Base, Optimism)
- Real-time gas price monitoring
- Transaction simulation and optimization
- Cross-chain bridge integration

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd aya-autopay
\`\`\`

2. **Install dependencies**
\`\`\`bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
\`\`\`

3. **Setup database**
\`\`\`bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
cd ..
\`\`\`

4. **Start development servers**

Terminal 1 (Backend):
\`\`\`bash
cd backend
npm run dev
\`\`\`

Terminal 2 (Frontend):
\`\`\`bash
npm run dev
\`\`\`

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MCP Server: http://localhost:3001/mcp

## 🔧 Configuration

### Environment Variables

Create `.env` files in both root and backend directories:

**Root `.env`:**
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

**Backend `.env`:**
\`\`\`env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
\`\`\`

## 📚 API Documentation

### Subscription Management

#### Create Subscription
\`\`\`http
POST /api/subscription
Content-Type: application/json

{
  "recipientAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "amount": "100",
  "token": "USDC",
  "frequency": "monthly",
  "sourceChain": "ethereum",
  "destinationChain": "arbitrum"
}
\`\`\`

#### List Subscriptions
\`\`\`http
GET /api/subscription
\`\`\`

#### Update Subscription
\`\`\`http
PUT /api/subscription/:id
Content-Type: application/json

{
  "status": "paused"
}
\`\`\`

### Route Optimization

#### Get Optimal Route
\`\`\`http
POST /api/route/optimize
Content-Type: application/json

{
  "fromChain": "ethereum",
  "toChain": "arbitrum",
  "token": "USDC",
  "amount": "100"
}
\`\`\`

### Gas Management

#### Get Gas Prices
\`\`\`http
GET /api/gas/prices?chains=ethereum,arbitrum,polygon
\`\`\`

#### Estimate Gas
\`\`\`http
POST /api/gas/estimate
Content-Type: application/json

{
  "chain": "ethereum",
  "to": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "value": "1000000000000000000",
  "data": "0x"
}
\`\`\`

### Risk Assessment

#### Scan Address
\`\`\`http
POST /api/risk/scan
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "chain": "ethereum"
}
\`\`\`

## 🤖 MCP Integration

Aya AutoPay supports MCP (Model Context Protocol) for AI agent integration.

### Available Tools

1. **create_subscription** - Create new payment subscriptions
2. **list_subscriptions** - View all subscriptions
3. **update_subscription** - Modify existing subscriptions
4. **get_optimal_route** - Find best cross-chain routes
5. **estimate_gas** - Calculate transaction costs
6. **scan_address** - Security risk assessment

### Example Usage

\`\`\`typescript
// AI agent can use natural language commands like:
"Pay 100 USDC monthly to 0xABC on Arbitrum"
"List my active subscriptions"
"Pause subscription #123"
"Find cheapest route from Ethereum to Polygon for 50 USDT"
\`\`\`

### MCP Server Setup

The MCP server runs alongside the main API:

\`\`\`bash
cd backend
npm run mcp
\`\`\`

Access MCP manifest at: `http://localhost:3001/mcp/manifest`

## 🧪 Testing

### Run Demo Data

\`\`\`bash
cd backend
npm run seed
\`\`\`

This creates sample subscriptions, transactions, and user data for testing.

### Test MCP Integration

\`\`\`bash
cd backend
npm run test:mcp
\`\`\`

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)

1. Create new service on Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy with automatic builds

## 🔒 Security

- All transactions are simulated before execution
- Address risk scanning before payments
- MEV protection mechanisms
- Rate limiting on API endpoints
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Documentation: [docs.aya-autopay.com](https://docs.aya-autopay.com)
- Issues: [GitHub Issues](https://github.com/your-org/aya-autopay/issues)
- Discord: [Aya Community](https://discord.gg/aya-autopay)

---

Built with ❤️ by the Aya team
\`\`\`

```json file="" isHidden
