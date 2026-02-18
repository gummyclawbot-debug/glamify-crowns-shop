import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')

  const where = status && status !== 'all'
    ? { fulfillmentStatus: status }
    : {}

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
