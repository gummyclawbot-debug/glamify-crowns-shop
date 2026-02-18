'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { Plus, X, Tag } from 'lucide-react'

interface Variant { type: string; value: string; priceModifier: number; stock: number; sku: string }
interface ShippingProfile { id: string; name: string }

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [shippingProfiles, setShippingProfiles] = useState<ShippingProfile[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [newVariant, setNewVariant] = useState<Variant>({ type: 'Size', value: '', priceModifier: 0, stock: 0, sku: '' })
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', compareAtPrice: '', category: '', stock: '',
    images: '', featured: false, status: 'active', tags: [] as string[],
    personalizationEnabled: false, personalizationPrompt: '', personalizationRequired: false,
    shippingProfileId: '', weightOz: '', lengthIn: '', widthIn: '', heightIn: '', processingDays: '3',
  })

  useEffect(() => {
    fetch('/api/admin/shipping').then(r => r.json()).then(setShippingProfiles).catch(() => {})
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages: string[] = []
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        if (newImages.length === files.length) setUploadedImages(prev => [...prev, ...newImages])
      }
      reader.readAsDataURL(files[i])
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && formData.tags.length < 13 && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setTagInput('')
    }
  }

  const addVariant = () => {
    if (!newVariant.value) { toast.error('Enter variant value'); return }
    setVariants([...variants, { ...newVariant }])
    setNewVariant({ ...newVariant, value: '', priceModifier: 0, stock: 0, sku: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const urlImages = formData.images.split('\n').map(u => u.trim()).filter(Boolean)
      const allImages = [...uploadedImages, ...urlImages]

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          stock: parseInt(formData.stock),
          processingDays: parseInt(formData.processingDays),
          weightOz: formData.weightOz ? parseFloat(formData.weightOz) : null,
          lengthIn: formData.lengthIn ? parseFloat(formData.lengthIn) : null,
          widthIn: formData.widthIn ? parseFloat(formData.widthIn) : null,
          heightIn: formData.heightIn ? parseFloat(formData.heightIn) : null,
          shippingProfileId: formData.shippingProfileId || null,
          images: allImages,
          variants,
        }),
      })

      if (res.ok) { toast.success('Product created!'); router.push('/admin/products') }
      else toast.error('Failed to create product')
    } catch { toast.error('Failed to create product') }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-semibold mb-2">Product Name</label>
          <input type="text" required maxLength={140} className="input-field" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Crystal Tiara Crown" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Description</label>
          <textarea required rows={4} className="input-field" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your product..." />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Price ($)</label>
            <input type="number" step="0.01" required className="input-field" value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Compare-at Price ($)</label>
            <input type="number" step="0.01" className="input-field" value={formData.compareAtPrice}
              onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })} placeholder="Original price" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Stock</label>
            <input type="number" required className="input-field" value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <input type="text" required className="input-field" value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Tiaras" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select className="input-field" value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold mb-2">Tags ({formData.tags.length}/13)</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {formData.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-3 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {tag}
                <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder="Add tag..." />
            <button type="button" onClick={addTag} className="btn-secondary text-sm">Add</button>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold mb-2">Upload Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer" />
          {uploadedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative group">
                  <Image src={img} alt={`Upload ${i + 1}`} width={150} height={150} className="w-full h-24 object-cover rounded-lg" />
                  <button type="button" onClick={() => setUploadedImages(uploadedImages.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea rows={2} className="input-field mt-3" value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="Or paste image URLs (one per line)" />
        </div>

        {/* Variants */}
        <div className="card p-4">
          <h3 className="font-bold mb-3">Variants</h3>
          {variants.length > 0 && (
            <div className="space-y-2 mb-4">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span>{v.type}: {v.value} {v.priceModifier !== 0 && `(${v.priceModifier > 0 ? '+' : ''}$${v.priceModifier})`} · Stock: {v.stock}</span>
                  <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}>
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <select className="input-field text-sm" value={newVariant.type} onChange={e => setNewVariant({ ...newVariant, type: e.target.value })}>
              <option value="Size">Size</option><option value="Color">Color</option><option value="Style">Style</option><option value="Material">Material</option>
            </select>
            <input className="input-field text-sm" placeholder="Value" value={newVariant.value} onChange={e => setNewVariant({ ...newVariant, value: e.target.value })} />
            <input type="number" step="0.01" className="input-field text-sm" placeholder="+/- $" value={newVariant.priceModifier || ''} onChange={e => setNewVariant({ ...newVariant, priceModifier: +e.target.value })} />
            <input type="number" className="input-field text-sm" placeholder="Stock" value={newVariant.stock || ''} onChange={e => setNewVariant({ ...newVariant, stock: +e.target.value })} />
            <button type="button" onClick={addVariant} className="btn-secondary text-sm flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </div>

        {/* Personalization */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <input type="checkbox" id="perz" checked={formData.personalizationEnabled}
              onChange={e => setFormData({ ...formData, personalizationEnabled: e.target.checked })} className="w-4 h-4" />
            <label htmlFor="perz" className="text-sm font-semibold">Enable Personalization</label>
          </div>
          {formData.personalizationEnabled && (
            <div className="space-y-3 pl-6">
              <input className="input-field" value={formData.personalizationPrompt}
                onChange={e => setFormData({ ...formData, personalizationPrompt: e.target.value })} placeholder="What should buyers enter? e.g. 'Enter name for engraving'" />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="przReq" checked={formData.personalizationRequired}
                  onChange={e => setFormData({ ...formData, personalizationRequired: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="przReq" className="text-sm">Required</label>
              </div>
            </div>
          )}
        </div>

        {/* Shipping & Dimensions */}
        <div className="card p-4">
          <h3 className="font-bold mb-3">Shipping & Dimensions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Shipping Profile</label>
              <select className="input-field" value={formData.shippingProfileId}
                onChange={e => setFormData({ ...formData, shippingProfileId: e.target.value })}>
                <option value="">None</option>
                {shippingProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Processing Days</label>
              <input type="number" className="input-field" value={formData.processingDays}
                onChange={e => setFormData({ ...formData, processingDays: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div><label className="block text-xs font-semibold mb-1">Weight (oz)</label>
              <input type="number" step="0.1" className="input-field" value={formData.weightOz} onChange={e => setFormData({ ...formData, weightOz: e.target.value })} /></div>
            <div><label className="block text-xs font-semibold mb-1">Length (in)</label>
              <input type="number" step="0.1" className="input-field" value={formData.lengthIn} onChange={e => setFormData({ ...formData, lengthIn: e.target.value })} /></div>
            <div><label className="block text-xs font-semibold mb-1">Width (in)</label>
              <input type="number" step="0.1" className="input-field" value={formData.widthIn} onChange={e => setFormData({ ...formData, widthIn: e.target.value })} /></div>
            <div><label className="block text-xs font-semibold mb-1">Height (in)</label>
              <input type="number" step="0.1" className="input-field" value={formData.heightIn} onChange={e => setFormData({ ...formData, heightIn: e.target.value })} /></div>
          </div>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="featured" className="w-4 h-4 text-primary" checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
          <label htmlFor="featured" className="ml-2 text-sm font-semibold">Feature on homepage</label>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
