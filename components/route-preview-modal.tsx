"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Shield, DollarSign, AlertTriangle } from "lucide-react"

interface RouteStep {
  type: "swap" | "bridge" | "transfer"
  dex?: string
  via?: string
  to?: string
  estOut: string
}

interface RouteData {
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
}

interface RoutePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: any
}

export function RoutePreviewModal({ open, onOpenChange, subscription }: RoutePreviewModalProps) {
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && subscription) {
      setLoading(true)
      // Simulate API call to get route
      setTimeout(() => {
        const mockRoute: RouteData = {
          fromChain: subscription.fromChain,
          toChain: subscription.toChain,
          tokenIn: subscription.tokenSymbol,
          tokenOut: subscription.tokenSymbol,
          amountIn: subscription.amount,
          steps: [
            {
              type: "swap",
              dex: "1inch",
              estOut: (Number.parseFloat(subscription.amount) * 0.999).toFixed(2),
            },
            {
              type: "bridge",
              via: "Socket",
              estOut: (Number.parseFloat(subscription.amount) * 0.995).toFixed(2),
            },
            {
              type: "transfer",
              to: subscription.receiverAddress,
              estOut: (Number.parseFloat(subscription.amount) * 0.995).toFixed(2),
            },
          ],
          gasEstimateUSD: "0.12",
          risk: {
            slippage: "0.5%",
            flags: [],
          },
          fallbackRoutes: [
            { via: "Hop Protocol", estOut: (Number.parseFloat(subscription.amount) * 0.992).toFixed(2) },
            { via: "Stargate", estOut: (Number.parseFloat(subscription.amount) * 0.99).toFixed(2) },
          ],
        }
        setRouteData(mockRoute)
        setLoading(false)
      }, 1000)
    }
  }, [open, subscription])

  if (!subscription) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Route Preview</DialogTitle>
          <DialogDescription>Optimal route for {subscription.name} subscription</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : routeData ? (
          <div className="space-y-6">
            {/* Route Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Route Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{routeData.amountIn}</div>
                    <div className="text-sm text-muted-foreground">
                      {routeData.tokenIn} on {routeData.fromChain}
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chart-2">
                      {routeData.steps[routeData.steps.length - 1].estOut}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {routeData.tokenOut} on {routeData.toChain}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Steps</CardTitle>
                <CardDescription>AI-optimized route with automatic failover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeData.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium capitalize">{step.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {step.dex && `via ${step.dex}`}
                          {step.via && `via ${step.via}`}
                          {step.to && `to ${step.to.slice(0, 6)}...${step.to.slice(-4)}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {step.estOut} {routeData.tokenOut}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost & Risk Analysis */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cost Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gas Fees</span>
                    <span className="font-medium">${routeData.gasEstimateUSD}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slippage</span>
                    <span className="font-medium">{routeData.risk.slippage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost</span>
                    <span className="font-medium">
                      ${(Number.parseFloat(routeData.gasEstimateUSD) + 0.05).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {routeData.risk.flags.length > 0 ? (
                    <div className="space-y-2">
                      {routeData.risk.flags.map((flag, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="text-sm">{flag}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-chart-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Low risk transaction</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Fallback Routes */}
            <Card>
              <CardHeader>
                <CardTitle>Fallback Options</CardTitle>
                <CardDescription>Alternative routes if primary fails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {routeData.fallbackRoutes.map((fallback, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm">{fallback.via}</span>
                      <Badge variant="outline">
                        {fallback.estOut} {routeData.tokenOut}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
