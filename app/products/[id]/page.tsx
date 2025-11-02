import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Star, Truck, Shield } from 'lucide-react'
import AddToCartButton from '@/app/components/AddToCartButton'

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const productRaw = await prisma.product.findUnique({
    where: {
      id,
    },
  })

  if (!productRaw) {
    notFound()
  }

  // Convert images string to array
  const product = {
    ...productRaw,
    images: productRaw.images ? productRaw.images.split('|||') : []
  }

  const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            {product.featured && (
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-2">
                ⭐ Featured
              </span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-600">{product.category}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>

          <AddToCartButton product={product} />

          {/* Features */}
          <div className="mt-8 pt-8 border-t space-y-4">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-gray-600">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Handcrafted Quality</h3>
                <p className="text-sm text-gray-600">Made with love and care</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
