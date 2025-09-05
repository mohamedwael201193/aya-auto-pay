import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo subscriptions
  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        amount: "100.00",
        token: "USDC",
        frequency: "monthly",
        sourceChain: "ethereum",
        destinationChain: "arbitrum",
        status: "active",
        nextExecution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    }),
    prisma.subscription.create({
      data: {
        recipientAddress: "0x8ba1f109551bD432803012645Hac136c22C57B",
        amount: "50.00",
        token: "USDT",
        frequency: "weekly",
        sourceChain: "polygon",
        destinationChain: "base",
        status: "active",
        nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
    }),
    prisma.subscription.create({
      data: {
        recipientAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        amount: "25.50",
        token: "DAI",
        frequency: "daily",
        sourceChain: "optimism",
        destinationChain: "ethereum",
        status: "paused",
        nextExecution: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      },
    }),
  ])

  console.log(`✅ Created ${subscriptions.length} demo subscriptions`)

  // Create demo transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        subscriptionId: subscriptions[0].id,
        hash: "0x1234567890abcdef1234567890abcdef12345678",
        status: "completed",
        gasUsed: "21000",
        gasPaid: "0.005",
        executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
    prisma.transaction.create({
      data: {
        subscriptionId: subscriptions[1].id,
        hash: "0xabcdef1234567890abcdef1234567890abcdef12",
        status: "completed",
        gasUsed: "45000",
        gasPaid: "0.012",
        executedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    }),
    prisma.transaction.create({
      data: {
        subscriptionId: subscriptions[0].id,
        hash: "0x567890abcdef1234567890abcdef1234567890ab",
        status: "failed",
        gasUsed: "21000",
        gasPaid: "0.003",
        executedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    }),
  ])

  console.log(`✅ Created ${transactions.length} demo transactions`)

  // Create demo routes
  const routes = await Promise.all([
    prisma.route.create({
      data: {
        fromChain: "ethereum",
        toChain: "arbitrum",
        token: "USDC",
        amount: "100.00",
        estimatedGas: "0.008",
        estimatedTime: "300",
        path: JSON.stringify([
          { protocol: "Arbitrum Bridge", fee: "0.001" },
          { protocol: "Uniswap V3", fee: "0.003" },
        ]),
      },
    }),
    prisma.route.create({
      data: {
        fromChain: "polygon",
        toChain: "base",
        token: "USDT",
        amount: "50.00",
        estimatedGas: "0.005",
        estimatedTime: "180",
        path: JSON.stringify([
          { protocol: "Polygon Bridge", fee: "0.0005" },
          { protocol: "Base Bridge", fee: "0.002" },
        ]),
      },
    }),
  ])

  console.log(`✅ Created ${routes.length} demo routes`)

  console.log("🎉 Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
