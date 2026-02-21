import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `GC-${num}`
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
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const items = JSON.parse(session.metadata?.items || '[]')
      const shipping = session.shipping_details
      const customerEmail = session.customer_details?.email || ''
      const customerName = session.customer_details?.name || ''

      const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)
      const totalFromStripe = (session.amount_total || 0) / 100
      const shippingCost = (session.shipping_cost?.amount_total || 0) / 100

      const shippingState = (session.metadata?.shippingState || shipping?.address?.state || '').toUpperCase()
      const fallbackTax = shippingState === 'MD' || shippingState === 'MARYLAND'
        ? Math.round((subtotal + shippingCost) * 0.06 * 100) / 100
        : 0
      const metadataTax = Number(session.metadata?.taxAmount || '0')
      const taxAmount = Number.isFinite(metadataTax) && metadataTax > 0 ? metadataTax : fallbackTax
      const total = Number.isFinite(metadataTax) && metadataTax > 0
        ? totalFromStripe
        : totalFromStripe + taxAmount

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
      let exists = await prisma.order.findUnique({ where: { orderNumber } })
      while (exists) {
        orderNumber = generateOrderNumber()
        exists = await prisma.order.findUnique({ where: { orderNumber } })
      }

      await prisma.order.create({
        data: {
          orderNumber,
          guestEmail: customerEmail,
          guestName: customerName,
          subtotal,
          shippingCost,
          taxAmount,
          total: total + taxAmount,
          shippingAddress,
          paymentMethod: 'stripe',
          paymentStatus: 'paid',
          stripePaymentId: session.payment_intent as string,
          stripeSessionId: session.id,
          fulfillmentStatus: 'unfulfilled',
          paidAt: new Date(),
          items: {
            create: items.map((item: { id: string; name: string; price: number; quantity: number; variantSelections?: Record<string, string>; personalizationText?: string }) => ({
              productId: item.id,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.price * item.quantity,
              variantSelections: item.variantSelections || null,
              personalizationText: item.personalizationText || null,
            })),
          },
        },
      })

      console.log(`✅ Order ${orderNumber} created for ${customerEmail}`)
    } catch (error) {
      console.error('Error creating order:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
