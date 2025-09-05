import type { FastifyPluginAsync } from "fastify"
import { CreateSubscriptionSchema } from "../types"
import { addDays, addWeeks, addMonths } from "date-fns"

const subscriptionRoutes: FastifyPluginAsync = async (fastify) => {
  // Create subscription
  fastify.post(
    "/create",
    {
      schema: {
        body: CreateSubscriptionSchema,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = request.body as any

      // Calculate next run date based on frequency
      let nextRunDate: Date
      switch (data.frequency) {
        case "daily":
          nextRunDate = addDays(new Date(), 1)
          break
        case "weekly":
          nextRunDate = addWeeks(new Date(), 1)
          break
        case "monthly":
          nextRunDate = addMonths(new Date(), 1)
          break
        default:
          nextRunDate = addDays(new Date(), 1)
      }

      const subscription = await fastify.prisma.subscription.create({
        data: {
          ...data,
          nextRunDate,
        },
      })

      return {
        id: subscription.id,
        message: "Subscription created successfully",
      }
    },
  )

  // List subscriptions
  fastify.get(
    "/list",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              subscriptions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    tokenSymbol: { type: "string" },
                    amount: { type: "string" },
                    frequency: { type: "string" },
                    fromChain: { type: "string" },
                    toChain: { type: "string" },
                    receiverAddress: { type: "string" },
                    nextRunDate: { type: "string" },
                    isActive: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const subscriptions = await fastify.prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          executions: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      })

      return { subscriptions }
    },
  )

  // Cancel subscription
  fastify.delete(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }

      await fastify.prisma.subscription.update({
        where: { id },
        data: { isActive: false },
      })

      return { message: "Subscription cancelled successfully" }
    },
  )

  // Get subscription details
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }

    const subscription = await fastify.prisma.subscription.findUnique({
      where: { id },
      include: {
        executions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!subscription) {
      reply.code(404)
      return { error: "Subscription not found" }
    }

    return { subscription }
  })
}

export default subscriptionRoutes
