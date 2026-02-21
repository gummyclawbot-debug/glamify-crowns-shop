import { prisma } from '@/lib/prisma'

const LEGACY_FREE_SHIPPING_THRESHOLD = 50
const LEGACY_FLAT_SHIPPING = 5

export interface CheckoutInputItem {
  id: string
  quantity: number
  variantSelections?: Record<string, string>
  personalizationText?: string
  name?: string
  image?: string
  price?: number
}

export interface PricedCheckoutItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variantSelections?: Record<string, string>
  personalizationText?: string
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 0
  return Math.max(0, Math.floor(quantity))
}

function normalizeState(state?: string) {
  return (state || '').trim().toUpperCase()
}

export async function calculateCheckoutPricing(rawItems: CheckoutInputItem[], shippingState?: string) {
  const items = (rawItems || [])
    .map((item) => ({ ...item, quantity: normalizeQuantity(item.quantity) }))
    .filter((item) => item.id && item.quantity > 0)

  if (items.length === 0) {
    throw new Error('No valid items provided')
  }

  const uniqueIds = [...new Set(items.map((i) => i.id))]
  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      shippingProfile: {
        select: {
          id: true,
          domesticRate: true,
          additionalItemRate: true,
          freeShippingEnabled: true,
          freeShippingMinimum: true,
          processingTimeMin: true,
          processingTimeMax: true,
        },
      },
    },
  })

  const productById = new Map(products.map((p) => [p.id, p]))

  const pricedItems: PricedCheckoutItem[] = items.map((item) => {
    const product = productById.get(item.id)
    if (!product) {
      throw new Error(`Product not found: ${item.id}`)
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || item.image || '',
      quantity: item.quantity,
      variantSelections: item.variantSelections,
      personalizationText: item.personalizationText,
    }
  })

  const subtotal = round2(pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0))

  const profileGroups = new Map<
    string,
    {
      qty: number
      domesticRate: number
      additionalItemRate: number
      freeShippingEnabled: boolean
      freeShippingMinimum: number | null
    }
  >()

  let fallbackQty = 0

  for (const item of pricedItems) {
    const product = productById.get(item.id)
    if (!product) continue

    const profile = product.shippingProfile
    if (!profile) {
      fallbackQty += item.quantity
      continue
    }

    const existing = profileGroups.get(profile.id)
    if (existing) {
      existing.qty += item.quantity
    } else {
      profileGroups.set(profile.id, {
        qty: item.quantity,
        domesticRate: profile.domesticRate,
        additionalItemRate: profile.additionalItemRate,
        freeShippingEnabled: profile.freeShippingEnabled,
        freeShippingMinimum: profile.freeShippingMinimum,
      })
    }
  }

  let shippingCost = 0

  for (const group of profileGroups.values()) {
    const freeEligible =
      group.freeShippingEnabled &&
      (group.freeShippingMinimum === null || subtotal >= group.freeShippingMinimum)

    if (!freeEligible) {
      shippingCost += group.domesticRate + Math.max(0, group.qty - 1) * group.additionalItemRate
    }
  }

  if (fallbackQty > 0 && subtotal < LEGACY_FREE_SHIPPING_THRESHOLD) {
    shippingCost += LEGACY_FLAT_SHIPPING
  }

  shippingCost = round2(shippingCost)

  const normalizedState = normalizeState(shippingState)
  const isMD = normalizedState === 'MD' || normalizedState === 'MARYLAND'
  const taxAmount = isMD ? round2((subtotal + shippingCost) * 0.06) : 0
  const total = round2(subtotal + shippingCost + taxAmount)

  return {
    items: pricedItems,
    subtotal,
    shippingCost,
    taxAmount,
    total,
    shippingState: normalizedState,
  }
}
