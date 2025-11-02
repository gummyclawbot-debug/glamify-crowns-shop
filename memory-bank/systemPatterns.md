# System Patterns: Glamify Crowns Shop

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: NextAuth.js v4 with JWT
- **Password Hashing**: bcryptjs
- **State Management**: Zustand (cart)
- **Styling**: Tailwind CSS
- **UI Feedback**: react-hot-toast
- **Icons**: lucide-react

### Application Structure
```
glamify-crowns-shop/
├── app/
│   ├── (routes)
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx          # Product catalog
│   │   │   └── [id]/page.tsx    # Product detail
│   │   ├── cart/page.tsx         # Shopping cart
│   │   └── admin/
│   │       ├── page.tsx          # Admin dashboard
│   │       └── products/
│   │           ├── page.tsx      # Product management
│   │           └── new/page.tsx  # Create product
│   ├── api/
│   │   └── admin/
│   │       ├── products/route.ts      # CRUD operations
│   │       ├── products/[id]/route.ts # Single product ops
│   │       └── stats/route.ts         # Statistics
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── AddToCartButton.tsx
│   └── store/
│       └── cartStore.ts          # Cart state management
├── lib/
│   └── prisma.ts                 # Prisma client
└── prisma/
    ├── schema.prisma             # Database schema
    └── dev.db                    # SQLite database
```

## Key Technical Decisions

### 1. PostgreSQL for Production-Grade Storage
**Why**: Scalability and robust features
- Hosted on Supabase (AWS us-east-1)
- Native array and JSON support
- Connection pooling built-in
- Automatic backups
- Production-ready from day one

**Benefits**:
- No need for workarounds (native arrays)
- Better concurrent access handling
- ACID compliance for transactions
- Easy to scale as business grows

### 2. Server Components by Default
**Why**: Better performance and SEO
- Pages are Server Components unless marked `'use client'`
- Server Components for data fetching
- Client Components only for interactivity
- Reduces JavaScript bundle size

**Pattern**:
```typescript
// Server Component (default)
async function ProductPage() {
  const products = await prisma.product.findMany()
  return <div>...</div>
}

// Client Component (interactive)
'use client'
function AddToCartButton() {
  const onClick = () => { /* ... */ }
  return <button onClick={onClick}>...</button>
}
```

### 3. NextAuth.js for Authentication
**Why**: Industry standard, flexible, secure
- JWT-based session management
- Credentials provider for email/password
- Easy to extend with OAuth providers
- Built-in CSRF protection
- Secure cookie handling (httpOnly, sameSite)

**Implementation Status**: ✅ Complete
- Full authentication flow operational
- User creation scripts working
- Password hashing with bcrypt (10 salt rounds)
- Admin flag validation enforced
- Middleware configured (disabled for dev testing)

**Pattern**:
```typescript
// API Route: /api/auth/[...nextauth]/route.ts
const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        // 2. Verify admin status
        if (!user || !user.isAdmin) return null
        
        // 3. Verify password with bcrypt
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        if (!isValid) return null
        
        // 4. Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: { 
    signIn: "/admin/login" 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    }
  }
}
```

### 4. Base64 Image Storage in PostgreSQL
**Why**: Self-contained, no external dependencies
- Images stored directly in database as base64 strings
- No separate file storage needed
- PostgreSQL TEXT type handles large strings efficiently
- Native array support stores multiple images per product

**Implementation**:
- Images stored as `String[]` in PostgreSQL
- Each element is a base64-encoded image
- 10MB body size limit configured in `next.config.js`
- Recommendation: Keep images under 5MB each

## Critical Implementation Patterns

### Authentication Pattern

#### User Creation (Admin Scripts)
```typescript
// scripts/create-admin.ts
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const hashedPassword = await bcrypt.hash(password, 10)
await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    isAdmin: true
  }
})
```

#### Login Flow
```typescript
// 1. Client: Submit credentials
'use client'
const result = await signIn('credentials', {
  email,
  password,
  redirect: false
})

// 2. Server: Verify and authorize
async authorize(credentials) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: credentials.email }
  })
  
  // Check admin status
  if (!user.isAdmin) return null
  
  // Verify password
  const isValid = await bcrypt.compare(
    credentials.password, 
    user.password
  )
  
  if (!isValid) return null
  
  return { id: user.id, email: user.email, name: user.name }
}

// 3. JWT Token: Store session
callbacks: {
  async jwt({ token, user }) {
    if (user) token.id = user.id
    return token
  },
  async session({ session, token }) {
    session.user.id = token.id
    return session
  }
}
```

