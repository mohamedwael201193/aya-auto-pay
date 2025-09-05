"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Zap, Shield, Globe } from "lucide-react"

interface CreateSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateSubscriptionModal({ open, onOpenChange, onSuccess }: CreateSubscriptionModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    tokenSymbol: "",
    tokenAddress: "",
    amount: "",
    receiverAddress: "",
    fromChain: "",
    toChain: "",
    frequency: "",
  })

  const chains = [
    { id: "ethereum", name: "Ethereum", icon: "⟠" },
    { id: "base", name: "Base", icon: "🔵" },
    { id: "arbitrum", name: "Arbitrum", icon: "🔷" },
    { id: "polygon", name: "Polygon", icon: "🟣" },
    { id: "optimism", name: "Optimism", icon: "🔴" },
  ]

  const tokens = [
    { symbol: "USDC", address: "0xA0b86a33E6441c8C06DD2b7c94b7E0e8c0c8c8c8", name: "USD Coin" },
    { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", name: "Ethereum" },
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", name: "Tether USD" },
    { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", name: "Wrapped Bitcoin" },
  ]

  const handleSubmit = async () => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setLoading(false)
    onSuccess()
    onOpenChange(false)
    setStep(1)
    setFormData({
      name: "",
      tokenSymbol: "",
      tokenAddress: "",
      amount: "",
      receiverAddress: "",
      fromChain: "",
      toChain: "",
      frequency: "",
    })
  }

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return formData.name && formData.tokenSymbol && formData.amount
      case 2:
        return formData.fromChain && formData.toChain && formData.receiverAddress
      case 3:
        return formData.frequency
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Subscription</DialogTitle>
          <DialogDescription>Set up automated cross-chain payments with AI optimization</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && <div className={`w-16 h-0.5 mx-2 ${step > stepNum ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Payment Details */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                  <CardDescription>Configure what you want to pay and how much</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Subscription Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Monthly Savings"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="token">Token</Label>
                      <Select
                        value={formData.tokenSymbol}
                        onValueChange={(value) => {
                          const token = tokens.find((t) => t.symbol === value)
                          setFormData({
                            ...formData,
                            tokenSymbol: value,
                            tokenAddress: token?.address || "",
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                          {tokens.map((token) => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{token.symbol}</span>
                                <span className="text-muted-foreground text-sm">{token.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Route Configuration */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Route Configuration
                  </CardTitle>
                  <CardDescription>Choose source and destination chains</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromChain">From Chain</Label>
                      <Select
                        value={formData.fromChain}
                        onValueChange={(value) => setFormData({ ...formData, fromChain: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>
                              <div className="flex items-center gap-2">
                                <span>{chain.icon}</span>
                                <span>{chain.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="toChain">To Chain</Label>
                      <Select
                        value={formData.toChain}
                        onValueChange={(value) => setFormData({ ...formData, toChain: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>
                              <div className="flex items-center gap-2">
                                <span>{chain.icon}</span>
                                <span>{chain.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="receiver">Receiver Address</Label>
                    <Input
                      id="receiver"
                      placeholder="0x..."
                      value={formData.receiverAddress}
                      onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Schedule & Review */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Schedule & Review
                  </CardTitle>
                  <CardDescription>Set frequency and review your subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="frequency">Payment Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Review Summary */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Subscription Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        Name: <span className="font-medium">{formData.name}</span>
                      </div>
                      <div>
                        Amount:{" "}
                        <span className="font-medium">
                          {formData.amount} {formData.tokenSymbol}
                        </span>
                      </div>
                      <div>
                        Route:{" "}
                        <span className="font-medium">
                          {formData.fromChain} → {formData.toChain}
                        </span>
                      </div>
                      <div>
                        Frequency: <span className="font-medium capitalize">{formData.frequency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              Previous
            </Button>

            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!isStepValid(step)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid(step) || loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Subscription
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
