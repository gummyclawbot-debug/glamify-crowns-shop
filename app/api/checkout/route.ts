import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variantSelections?: Record<string, string>
  personalizationText?: string
}

export async function POST(req: NextRequest) {
  try {
    const { items, shippingAddress } = await req.json() as {
      items: CartItem[]
      shippingAddress?: { state?: string }
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const stripe = getStripe()

    const line_items = items.map((item) => ({
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

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingCost = subtotal >= 50 ? 0 : 5

    const shippingState = (shippingAddress?.state || '').toUpperCase()
    const isMD = shippingState === 'MD' || shippingState === 'MARYLAND'
    const taxAmount = isMD ? Math.round((subtotal + shippingCost) * 0.06 * 100) / 100 : 0

    if (taxAmount > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Sales Tax (MD 6%)',
            metadata: {
              productId: 'tax-md',
            },
          },
          unit_amount: Math.round(taxAmount * 100),
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
            fixed_amount: { amount: shippingCost * 100, currency: 'usd' },
            display_name: shippingCost === 0 ? 'Free Shipping' : 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      automatic_tax: { enabled: false },
      metadata: {
        items: JSON.stringify(items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          variantSelections: i.variantSelections,
          personalizationText: i.personalizationText,
        }))),
        shippingState,
        taxAmount: taxAmount.toFixed(2),
      },
      custom_text: {
        submit: { message: 'All sales are final. No returns or exchanges.' },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
