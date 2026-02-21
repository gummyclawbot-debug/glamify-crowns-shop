import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}

  if (body.fulfillmentStatus) data.fulfillmentStatus = body.fulfillmentStatus
  if (body.trackingNumber) data.trackingNumber = body.trackingNumber
  if (body.carrier) data.carrier = body.carrier
  if (body.fulfillmentStatus === 'shipped') data.shippedAt = new Date()
  if (body.fulfillmentStatus === 'delivered') data.deliveredAt = new Date()

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { items: { include: { product: true } } },
  })

  return NextResponse.json(order)
}
