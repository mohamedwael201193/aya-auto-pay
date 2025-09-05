import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function runDemo() {
  console.log("🚀 Running Aya AutoPay Demo...\n")

  // 1. List existing subscriptions
  console.log("📋 Current Subscriptions:")
  const subscriptions = await prisma.subscription.findMany({
    include: {
      transactions: true,
    },
  })

  subscriptions.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.amount} ${sub.token} ${sub.frequency} to ${sub.recipientAddress}`)
    console.log(`   Status: ${sub.status} | Chain: ${sub.sourceChain} → ${sub.destinationChain}`)
    console.log(`   Transactions: ${sub.transactions.length}\n`)
  })

  // 2. Show recent transactions
  console.log("💳 Recent Transactions:")
  const transactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: { executedAt: "desc" },
    include: {
      subscription: true,
    },
  })

  transactions.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.hash}`)
    console.log(`   Status: ${tx.status} | Gas: ${tx.gasPaid} ETH`)
    console.log(`   Subscription: ${tx.subscription.amount} ${tx.subscription.token}\n`)
  })

  // 3. Show available routes
  console.log("🛣️  Available Routes:")
  const routes = await prisma.route.findMany()

  routes.forEach((route, index) => {
    console.log(`${index + 1}. ${route.fromChain} → ${route.toChain}`)
    console.log(`   Token: ${route.token} | Amount: ${route.amount}`)
    console.log(`   Gas: ${route.estimatedGas} ETH | Time: ${route.estimatedTime}s\n`)
  })

  console.log("✅ Demo completed! Visit http://localhost:3000 to see the dashboard.")
}

runDemo()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
