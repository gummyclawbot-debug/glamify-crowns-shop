export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import ProductCard from '../components/ProductCard'

export const revalidate = 60

export default async function ProductsPage() {
  // PostgreSQL returns arrays natively - no conversion needed
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop All Products</h1>
        <p className="text-gray-600">Browse our complete collection of crowns and tiaras</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-600 mb-4">No products available yet</p>
          <p className="text-gray-500">Check back soon or visit the admin panel to add products</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
