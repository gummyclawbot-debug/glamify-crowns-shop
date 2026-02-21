import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
  variantSelections?: Record<string, string>
  personalizationText?: string
}

function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `GC-${num}`
}

function normalizedSelectionEntries(selections?: Record<string, string>) {
  if (!selections) return []
  return Object.entries(selections).map(([type, value]) => [type.trim(), String(value).trim()] as const)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const existing = await prisma.order.findFirst({
        where: { stripeSessionId: session.id },
        select: { id: true, orderNumber: true },
      })

      if (existing) {
        console.log(`↩️ Duplicate webhook ignored for Stripe session ${session.id} (order ${existing.orderNumber})`)
        return NextResponse.json({ received: true, duplicate: true })
      }

      const parsedItems = JSON.parse(session.metadata?.items || '[]') as CheckoutItem[]
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        throw new Error('No checkout items in Stripe metadata')
      }

      const items = parsedItems.filter((item) => item?.id && Number(item.quantity) > 0)
      if (items.length === 0) {
        throw new Error('All checkout items are invalid')
      }

      const shipping = session.shipping_details
      const customerEmail = session.customer_details?.email || ''
      const customerName = session.customer_details?.name || ''

      const subtotalFromItems = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const subtotalFromMetadata = Number(session.metadata?.subtotal || '0')
      const subtotal = Number.isFinite(subtotalFromMetadata) && subtotalFromMetadata > 0
        ? subtotalFromMetadata
        : subtotalFromItems

      const shippingCostFromStripe = (session.shipping_cost?.amount_total || 0) / 100
      const shippingCostFromMetadata = Number(session.metadata?.shippingCost || '0')
      const shippingCost = Number.isFinite(shippingCostFromMetadata)
        ? shippingCostFromMetadata
        : shippingCostFromStripe

      const shippingState = (session.metadata?.shippingState || shipping?.address?.state || '').toUpperCase()
      const fallbackTax = shippingState === 'MD' || shippingState === 'MARYLAND'
        ? Math.round((subtotal + shippingCost) * 0.06 * 100) / 100
        : 0
      const metadataTax = Number(session.metadata?.taxAmount || '0')
      const taxAmount = Number.isFinite(metadataTax) && metadataTax > 0 ? metadataTax : fallbackTax

      const total = (session.amount_total || 0) / 100

      const shippingAddress = {
        name: shipping?.name || customerName,
        line1: shipping?.address?.line1 || '',
        line2: shipping?.address?.line2 || '',
        city: shipping?.address?.city || '',
        state: shipping?.address?.state || '',
        zip: shipping?.address?.postal_code || '',
        country: shipping?.address?.country || 'US',
      }

      // Generate unique order number
      let orderNumber = generateOrderNumber()
      let orderNumberExists = await prisma.order.findUnique({ where: { orderNumber } })
      while (orderNumberExists) {
        orderNumber = generateOrderNumber()
        orderNumberExists = await prisma.order.findUnique({ where: { orderNumber } })
      }

      const createdOrder = await prisma.$transaction(async (tx) => {
        const existingInTx = await tx.order.findFirst({
          where: { stripeSessionId: session.id },
          select: { id: true, orderNumber: true },
        })

        if (existingInTx) return existingInTx

        const productIds = [...new Set(items.map((item) => item.id))]
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            stock: true,
            variants: {
              select: {
                id: true,
                type: true,
                value: true,
                stock: true,
              },
            },
          },
        })

        const productById = new Map(products.map((p) => [p.id, p]))
        const productDecrements = new Map<string, number>()
        const variantDecrements = new Map<string, number>()

        for (const item of items) {
          const quantity = Math.max(0, Math.floor(item.quantity))
          if (quantity <= 0) {
            throw new Error(`Invalid quantity for product ${item.id}`)
          }

          const product = productById.get(item.id)
          if (!product) {
            throw new Error(`Product not found: ${item.id}`)
          }

          const nextProductQty = (productDecrements.get(item.id) || 0) + quantity
          if (product.stock < nextProductQty) {
            throw new Error(`Insufficient stock for product ${item.id}`)
          }
          productDecrements.set(item.id, nextProductQty)

          for (const [type, value] of normalizedSelectionEntries(item.variantSelections)) {
            const variant = product.variants.find((v) => v.type === type && v.value === value)
            if (!variant) {
              throw new Error(`Variant not found for product ${item.id}: ${type}=${value}`)
            }

            const nextVariantQty = (variantDecrements.get(variant.id) || 0) + quantity
            if (variant.stock < nextVariantQty) {
              throw new Error(`Insufficient stock for variant ${variant.id}`)
            }

            variantDecrements.set(variant.id, nextVariantQty)
          }
        }

        for (const [productId, qty] of productDecrements) {
          await tx.product.update({
            where: { id: productId },
            data: { stock: { decrement: qty } },
          })
        }

        for (const [variantId, qty] of variantDecrements) {
          await tx.productVariant.update({
            where: { id: variantId },
            data: { stock: { decrement: qty } },
          })
        }

        const order = await tx.order.create({
          data: {
            orderNumber,
            guestEmail: customerEmail,
            guestName: customerName,
            subtotal,
            shippingCost,
            taxAmount,
            total,
            shippingAddress,
            paymentMethod: 'stripe',
            paymentStatus: 'paid',
            stripePaymentId: session.payment_intent as string,
            stripeSessionId: session.id,
            fulfillmentStatus: 'unfulfilled',
            paidAt: new Date(),
            items: {
              create: items.map((item) => ({
                product: { connect: { id: item.id } },
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.price * item.quantity,
                ...(item.variantSelections ? { variantSelections: item.variantSelections } : {}),
                ...(item.personalizationText ? { personalizationText: item.personalizationText } : {}),
              })),
            },
          },
          select: { id: true, orderNumber: true },
        })

        return order
      })

      console.log(`✅ Order ${createdOrder.orderNumber} created for ${customerEmail}`)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        console.log(`↩️ Duplicate order write prevented for Stripe session ${session.id}`)
        return NextResponse.json({ received: true, duplicate: true })
      }

      console.error('Error creating order:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
