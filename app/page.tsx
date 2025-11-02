import Link from 'next/link'
import { ArrowRight, Sparkles, Heart, Shield, Award, Star } from 'lucide-react'
import CrownIcon from '@/app/components/CrownIcon'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-blush/30 via-white to-sage/20">
      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-blush text-rose px-4 py-2 rounded-full text-sm font-medium">
                  ✨ Handcrafted with Love
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Feel Beautiful,
                <span className="block text-rose mt-2">Feel Confident</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover our thoughtfully designed collection of handcrafted tiaras and crowns. 
                Each piece is made with care and attention to detail, perfect for your most special moments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn-primary inline-flex items-center justify-center gap-2">
                  Shop Collection
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/products" className="btn-outline inline-flex items-center justify-center gap-2">
                  Learn Our Story
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-blush to-sage/30 rounded-3xl p-12 lg:p-20 flex items-center justify-center shadow-soft">
                <CrownIcon size={200} variant="gradient" animated={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blush rounded-2xl mx-auto">
                <Heart className="w-8 h-8 text-rose" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Handcrafted</h3>
              <p className="text-gray-600 text-sm">Made with love and attention to every detail</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sage rounded-2xl mx-auto">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quality Promise</h3>
              <p className="text-gray-600 text-sm">Premium materials that last for years</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cream rounded-2xl mx-auto">
                <Sparkles className="w-8 h-8 text-rose" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Unique Designs</h3>
              <p className="text-gray-600 text-sm">One-of-a-kind pieces you won't find elsewhere</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blush rounded-2xl mx-auto">
                <Award className="w-8 h-8 text-rose" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Trusted by 1000+</h3>
              <p className="text-gray-600 text-sm">Brides, performers, and queens love us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-20 bg-gradient-to-br from-blush/30 to-sage/30">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Made for Your Special Moments
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Every crown tells a story. Whether it's your wedding day, a milestone celebration, 
              or a moment when you just want to feel extraordinary—we're here to make you shine.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Collection Preview */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Featured Collection</h2>
            <p className="text-xl text-gray-600">Pieces our community loves most</p>
          </div>
          
          {/* Placeholder for products */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-8 space-y-4 bg-gradient-to-br from-blush/20 to-sage/20">
                <div className="aspect-square bg-white rounded-2xl flex items-center justify-center">
                  <CrownIcon size={120} variant="gradient" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Crown Collection</h3>
                <p className="text-gray-600">Discover beautiful handcrafted pieces</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Love */}
      <section className="py-20 bg-sand">
        <div className="section-container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Loved by Our Community</h2>
            <p className="text-xl text-gray-600">Real reviews from real customers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Bride",
                text: "The crown made my wedding day even more special. The quality is incredible and I'll treasure it forever!",
              },
              {
                name: "Emily R.",
                role: "Performer",
                text: "I wear these crowns for my performances and they always get compliments. Beautiful craftsmanship!",
              },
              {
                name: "Jessica L.",
                role: "Birthday Queen",
                text: "Bought this for my 30th birthday photoshoot. It made me feel like absolute royalty!",
              },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 space-y-4 shadow-softer">
                <div className="flex gap-1 text-rose">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">{review.text}</p>
                <div>
                  <p className="font-semibold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose to-primary-dark text-white">
        <div className="section-container text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">Ready to Feel Amazing?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-95">
            Browse our collection and find the perfect crown for your special moment. 
            Each piece is handcrafted with care, just for you.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-white text-rose hover:bg-gray-50 font-medium py-4 px-10 rounded-2xl transition-all duration-300 shadow-soft hover:shadow-lg">
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
