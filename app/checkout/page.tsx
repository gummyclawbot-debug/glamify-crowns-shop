'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Lock, AlertTriangle } from 'lucide-react'
import { useCart } from '@/app/store/cartStore'
import CrownIcon from '@/app/components/CrownIcon'
import toast from 'react-hot-toast'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
]

export default function CheckoutPage() {
  const { items, getTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', address: '', city: '', state: '', zip: '',
  })

  const subtotal = getTotal()
  const shippingCost = subtotal >= 50 ? 0 : 5
  const isMD = form.state === 'MD'
  const taxAmount = isMD ? Math.round((subtotal + shippingCost) * 0.06 * 100) / 100 : 0
  const total = subtotal + shippingCost + taxAmount

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!form.name || !form.email) {
      toast.error('Please fill in your name and email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: { state: form.state },
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Checkout failed')
        setLoading(false)
      }
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name *</label>
                  <input type="text" required className="input-field" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email *</label>
                  <input type="email" required className="input-field" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Street Address</label>
                <input type="text" className="input-field" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">City</label>
                  <input type="text" className="input-field" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Baltimore" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">State</label>
                  <select className="input-field" value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}>
                    <option value="">Select</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">ZIP Code</label>
                  <input type="text" className="input-field" value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="21201" />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-amber-50 border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              All sales are final. No returns or exchanges.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CrownIcon size={30} variant="gradient" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (MD 6%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Redirecting...' : 'Pay with Stripe'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              You&apos;ll be redirected to Stripe&apos;s secure payment page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
