# Glamify Crowns — Build Plan

## Phase 1: Infrastructure + Stripe + Checkout (THIS SPRINT)

### 1A. Fresh Supabase Database
- Create new Supabase project for client
- Update Prisma schema with Etsy-style models (variants, shipping profiles, orders)
- Migrate & seed

### 1B. Stripe Setup
- Create Stripe account for client (need their email)
- Configure products API (dynamic pricing from DB)
- Implement Stripe Checkout Session
- Webhook for payment confirmation → order creation
- MD 6% tax on shipping state = MD

### 1C. Enhanced Product Model (Etsy-style)
- Up to 10 photos (drag-to-reorder)
- 2 variation types (Size + Custom) with per-variant pricing/qty/SKU
- Personalization toggle + prompt
- Tags (up to 13)
- Category taxonomy
- Compare-at-price (sale pricing with strikethrough)
- Processing time
- Weight & dimensions

### 1D. Shipping Profiles
- Fixed-rate shipping (flat per item + additional item rate)
- Free shipping toggle
- Domestic + international rates
- Processing time (1-3 days, 3-5 days, etc.)
- Estimated delivery display

### 1E. Checkout Flow (1-page, fast)
- Shipping address form
- Shipping method selection
- Stripe payment (cards, Apple Pay, Google Pay)
- Guest checkout (email only, no account required)
- Order summary with tax + shipping
- "Place Order" button
- Confirmation page + email

### 1F. Order Management (Seller Dashboard)
- New orders / shipped / delivered views
- Mark as shipped + enter tracking number
- Print packing slip
- Order detail view

---

## Phase 2: Seller Dashboard + Product Automation

### 2A. Etsy-style Listing Manager
- Single long-form page for creating/editing listings
- Photo upload with drag-reorder (move away from base64 → use Supabase Storage)
- Variation builder UI (add Size options, Color options, etc.)
- Personalization field configuration
- Tag input with suggestions
- Preview before publish
- Draft / Active / Inactive status

### 2B. Product Upload Automation Tool
- Templates: client picks a template (Crown, Tiara, Hair Accessory)
- Template pre-fills: category, tags, shipping profile, variation types
- Client just fills: title, description, photos, price, sizes
- Bulk upload: CSV import for multiple products
- AI-assisted: auto-generate description from title + photos

### 2C. Dashboard Analytics
- Today's stats: views, orders, revenue
- 30-day trend chart
- Top products by sales
- Conversion funnel

---

## Phase 3: Conversion Optimization + Polish

### 3A. Sales Psychology
- "Only X left in stock" (when qty ≤ 3)
- Sale pricing: strikethrough original + % off badge
- Free shipping badge
- "Bestseller" badge (auto-calculated)
- Recently viewed items
- Related products section
- Urgency: "X people viewing this"

### 3B. Review System
- Post-purchase review prompt (email)
- 5-star rating + text + photo upload
- Aggregate rating on listing
- Seller response capability

### 3C. Mobile UX Polish
- Thumb-friendly buttons (48px+ tap targets)
- Swipeable photo gallery
- Sticky add-to-cart bar on scroll
- Quick-view modal on catalog
- One-tap checkout for returning buyers

### 3D. SEO & Discoverability
- Meta tags, Open Graph, structured data
- Sitemap generation
- Clean URLs
- Image alt text from product data

---

## Database Schema Updates Needed

```prisma
model Product {
  id              String @id @default(cuid())
  name            String // 140 char max
  description     String // rich text
  price           Float
  compareAtPrice  Float? // for sale strikethrough
  images          String[] // URLs (Supabase Storage)
  category        String
  subcategory     String?
  tags            String[] // max 13
  stock           Int @default(0)
  featured        Boolean @default(false)
  status          String @default("active") // draft, active, inactive, sold_out
  
  // Shipping
  weightOz        Float?
  lengthIn        Float?
  widthIn         Float?
  heightIn        Float?
  processingDays  Int @default(3)
  shippingProfileId String?
  shippingProfile ShippingProfile? @relation(fields: [shippingProfileId], references: [id])
  
  // Personalization
  personalizationEnabled Boolean @default(false)
  personalizationPrompt  String?
  personalizationRequired Boolean @default(false)
  
  variants        ProductVariant[]
  orderItems      OrderItem[]
  reviews         Review[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ProductVariant {
  id          String @id @default(cuid())
  productId   String
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  type        String // "Size", "Color", etc.
  value       String // "Small", "Gold", etc.
  priceModifier Float @default(0) // +/- from base price
  stock       Int @default(0)
  sku         String?
  photoIndex  Int? // which product photo to show
}

model ShippingProfile {
  id                    String @id @default(cuid())
  name                  String
  originZip             String
  processingTimeMin     Int @default(1)
  processingTimeMax     Int @default(3)
  domesticRate          Float
  additionalItemRate    Float @default(0)
  freeShippingEnabled   Boolean @default(false)
  freeShippingMinimum   Float?
  internationalRate     Float?
  products              Product[]
  createdAt             DateTime @default(now())
}

model Order {
  id              String @id @default(cuid())
  orderNumber     String @unique // display-friendly number
  userId          String?
  user            User? @relation(fields: [userId], references: [id])
  guestEmail      String?
  guestName       String?
  
  items           OrderItem[]
  
  subtotal        Float
  shippingCost    Float
  taxAmount       Float
  discountAmount  Float @default(0)
  total           Float
  
  shippingAddress Json // { name, line1, line2, city, state, zip, country }
  billingAddress  Json?
  
  paymentMethod   String?
  paymentStatus   String @default("pending") // pending, paid, refunded
  stripePaymentId String?
  stripeSessionId String?
  
  fulfillmentStatus String @default("unfulfilled") // unfulfilled, shipped, delivered
  trackingNumber  String?
  carrier         String?
  
  noteToSeller    String?
  giftMessage     String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
}

model OrderItem {
  id              String @id @default(cuid())
  orderId         String
  order           Order @relation(fields: [orderId], references: [id])
  productId       String
  product         Product @relation(fields: [productId], references: [id])
  variantSelections Json? // { "Size": "Medium", "Color": "Gold" }
  personalizationText String?
  quantity        Int
  unitPrice       Float
  total           Float
  createdAt       DateTime @default(now())
}

model Review {
  id          String @id @default(cuid())
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  buyerName   String
  buyerEmail  String
  rating      Int // 1-5
  text        String?
  photos      String[]
  verified    Boolean @default(true)
  sellerResponse String?
  createdAt   DateTime @default(now())
}
```

## Deployment Checklist
- [ ] Fresh Supabase project created
- [ ] DATABASE_URL configured
- [ ] NEXTAUTH_SECRET set
- [ ] Stripe keys configured (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Vercel project created (glamify-crowns.vercel.app)
- [ ] Environment variables set on Vercel
- [ ] DNS/domain configured
- [ ] Test order placed end-to-end
- [ ] Client admin account created
