'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Truck, CheckCircle, Clock } from 'lucide-react'

interface OrderData {
  id: string
  orderNumber: string
  createdAt: string
  guestName: string | null
  guestEmail: string | null
  total: number
  fulfillmentStatus: string
  paymentStatus: string
  items: { quantity: number; product: { name: string } }[]
}

const TABS = [
  { key: 'all', label: 'All', icon: Package },
  { key: 'unfulfilled', label: 'New', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/orders?status=${activeTab}`)
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeTab])

  const statusColor = (s: string) => {
    if (s === 'unfulfilled') return 'bg-amber-100 text-amber-800'
    if (s === 'shipped') return 'bg-blue-100 text-blue-800'
    if (s === 'delivered') return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Orders</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <p className="text-sm font-medium">{order.guestName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{order.guestEmail}</p>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="py-4 font-semibold">${order.total.toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.fulfillmentStatus)}`}>
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
