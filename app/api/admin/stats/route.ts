import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const [productsCount, ordersCount, customersCount] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { isAdmin: false } }),
    ])

    return NextResponse.json({
      products: productsCount,
      orders: ordersCount,
      customers: customersCount,
    })
  } catch (error) {
    return NextResponse.json(
      { products: 0, orders: 0, customers: 0 },
      { status: 200 }
    )
  }
}
