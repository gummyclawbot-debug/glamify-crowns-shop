'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Truck, Printer, Package } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ShippingAddr {
  name: string; line1: string; line2: string; city: string; state: string; zip: string; country: string
}

interface OrderDetail {
  id: string; orderNumber: string; createdAt: string; guestName: string | null; guestEmail: string | null
  subtotal: number; shippingCost: number; taxAmount: number; total: number
  shippingAddress: ShippingAddr; paymentStatus: string; fulfillmentStatus: string
  trackingNumber: string | null; carrier: string | null; stripePaymentId: string | null
  paidAt: string | null; shippedAt: string | null
  items: { id: string; quantity: number; unitPrice: number; total: number; variantSelections: Record<string, string> | null; personalizationText: string | null; product: { name: string; images: string[] } }[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShipForm, setShowShipForm] = useState(false)
  const [tracking, setTracking] = useState('')
  const [carrier, setCarrier] = useState('USPS')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then(r => r.json())
      .then(data => { setOrder(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const markShipped = async () => {
    if (!tracking) { toast.error('Enter tracking number'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus: 'shipped', trackingNumber: tracking, carrier }),
      })
      const updated = await res.json()
      setOrder(updated)
      setShowShipForm(false)
      toast.success('Marked as shipped!')
    } catch { toast.error('Failed to update') }
    setSaving(false)
  }

  const markDelivered = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus: 'delivered' }),
      })
      const updated = await res.json()
      setOrder(updated)
      toast.success('Marked as delivered!')
    } catch { toast.error('Failed to update') }
    setSaving(false)
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><p>Loading...</p></div>
  if (!order) return <div className="max-w-4xl mx-auto px-4 py-12"><p>Order not found</p></div>

  const addr = order.shippingAddress

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
          {order.fulfillmentStatus === 'unfulfilled' && (
            <button onClick={() => setShowShipForm(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4" /> Mark as Shipped
            </button>
          )}
          {order.fulfillmentStatus === 'shipped' && (
            <button onClick={markDelivered} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" /> Mark Delivered
            </button>
          )}
        </div>
      </div>

      {showShipForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold mb-4">Shipping Details</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Carrier</label>
              <select className="input-field" value={carrier} onChange={e => setCarrier(e.target.value)}>
                <option>USPS</option><option>UPS</option><option>FedEx</option><option>DHL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tracking Number</label>
              <input className="input-field" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking #" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={markShipped} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Confirm Shipment'}</button>
            <button onClick={() => setShowShipForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="font-bold mb-3">Customer</h3>
          <p className="text-sm">{order.guestName}</p>
          <p className="text-sm text-gray-500">{order.guestEmail}</p>
        </div>
        <div className="card p-6">
          <h3 className="font-bold mb-3">Shipping Address</h3>
          <p className="text-sm">{addr.name}</p>
          <p className="text-sm">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
          <p className="text-sm">{addr.city}, {addr.state} {addr.zip}</p>
          {order.trackingNumber && (
            <p className="text-sm mt-2 text-primary font-medium">{order.carrier}: {order.trackingNumber}</p>
          )}
        </div>
      </div>

      <div className="card p-6 mb-8">
        <h3 className="font-bold mb-4">Items</h3>
        <div className="divide-y">
          {order.items.map(item => (
            <div key={item.id} className="py-3 flex justify-between items-start">
              <div>
                <p className="font-medium">{item.product.name}</p>
                {item.variantSelections && (
                  <p className="text-sm text-gray-500">
                    {Object.entries(item.variantSelections).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </p>
                )}
                {item.personalizationText && (
                  <p className="text-sm text-purple-600 italic">&quot;{item.personalizationText}&quot;</p>
                )}
                <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
              </div>
              <p className="font-semibold">${item.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>${order.shippingCost.toFixed(2)}</span></div>
          {order.taxAmount > 0 && <div className="flex justify-between"><span>Tax</span><span>${order.taxAmount.toFixed(2)}</span></div>}
          <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold mb-3">Payment</h3>
        <p className="text-sm">Status: <span className="font-medium capitalize">{order.paymentStatus}</span></p>
        {order.stripePaymentId && <p className="text-sm text-gray-500">Stripe: {order.stripePaymentId}</p>}
        {order.paidAt && <p className="text-sm text-gray-500">Paid: {new Date(order.paidAt).toLocaleString()}</p>}
      </div>
    </div>
  )
}
