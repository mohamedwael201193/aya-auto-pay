"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Shield, ArrowRight, Wallet, Globe, Bot } from "lucide-react"
import { SubscriptionDashboard } from "@/components/subscription-dashboard"
import { CreateSubscriptionModal } from "@/components/create-subscription-modal"

export default function HomePage() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (showDashboard) {
    return <SubscriptionDashboard onBack={() => setShowDashboard(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div className="animate-float" whileHover={{ scale: 1.1 }}>
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
            </motion.div>
          </div>

          <h1 className="text-5xl font-bold text-balance mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Aya AutoPay
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            AI-powered subscription and payment automation across multiple blockchains. Set it once, let AI handle the
            rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl" onClick={() => setShowCreateModal(true)}>
              Create Subscription
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 rounded-xl bg-transparent"
              onClick={() => setShowDashboard(true)}
            >
              View Dashboard
              <Wallet className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-chart-1" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
              <CardDescription>Automated cross-chain payments with optimal routing and minimal fees</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-chart-2" />
              </div>
              <CardTitle className="text-xl">Secure & Reliable</CardTitle>
              <CardDescription>
                AI-powered risk scanning and failover routes ensure your payments always go through
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-chart-3" />
              </div>
              <CardTitle className="text-xl">Multi-Chain</CardTitle>
              <CardDescription>Support for Ethereum, Base, Arbitrum, Polygon and more chains</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">$2.4M+</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">15,000+</div>
            <div className="text-sm text-muted-foreground">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">8</div>
            <div className="text-sm text-muted-foreground">Supported Chains</div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Set Up Subscription</h3>
              <p className="text-muted-foreground">Choose your token, amount, frequency, and destination chain</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Optimization</h3>
              <p className="text-muted-foreground">
                Our AI finds the best routes, checks risks, and ensures gas availability
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Execution</h3>
              <p className="text-muted-foreground">Payments execute automatically with fallback options if needed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Subscription Modal */}
      <CreateSubscriptionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false)
          setShowDashboard(true)
        }}
      />
    </div>
  )
}
