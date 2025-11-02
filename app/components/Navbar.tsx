'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Menu, X, User, Search } from 'lucide-react'
import { useCart } from '@/app/store/cartStore'
import CrownIcon from '@/app/components/CrownIcon'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-softer sticky top-0 z-50 border-b border-blush/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <CrownIcon size={40} variant="gradient" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose to-primary-dark bg-clip-text text-transparent group-hover:from-primary-dark group-hover:to-rose transition-all">
              Glamify Crowns
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-rose font-medium transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-rose font-medium transition-colors">
              Our Story
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-rose font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            <Link href="/search" className="hidden sm:block text-gray-600 hover:text-rose transition-colors">
              <Search className="w-6 h-6" />
            </Link>
            <Link href="/account" className="hidden sm:block text-gray-600 hover:text-rose transition-colors">
              <User className="w-6 h-6" />
            </Link>
            <Link href="/cart" className="relative text-gray-600 hover:text-rose transition-colors group">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-rose to-primary-dark text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-rose transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-blush/20">
            <Link
              href="/products"
              className="block text-gray-700 hover:text-rose font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="block text-gray-700 hover:text-rose font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-rose font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-blush/20 flex gap-6">
              <Link href="/search" className="text-gray-600 hover:text-rose transition-colors">
                <Search className="w-6 h-6" />
              </Link>
              <Link href="/account" className="text-gray-600 hover:text-rose transition-colors">
                <User className="w-6 h-6" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
