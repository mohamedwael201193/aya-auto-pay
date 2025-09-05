"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface ExecutionLog {
  id: string
  createdAt: string
  status: "success" | "pending" | "failed" | "retrying"
  txHash?: string
  gasUsedUSD?: string
  outputAmount?: string
  routeSteps: string
  fallbackUsed: boolean
  errorMessage?: string
  retryCount: number
}

interface ExecutionLogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: any
}

export function ExecutionLogModal({ open, onOpenChange, subscription }: ExecutionLogModalProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && subscription) {
      setLoading(true)
      // Simulate API call to get execution logs
      setTimeout(() => {
        const mockLogs: ExecutionLog[] = [
          {
            id: "1",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "success",
            txHash: "0xabc123def456789...",
            gasUsedUSD: "0.08",
            outputAmount: "99.95",
            routeSteps: JSON.stringify([
              { type: "swap", dex: "1inch", estOut: "99.99" },
              { type: "bridge", via: "Socket", estOut: "99.95" },
            ]),
            fallbackUsed: false,
            retryCount: 0,
          },
          {
            id: "2",
            createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            status: "success",
            txHash: "0xdef456abc789123...",
            gasUsedUSD: "0.12",
            outputAmount: "99.92",
            routeSteps: JSON.stringify([
              { type: "swap", dex: "Uniswap", estOut: "99.98" },
              { type: "bridge", via: "Hop", estOut: "99.92" },
            ]),
            fallbackUsed: true,
            retryCount: 1,
          },
          {
            id: "3",
            createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
            status: "failed",
            errorMessage: "Insufficient gas for bridge transaction",
            routeSteps: JSON.stringify([{ type: "swap", dex: "1inch", estOut: "99.99" }]),
            fallbackUsed: false,
            retryCount: 3,
          },
        ]
        setLogs(mockLogs)
        setLoading(false)
      }, 800)
    }
  }, [open, subscription])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-chart-2" />
      case "pending":
        return <Clock className="w-4 h-4 text-chart-1" />
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      case "retrying":
        return <RefreshCw className="w-4 h-4 text-chart-1 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
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
      case "retrying":
        return (
          <Badge variant="secondary" className="bg-chart-1/10 text-chart-1">
            Retrying
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (!subscription) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execution History</DialogTitle>
          <DialogDescription>Payment execution logs for {subscription.name}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No execution history yet</p>
                  <p className="text-sm text-muted-foreground">
                    Executions will appear here once your subscription starts running
                  </p>
                </CardContent>
              </Card>
            ) : (
              logs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <CardTitle className="text-lg">
                          {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.fallbackUsed && (
                          <Badge variant="outline" className="text-xs">
                            Fallback Used
                          </Badge>
                        )}
                        {getStatusBadge(log.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Transaction Details */}
                    {log.status === "success" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Output Amount</span>
                          <div className="font-medium">
                            {log.outputAmount} {subscription.tokenSymbol}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gas Used</span>
                          <div className="font-medium">${log.gasUsedUSD}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Retries</span>
                          <div className="font-medium">{log.retryCount}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transaction</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs">
                              {log.txHash?.slice(0, 6)}...{log.txHash?.slice(-4)}
                            </span>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {log.status === "failed" && log.errorMessage && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="font-medium text-destructive">Error</span>
                        </div>
                        <p className="text-sm text-destructive/80">{log.errorMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">Attempted {log.retryCount} retries</p>
                      </div>
                    )}

                    {/* Route Steps */}
                    <div>
                      <span className="text-sm text-muted-foreground">Route Steps</span>
                      <div className="mt-1 space-y-1">
                        {JSON.parse(log.routeSteps).map((step: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm bg-muted/30 rounded px-2 py-1">
                            <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">
                              {index + 1}
                            </span>
                            <span className="capitalize">{step.type}</span>
                            {step.dex && <span className="text-muted-foreground">via {step.dex}</span>}
                            {step.via && <span className="text-muted-foreground">via {step.via}</span>}
                            <span className="ml-auto font-medium">{step.estOut}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
