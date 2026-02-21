import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const profiles = await prisma.shippingProfile.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(profiles)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const profile = await prisma.shippingProfile.create({ data: body })
  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const { id, ...data } = body
  const profile = await prisma.shippingProfile.update({ where: { id }, data })
  return NextResponse.json(profile)
}
