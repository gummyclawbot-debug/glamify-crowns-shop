import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true, shippingProfile: true },
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const data = await request.json()

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        images: Array.isArray(data.images) ? data.images : [],
        category: data.category,
        subcategory: data.subcategory || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        stock: data.stock,
        featured: data.featured || false,
        status: data.status || 'active',
        weightOz: data.weightOz || null,
        lengthIn: data.lengthIn || null,
        widthIn: data.widthIn || null,
        heightIn: data.heightIn || null,
        processingDays: data.processingDays || 3,
        shippingProfileId: data.shippingProfileId || null,
        personalizationEnabled: data.personalizationEnabled || false,
        personalizationPrompt: data.personalizationPrompt || null,
        personalizationRequired: data.personalizationRequired || false,
        ...(data.variants?.length > 0 ? {
          variants: {
            create: data.variants.map((v: { type: string; value: string; priceModifier: number; stock: number; sku?: string }) => ({
              type: v.type,
              value: v.value,
              priceModifier: v.priceModifier || 0,
              stock: v.stock || 0,
              sku: v.sku || null,
            })),
          },
        } : {}),
      },
      include: { variants: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating product:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create product', details: message }, { status: 500 })
  }
}
