"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Calendar, DollarSign, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { CreateSubscriptionModal } from "./create-subscription-modal"
import { RoutePreviewModal } from "./route-preview-modal"
import { ExecutionLogModal } from "./execution-log-modal"
import { format } from "date-fns"

interface Subscription {
  id: string
  name: string
  tokenSymbol: string
  amount: string
  frequency: string
  fromChain: string
  toChain: string
  receiverAddress: string
  nextRunDate: string
  isActive: boolean
  lastExecution?: {
    status: string
    txHash?: string
  }
}

interface SubscriptionDashboardProps {
  onBack: () => void
}

export function SubscriptionDashboard({ onBack }: SubscriptionDashboardProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data - in production, fetch from API
  useEffect(() => {
    const mockSubscriptions: Subscription[] = [
      {
        id: "1",
        name: "Monthly Savings",
        tokenSymbol: "USDC",
        amount: "100",
        frequency: "monthly",
        fromChain: "base",
        toChain: "arbitrum",
        receiverAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9",
        nextRunDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        lastExecution: { status: "success", txHash: "0xabc123..." },
      },
      {
        id: "2",
        name: "DeFi Investment",
        tokenSymbol: "ETH",
        amount: "0.1",
        frequency: "weekly",
        fromChain: "ethereum",
        toChain: "polygon",
        receiverAddress: "0x8ba1f109551bD432803012645Hac136c22C501e",
        nextRunDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        lastExecution: { status: "pending" },
      },
      {
        id: "3",
        name: "Gaming Rewards",
        tokenSymbol: "USDT",
        amount: "50",
        frequency: "daily",
        fromChain: "base",
        toChain: "base",
        receiverAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        nextRunDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false,
        lastExecution: { status: "failed" },
      },
    ]

    setTimeout(() => {
      setSubscriptions(mockSubscriptions)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-chart-2" />
      case "pending":
        return <Clock className="w-4 h-4 text-chart-1" />
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
            Success
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-chart-1/10 text-chart-1">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  const totalMonthlyValue = activeSubscriptions.reduce((sum, sub) => {
    const multiplier = sub.frequency === "daily" ? 30 : sub.frequency === "weekly" ? 4 : 1
    return sum + Number.parseFloat(sub.amount) * multiplier
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Subscription Dashboard</h1>
              <p className="text-muted-foreground">Manage your automated cross-chain payments</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Subscription
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="rounded-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
              <p className="text-xs text-muted-foreground">
                {subscriptions.length - activeSubscriptions.length} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMonthlyValue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Estimated monthly outflow</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h</div>
              <p className="text-xs text-muted-foreground">Gaming Rewards</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscriptions Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Your Subscriptions</CardTitle>
              <CardDescription>Manage and monitor your automated payment subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(subscription.lastExecution?.status)}
                            {subscription.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {subscription.amount} {subscription.tokenSymbol}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {subscription.fromChain}
                            </Badge>
                            →
                            <Badge variant="outline" className="text-xs">
                              {subscription.toChain}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{subscription.frequency}</TableCell>
                        <TableCell>{format(new Date(subscription.nextRunDate), "MMM dd, HH:mm")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {subscription.isActive ? (
                              <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline">Paused</Badge>
                            )}
                            {subscription.lastExecution && getStatusBadge(subscription.lastExecution.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSubscription(subscription)
                                setShowRouteModal(true)
                              }}
                            >
                              Route
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSubscription(subscription)
                                setShowLogModal(true)
                              }}
                            >
                              Logs
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateSubscriptionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false)
          // Refresh subscriptions in production
        }}
      />

      <RoutePreviewModal open={showRouteModal} onOpenChange={setShowRouteModal} subscription={selectedSubscription} />

      <ExecutionLogModal open={showLogModal} onOpenChange={setShowLogModal} subscription={selectedSubscription} />
    </div>
  )
}
