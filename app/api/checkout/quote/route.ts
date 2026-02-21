import { NextRequest, NextResponse } from 'next/server'
import { calculateCheckoutPricing, CheckoutInputItem } from '@/lib/checkout-pricing'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { items, shippingAddress } = (await req.json()) as {
      items: CheckoutInputItem[]
      shippingAddress?: { state?: string }
    }

    const pricing = await calculateCheckoutPricing(items, shippingAddress?.state)

    return NextResponse.json({
      subtotal: pricing.subtotal,
      shippingCost: pricing.shippingCost,
      taxAmount: pricing.taxAmount,
      total: pricing.total,
      shippingState: pricing.shippingState,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to calculate quote'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
