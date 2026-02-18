import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <XCircle className="w-20 h-20 mx-auto text-gray-400 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
      <p className="text-xl text-gray-600 mb-8">
        Your payment was cancelled. No charges were made.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/cart" className="btn-primary inline-flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Cart
        </Link>
        <Link href="/products" className="btn-secondary inline-flex items-center justify-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
