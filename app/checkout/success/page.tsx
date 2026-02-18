'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useCart } from '@/app/store/cartStore'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You!</h1>
      <p className="text-xl text-gray-600 mb-2">Your order has been placed successfully.</p>
      {sessionId && (
        <p className="text-sm text-gray-500 mb-6">Session: {sessionId.slice(0, 20)}...</p>
      )}

      <div className="card p-6 mb-8 text-left">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" /> What&apos;s Next?
        </h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">1.</span>
            You&apos;ll receive an email confirmation shortly.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">2.</span>
            Your order will be processed within 1-3 business days.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">3.</span>
            Estimated delivery: 3-7 business days after shipping.
          </li>
        </ul>
      </div>

      <div className="card p-4 bg-amber-50 border-amber-200 mb-8">
        <p className="text-sm text-amber-800 font-medium">All sales are final. No returns or exchanges.</p>
      </div>

      <Link href="/products" className="btn-primary inline-flex items-center gap-2">
        Continue Shopping <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-20 text-center"><p>Loading...</p></div>}>
      <SuccessContent />
    </Suspense>
  )
}
