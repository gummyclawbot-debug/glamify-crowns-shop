import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Convert images array to string for SQLite
    const imagesString = Array.isArray(data.images) 
      ? data.images.join('|||') 
      : data.images
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        images: imagesString,
        category: data.category,
        stock: data.stock,
        featured: data.featured,
      },
    })
    
    // Convert images back to array for response
    const productWithArray = {
      ...product,
      images: product.images ? product.images.split('|||') : []
    }
    
    return NextResponse.json(productWithArray)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
