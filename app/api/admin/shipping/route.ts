import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const profiles = await prisma.shippingProfile.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(profiles)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const profile = await prisma.shippingProfile.create({ data: body })
  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const profile = await prisma.shippingProfile.update({ where: { id }, data })
  return NextResponse.json(profile)
}
