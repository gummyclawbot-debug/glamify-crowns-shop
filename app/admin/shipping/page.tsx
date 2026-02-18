'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Package } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShippingProfile {
  id: string; name: string; originZip: string; processingTimeMin: number; processingTimeMax: number
  domesticRate: number; additionalItemRate: number; freeShippingEnabled: boolean; freeShippingMinimum: number | null
}

const empty = {
  name: '', originZip: '', processingTimeMin: 1, processingTimeMax: 3,
  domesticRate: 0, additionalItemRate: 0, freeShippingEnabled: false, freeShippingMinimum: null as number | null,
}

export default function ShippingProfilesPage() {
  const [profiles, setProfiles] = useState<ShippingProfile[]>([])
  const [editing, setEditing] = useState<ShippingProfile | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/admin/shipping').then(r => r.json()).then(setProfiles)
  useEffect(() => { load() }, [])

  const startEdit = (p: ShippingProfile) => {
    setEditing(p)
    setForm({ ...p })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name || !form.originZip) { toast.error('Name and origin ZIP required'); return }
    setSaving(true)
    try {
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? { ...form, id: editing.id } : form
      await fetch('/api/admin/shipping', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      toast.success(editing ? 'Updated!' : 'Created!')
      setShowForm(false); setEditing(null); setForm(empty); load()
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Shipping Profiles</h1>
        <button onClick={() => { setEditing(null); setForm(empty); setShowForm(true) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Profile
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'New'} Shipping Profile</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Standard Shipping" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Origin ZIP</label>
              <input className="input-field" value={form.originZip} onChange={e => setForm({ ...form, originZip: e.target.value })} placeholder="21201" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Processing Min (days)</label>
              <input type="number" className="input-field" value={form.processingTimeMin} onChange={e => setForm({ ...form, processingTimeMin: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Processing Max (days)</label>
              <input type="number" className="input-field" value={form.processingTimeMax} onChange={e => setForm({ ...form, processingTimeMax: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Domestic Rate ($)</label>
              <input type="number" step="0.01" className="input-field" value={form.domesticRate} onChange={e => setForm({ ...form, domesticRate: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Additional Item Rate ($)</label>
              <input type="number" step="0.01" className="input-field" value={form.additionalItemRate} onChange={e => setForm({ ...form, additionalItemRate: +e.target.value })} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="freeShip" checked={form.freeShippingEnabled}
                onChange={e => setForm({ ...form, freeShippingEnabled: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="freeShip" className="text-sm font-semibold">Free Shipping</label>
              {form.freeShippingEnabled && (
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-sm">Min order $</span>
                  <input type="number" step="0.01" className="input-field w-24" value={form.freeShippingMinimum || ''}
                    onChange={e => setForm({ ...form, freeShippingMinimum: +e.target.value || null })} />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No shipping profiles yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map(p => (
            <div key={p.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500">
                  ${p.domesticRate.toFixed(2)} base · ${p.additionalItemRate.toFixed(2)} add&apos;l · {p.processingTimeMin}-{p.processingTimeMax} days
                  {p.freeShippingEnabled && ` · Free over $${p.freeShippingMinimum?.toFixed(2) || '0'}`}
                </p>
              </div>
              <button onClick={() => startEdit(p)} className="text-primary hover:underline flex items-center gap-1 text-sm">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
