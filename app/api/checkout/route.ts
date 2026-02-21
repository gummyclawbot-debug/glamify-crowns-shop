import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { calculateCheckoutPricing, CheckoutInputItem } from '@/lib/checkout-pricing'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { items, shippingAddress } = (await req.json()) as {
      items: CheckoutInputItem[]
      shippingAddress?: { state?: string }
    }

    const pricing = await calculateCheckoutPricing(items, shippingAddress?.state)
    const stripe = getStripe()

    const line_items = pricing.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
          metadata: {
            productId: item.id,
            ...(item.variantSelections ? { variants: JSON.stringify(item.variantSelections) } : {}),
            ...(item.personalizationText ? { personalization: item.personalizationText } : {}),
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    if (pricing.taxAmount > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Sales Tax (MD 6%)',
            metadata: {
              productId: 'tax-md',
            },
          },
          unit_amount: Math.round(pricing.taxAmount * 100),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Math.round(pricing.shippingCost * 100), currency: 'usd' },
            display_name: pricing.shippingCost === 0 ? 'Free Shipping' : 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      automatic_tax: { enabled: false },
      metadata: {
        items: JSON.stringify(
          pricing.items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            variantSelections: i.variantSelections,
            personalizationText: i.personalizationText,
          }))
        ),
        shippingState: pricing.shippingState,
        shippingCost: pricing.shippingCost.toFixed(2),
        taxAmount: pricing.taxAmount.toFixed(2),
        subtotal: pricing.subtotal.toFixed(2),
      },
      custom_text: {
        submit: { message: 'All sales are final. No returns or exchanges.' },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
    })

    return NextResponse.json({
      url: session.url,
      totals: {
        subtotal: pricing.subtotal,
        shippingCost: pricing.shippingCost,
        taxAmount: pricing.taxAmount,
        total: pricing.total,
      },
    })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
