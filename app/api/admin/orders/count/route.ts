import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const count = await prisma.order.count({ where: { fulfillmentStatus: 'unfulfilled' } })
  return NextResponse.json({ count })
}