#### Middleware Protection
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  }
})

export const config = {
  matcher: ['/admin/:path*']
}
```

#### Session Check in Components
```typescript
// Server Component
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const session = await getServerSession(authOptions)
if (!session) redirect('/admin/login')

// Client Component
'use client'
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
if (status === 'unauthenticated') redirect('/admin/login')
```


### Image Storage Pattern (PostgreSQL)
```typescript
// Storage: Direct array storage
await prisma.product.create({
  data: { 
    images: imageArray  // PostgreSQL handles arrays natively
  }
})

// Retrieval: Native array from database
const product = await prisma.product.findUnique({ where: { id } })
// product.images is already a String[] array - no conversion needed!
```

### Client/Server Component Split
**Server Components** (Data fetching):
- `/app/page.tsx` - Homepage
- `/app/products/page.tsx` - Product catalog
- `/app/products/[id]/page.tsx` - Product details
- `/app/admin/**/page.tsx` - Admin pages

**Client Components** (Interactivity):
- `/app/components/AddToCartButton.tsx` - Cart interactions
- `/app/admin/products/new/page.tsx` - Form handling
- `/app/store/cartStore.ts` - State management

### API Route Pattern (PostgreSQL)
```typescript
// GET: Fetch data (no transformation needed)
export async function GET() {
  const products = await prisma.product.findMany()
  // products.images is already an array!
  return NextResponse.json(products)
}

// POST: Store data directly
export async function POST(request: NextRequest) {
  const data = await request.json()
  const product = await prisma.product.create({
    data: {
      ...data,
      images: Array.isArray(data.images) ? data.images : []
    }
  })
  return NextResponse.json(product)
}
```

### State Management with Zustand
```typescript
// Cart store with persistence
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => { /* ... */ },
      removeItem: (id) => { /* ... */ },
      // ...
    }),
    { name: 'cart-storage' } // LocalStorage key
  )
)
```

## Database Schema

### Product Model (PostgreSQL)
```prisma
model Product {
  id          String      @id @default(cuid())
  name        String
  description String
  price       Float
  images      String[]    // PostgreSQL native array
  category    String
  stock       Int         @default(0)
  featured    Boolean     @default(false)
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

### Key Relationships
- Product ↔ OrderItem (future)
- Order ↔ User (future)
- Order ↔ OrderItem (future)

## Component Relationships

### Homepage Flow
```
HomePage (Server)
  ├─> Navbar (Server)
  ├─> Hero Section
  ├─> Features Grid
  └─> Footer (Server)
```

### Product Browsing Flow
```
ProductsPage (Server)
  └─> ProductCard[] (Server)
        └─> Link to /products/[id]
```

### Product Detail Flow
```
ProductPage (Server)
  ├─> Product Images
  ├─> Product Info
  └─> AddToCartButton (Client)
        └─> useCart hook
```

### Admin Flow
```
AdminLoginPage (Client)
  ├─> Login Form
  └─> signIn() call to NextAuth

AdminDashboard (Server)
  ├─> Session Check
  ├─> Stats Display
  └─> Link to Products Management

AdminProductsPage (Server)
  ├─> Session Check
  ├─> Product List
  └─> CRUD buttons

AdminNewProductPage (Client)
  ├─> Session Check
  ├─> Form with image upload
  └─> API call to /api/admin/products
```

## Critical Configurations

### Next.js Config
```javascript
// Increased for image uploads
experimental: {
  serverActions: {
    bodySizeLimit: '10mb'
  }
}
```

### Prisma Client Singleton
```typescript
// Prevents multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Performance Considerations

1. **Image Optimization**: Next.js Image component with automatic optimization
2. **Revalidation**: `revalidate = 60` on product pages
3. **Static Generation**: Homepage and product pages pre-rendered
4. **Client-Side Caching**: Cart persists in LocalStorage
5. **Minimal JavaScript**: Most pages are Server Components

## Error Handling Patterns

1. **API Routes**: Try-catch with appropriate status codes
2. **Form Validation**: Client-side before submission
3. **Database Errors**: Logged to console with details
4. **404 Handling**: `notFound()` for missing products
5. **Toast Notifications**: User feedback on actions
