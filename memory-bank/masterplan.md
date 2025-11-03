# Master Plan: Glamify Crowns Shop

> **Purpose**: Visual blueprint and single source of truth for the Glamify Crowns e-commerce platform. Use this document to verify memory bank accuracy and guide development decisions.

**Last Updated**: November 3, 2025  
**Current Phase**: MVP Complete - Production Deployed  
**Production URL**: https://glamify-crowns-shop-1mkaj2uhy-gummytrash2024-1555s-projects.vercel.app

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [User Flows](#user-flows)
4. [Authentication System](#authentication-system)
5. [Component Architecture](#component-architecture)
6. [API Routes](#api-routes)
7. [Development Workflow](#development-workflow)
8. [MVP Scope & Boundaries](#mvp-scope--boundaries)
9. [Memory Bank Integration](#memory-bank-integration)
10. [Future Roadmap](#future-roadmap)

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        UI[Next.js UI]
        Cart[Zustand Cart Store]
        LocalStorage[LocalStorage]
    end
    
    subgraph "Next.js Server"
        Pages[Pages/Routes]
        API[API Routes]
        Auth[NextAuth.js]
        Middleware[Auth Middleware]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL Database)]
    end
    
    subgraph "External Services"
        Supabase[Supabase<br/>Database Host]
    end
    
    UI --> Pages
    UI --> API
    UI --> Cart
    Cart --> LocalStorage
    Pages --> Prisma
    API --> Prisma
    API --> Auth
    Middleware --> Auth
    Prisma --> DB
    DB --> Supabase
    
    style UI fill:#e1f5ff
    style Pages fill:#fff4e1
    style API fill:#ffe1e1
    style Auth fill:#e1ffe1
    style DB fill:#f0e1ff
    style Cart fill:#ffe1f5
```

### Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        A[Next.js 15]
        B[React 19]
        C[Tailwind CSS]
        D[TypeScript]
    end
    
    subgraph "State"
        E[Zustand]
        F[LocalStorage]
    end
    
    subgraph "Backend"
        G[Next.js API Routes]
        H[NextAuth.js 4.24.5]
        I[Prisma 5.22.0]
    end
    
    subgraph "Database"
        J[PostgreSQL]
        K[Supabase]
    end
    
    subgraph "DevOps"
        L[Vercel]
        M[Git/GitHub]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    E --> F
    A --> G
    G --> H
    G --> I
    I --> J
    J --> K
    A --> L
    A --> M
```

### File Structure

```
glamify-crowns-shop/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                 # Homepage (/)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   │
│   ├── products/                # Product pages
│   │   ├── page.tsx            # Catalog (/products)
│   │   └── [id]/               
│   │       └── page.tsx        # Detail (/products/[id])
│   │
│   ├── cart/                    # Shopping cart
│   │   └── page.tsx            # Cart page (/cart)
│   │
│   ├── admin/                   # Admin section
│   │   ├── page.tsx            # Dashboard (/admin)
│   │   ├── login/              
│   │   │   └── page.tsx        # Login (/admin/login)
│   │   └── products/           
│   │       ├── page.tsx        # Management (/admin/products)
│   │       └── new/            
│   │           └── page.tsx    # Create (/admin/products/new)
│   │
│   ├── api/                     # API Routes
│   │   ├── admin/              
│   │   │   ├── products/       
│   │   │   │   ├── route.ts    # GET/POST products
│   │   │   │   └── [id]/       
│   │   │   │       └── route.ts # GET/PUT/DELETE [id]
│   │   │   └── stats/          
│   │   │       └── route.ts    # Dashboard stats
│   │   └── auth/               
│   │       └── [...nextauth]/  # NextAuth.js
│   │
│   ├── components/              # Reusable components
│   │   ├── Navbar.tsx          
│   │   ├── Footer.tsx          
│   │   ├── ProductCard.tsx     
│   │   ├── AddToCartButton.tsx 
│   │   └── CrownIcon.tsx       
│   │
│   └── store/                   # State management
│       └── cartStore.ts         # Zustand cart store
│
├── lib/                         # Utilities
│   ├── prisma.ts               # Prisma client
│   └── auth.ts                 # Auth config
│
├── prisma/                      # Database
│   └── schema.prisma           # Schema definition
│
├── memory-bank/                 # Project documentation
│   ├── projectbrief.md         
│   ├── productContext.md       
│   ├── activeContext.md        
│   ├── systemPatterns.md       
│   ├── techContext.md          
│   ├── progress.md             
│   └── masterplan.md           # This file
│
├── scripts/                     # Admin scripts
│   ├── create-admin.ts         
│   └── reset-admin.ts          
│
├── types/                       # TypeScript types
│   └── next-auth.d.ts          
│
└── [config files]              # next.config.js, etc.
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Order : places
    Order ||--|{ OrderItem : contains
    Product ||--o{ OrderItem : "ordered in"
    
    User {
        string id PK
        string email UK
        string password
        string name
        boolean isAdmin
        datetime createdAt
        datetime updatedAt
    }
    
    Product {
        string id PK
        string name
        string description
        float price
        string[] images
        string category
        int stock
        boolean featured
        datetime createdAt
        datetime updatedAt
    }
    
    Order {
        string id PK
        string userId FK
        float total
        string status
        string shippingAddress
        string stripePaymentId
        datetime createdAt
        datetime updatedAt
    }
    
    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        float price
        datetime createdAt
    }
```

### Database Models Detail

#### **User Model** (✅ Fully Implemented)
- **Purpose**: Admin authentication
- **Status**: Active in production
- **Fields**:
  - `id`: Unique identifier (CUID)
  - `email`: Login credential (unique)
  - `password`: Bcrypt hashed (10 salt rounds)
  - `name`: Display name (optional)
  - `isAdmin`: Admin flag (required: true)
  - `orders`: Relation to future orders
  - `createdAt`, `updatedAt`: Timestamps

#### **Product Model** (✅ Fully Implemented)
- **Purpose**: Product catalog
- **Status**: Active in production
- **Fields**:
  - `id`: Unique identifier (CUID)
  - `name`: Product name
  - `description`: Product description
  - `price`: Price as Float
  - `images`: Array of base64 strings (PostgreSQL native)
  - `category`: Product category
  - `stock`: Inventory count
  - `featured`: Featured product flag
  - `orderItems`: Relation to future order items
  - `createdAt`, `updatedAt`: Timestamps

#### **Order Model** (📋 Structure Ready - Not Used)
- **Purpose**: Customer orders (future)
- **Status**: Schema defined, not yet implemented
- **Fields**:
  - `id`: Unique identifier (CUID)
  - `userId`: Customer reference
  - `items`: Order items relation
  - `total`: Order total
  - `status`: Order status (pending/processing/shipped/delivered)
  - `shippingAddress`: JSON string
  - `stripePaymentId`: Payment reference (optional)
  - `createdAt`, `updatedAt`: Timestamps

#### **OrderItem Model** (📋 Structure Ready - Not Used)
- **Purpose**: Line items in orders (future)
- **Status**: Schema defined, not yet implemented
- **Fields**:
  - `id`: Unique identifier (CUID)
  - `orderId`: Order reference
  - `productId`: Product reference
  - `quantity`: Item quantity
  - `price`: Price at time of purchase
  - `createdAt`: Timestamp

### Database Technology

**PostgreSQL via Supabase**
- **Host**: AWS us-east-1
- **Features Used**:
  - Native array support (`String[]`)
  - ACID transactions
  - Connection pooling
  - Automatic backups
  - Point-in-time recovery
- **Advantages**:
  - Production-grade reliability
  - No workarounds needed for arrays
  - Excellent concurrent access
  - Easy to scale

---

## User Flows

### Customer Journey (Current MVP)

```mermaid
flowchart TD
    Start([Customer Visits Site]) --> Home[View Homepage]
    Home --> Browse[Browse Products]
    Browse --> Filter{Search/Filter<br/>Products?}
    Filter -->|Yes| Search[Filter by Category]
    Filter -->|No| ViewList[View Product List]
    Search --> ViewList
    
    ViewList --> SelectProduct[Click Product Card]
    SelectProduct --> ProductDetail[View Product Detail]
    
    ProductDetail --> CheckStock{Product<br/>In Stock?}
    CheckStock -->|No| OutOfStock[See Out of Stock]
    CheckStock -->|Yes| AddCart[Add to Cart]
    
    AddCart --> Toast[See Success Toast]
    Toast --> ContinueShopping{Continue<br/>Shopping?}
    ContinueShopping -->|Yes| Browse
    ContinueShopping -->|No| ViewCart[Go to Cart]
    
    OutOfStock --> ContinueShopping
    
    ViewCart --> ReviewCart[Review Cart Items]
    ReviewCart --> UpdateCart{Update<br/>Cart?}
    UpdateCart -->|Change Quantity| UpdateQty[Update Quantities]
    UpdateCart -->|Remove Item| RemoveItem[Remove Items]
    UpdateCart -->|Done| CheckoutFuture[Checkout<br/>Not Yet Implemented]
    
    UpdateQty --> ReviewCart
    RemoveItem --> ReviewCart
    
    CheckoutFuture -.->|Future| Payment[Payment Processing]
    
    style Start fill:#e1f5ff
    style Home fill:#e1f5ff
    style Browse fill:#e1f5ff
    style ViewCart fill:#ffe1e1
    style AddCart fill:#e1ffe1
    style CheckoutFuture fill:#ffffe1,stroke-dasharray: 5 5
    style Payment fill:#ffffe1,stroke-dasharray: 5 5
```

### Admin Workflow

```mermaid
flowchart TD
    AdminStart([Admin User]) --> Login[Navigate to /admin/login]
    Login --> EnterCreds[Enter Email & Password]
    EnterCreds --> Submit[Submit Form]
    
    Submit --> Verify{Valid<br/>Credentials?}
    Verify -->|No| LoginError[Show Error Message]
    LoginError --> EnterCreds
    
    Verify -->|Yes| CheckAdmin{isAdmin<br/>= true?}
    CheckAdmin -->|No| Unauthorized[Access Denied]
    CheckAdmin -->|Yes| CreateSession[Create JWT Session]
    
    CreateSession --> Dashboard[Admin Dashboard]
    
    Dashboard --> ViewStats[View Statistics]
    Dashboard --> ManageProducts[Manage Products]
    
    ManageProducts --> ProductList[View Product List]
    
    ProductList --> Action{Choose<br/>Action}
    Action -->|Create| NewProduct[Create New Product]
    Action -->|Edit| EditProduct[Edit Product]
    Action -->|Delete| DeleteProduct[Delete Product]
    
    NewProduct --> ProductForm[Fill Product Form]
    ProductForm --> UploadImages[Upload Images<br/>from Computer]
    UploadImages --> Preview[Preview Images]
    Preview --> SaveProduct[Save Product]
    SaveProduct --> Success[Success Toast]
    Success --> ProductList
    
    EditProduct --> LoadProduct[Load Product Data]
    LoadProduct --> ProductForm
    
    DeleteProduct --> ConfirmDelete{Confirm<br/>Delete?}
    ConfirmDelete -->|Yes| RemoveProduct[Remove from DB]
    ConfirmDelete -->|No| ProductList
    RemoveProduct --> Success
    
    Dashboard --> Logout[Logout<br/>Not Yet Implemented]
    Logout -.->|Future| Login
    
    style AdminStart fill:#ffe1e1
    style Dashboard fill:#e1ffe1
    style CreateSession fill:#e1f5ff
    style Success fill:#e1ffe1
    style Logout fill:#ffffe1,stroke-dasharray: 5 5
```

---

## Authentication System

### NextAuth.js Flow

```mermaid
sequenceDiagram
    participant Browser
    participant LoginPage
    participant NextAuth
    participant Database
    participant JWT
    
    Browser->>LoginPage: Navigate to /admin/login
    LoginPage->>Browser: Display login form
    
    Browser->>NextAuth: POST credentials (email, password)
    NextAuth->>Database: Find user by email
    
    alt User Not Found
        Database-->>NextAuth: null
        NextAuth-->>Browser: Error: Invalid credentials
    else User Found
        Database-->>NextAuth: User object
        NextAuth->>NextAuth: Check user.isAdmin === true
        
        alt Not Admin
            NextAuth-->>Browser: Error: Unauthorized
        else Is Admin
            NextAuth->>NextAuth: bcrypt.compare(password, user.password)
            
            alt Invalid Password
                NextAuth-->>Browser: Error: Invalid credentials
            else Valid Password
                NextAuth->>JWT: Create JWT token
                JWT-->>NextAuth: Signed token
                NextAuth->>Browser: Set session cookie
                NextAuth-->>Browser: Success + session data
                Browser->>Browser: Redirect to /admin
            end
        end
    end
```

### Authentication Components

```mermaid
graph TB
    subgraph "Authentication Layer"
        A[NextAuth.js API Route]
        B[Credentials Provider]
        C[JWT Strategy]
        D[Session Callbacks]
    end
    
    subgraph "Security"
        E[Bcrypt Hashing]
        F[10 Salt Rounds]
        G[Secure Cookies]
        H[CSRF Protection]
    end
    
    subgraph "Middleware"
        I[Auth Middleware]
        J[Route Protection]
        K[Session Validation]
    end
    
    subgraph "Admin Tools"
        L[create-admin script]
        M[reset-admin script]
    end
    
    A --> B
    B --> C
    C --> D
    B --> E
    E --> F
    D --> G
    A --> H
    
    A --> I
    I --> J
    I --> K
    
    E --> L
    E --> M
    
    style A fill:#e1ffe1
    style I fill:#ffe1e1
    style E fill:#e1f5ff
```

### Admin User Management

**Creating Admin Users**:
```bash
npm run create-admin
# Prompts for: email, password, name
# Hashes password with bcrypt (10 rounds)
# Creates user with isAdmin: true
```

**Resetting Admin Passwords**:
```bash
npm run reset-admin
# Prompts for: email, new password
# Hashes new password with bcrypt
# Updates user password in database
```

**Current Status**:
- ✅ Login flow functional
- ✅ JWT session management
- ✅ Password hashing (bcrypt)
- ✅ Admin flag validation
- ⚠️ Middleware configured but disabled for dev
- 📋 Logout UI not yet implemented
- 📋 Session checks needed in admin pages

---

## Component Architecture

### Component Hierarchy

```mermaid
graph TB
    subgraph "Root Layout"
        A[app/layout.tsx]
        A --> B[Navbar]
        A --> C[Page Content]
        A --> D[Footer]
    end
    
    subgraph "Homepage"
        E[app/page.tsx<br/>Server Component]
        E --> F[Hero Section]
        E --> G[Features Grid]
        E --> H[CTA Buttons]
    end
    
    subgraph "Products"
        I[app/products/page.tsx<br/>Server Component]
        I --> J[ProductCard<br/>Server Component]
        J --> K[Product Image]
        J --> L[Product Info]
        J --> M[Link to Detail]
        
        N[app/products/[id]/page.tsx<br/>Server Component]
        N --> O[Image Gallery]
        N --> P[Product Details]
        N --> Q[AddToCartButton<br/>Client Component]
    end
    
    subgraph "Cart"
        R[app/cart/page.tsx<br/>Server Component]
        R --> S[Cart Items List]
        R --> T[Update Quantity Buttons]
        R --> U[Remove Item Buttons]
        R --> V[Total Calculation]
    end
    
    subgraph "Admin"
        W[app/admin/page.tsx<br/>Server Component]
        W --> X[Stats Cards]
        W --> Y[Quick Links]
        
        Z[app/admin/login/page.tsx<br/>Client Component]
        Z --> AA[Login Form]
        
        AB[app/admin/products/new/page.tsx<br/>Client Component]
        AB --> AC[Product Form]
        AB --> AD[Image Upload]
        AB --> AE[Image Preview]
    end
    
    subgraph "State Management"
        AF[cartStore.ts<br/>Zustand]
        AF --> AG[addItem]
        AF --> AH[removeItem]
        AF --> AI[updateQuantity]
        AF --> AJ[clearCart]
    end
    
    Q --> AF
    T --> AF
    U --> AF
    
    style A fill:#e1f5ff
    style E fill:#fff4e1
    style I fill:#fff4e1
    style N fill:#fff4e1
    style R fill:#ffe1e1
    style W fill:#ffe1e1
    style Z fill:#e1ffe1
    style AB fill:#e1ffe1
    style AF fill:#f0e1ff
```

### Server vs Client Components

```mermaid
graph LR
    subgraph "Server Components"
        A[Pages for SEO]
        B[Data Fetching]
        C[Static Content]
        D[Layout Components]
    end
    
    subgraph "Client Components"
        E[Interactive Forms]
        F[State Management]
        G[Event Handlers]
        H[Browser APIs]
    end
    
    subgraph "Pattern"
        I[Default: Server]
        J['use client' directive]
    end
    
    A --> I
    B --> I
    C --> I
    D --> I
    
    E --> J
    F --> J
    G --> J
    H --> J
    
    style A fill:#fff4e1
    style E fill:#e1ffe1
    style I fill:#e1f5ff
```

**Server Components** (Default):
- All page.tsx files (except admin/login, admin/products/new)
- Navbar, Footer, ProductCard
- Layout components

**Client Components** ('use client'):
- AddToCartButton
- Cart page interactions
- Admin login form
- Admin product creation form
- Any component using:
  - useState, useEffect
  - Event handlers (onClick, onChange)
  - Browser APIs
  - Zustand store

---

## API Routes

### API Endpoint Map

```mermaid
graph TB
    subgraph "Admin Products API"
        A["/api/admin/products"]
        A -->|GET| B[List All Products]
        A -->|POST| C[Create Product]
        
        D["/api/admin/products/[id]"]
        D -->|GET| E[Get Single Product]
        D -->|PUT| F[Update Product]
        D -->|DELETE| G[Delete Product]
    end
    
    subgraph "Admin Stats API"
        H["/api/admin/stats"]
        H -->|GET| I[Dashboard Statistics]
    end
    
    subgraph "Authentication API"
        J["/api/auth/[...nextauth]"]
        J --> K[NextAuth.js Handlers]
        K --> L[POST: signIn]
        K --> M[POST: signOut]
        K --> N[GET: session]
        K --> O[GET: providers]
    end
    
    style A fill:#e1f5ff
    style D fill:#e1f5ff
    style H fill:#ffe1e1
    style J fill:#e1ffe1
```

### API Routes Detail

#### **GET /api/admin/products**
- **Purpose**: List all products
- **Response**: Array of product objects
- **Auth**: None (should be protected in production)
- **Data**: Includes images as String[] (PostgreSQL native)

#### **POST /api/admin/products**
- **Purpose**: Create new product
- **Body**: Product data with images
- **Images**: Base64 strings in array
- **Response**: Created product object
- **Validation**: Required fields checked

#### **GET /api/admin/products/[id]**
- **Purpose**: Get single product by ID
- **Params**: Product ID
- **Response**: Product object or 404
- **Usage**: Product detail pages

#### **PUT /api/admin/products/[id]**
- **Purpose**: Update existing product
- **Params**: Product ID
- **Body**: Updated product data
- **Response**: Updated product object

#### **DELETE /api/admin/products/[id]**
- **Purpose**: Delete product
- **Params**: Product ID
- **Response**: Success message
- **Cascade**: Deletes related data

#### **GET /api/admin/stats**
- **Purpose**: Dashboard statistics
- **Response**: 
  - Total products
  - Total revenue
  - Total orders
  - Customer count
- **Note**: Currently returns mock data for orders/customers

### API Response Pattern

All API routes follow this pattern:

```typescript
// Success Response
{
  data: Product | Product[] | Stats,
  success: true
}

// Error Response
{
  error: "Error message",
  success: false
}
```

---

## Development Workflow

### Setup Process

```mermaid
flowchart TD
    Start([New Developer]) --> Clone[Clone Repository]
    Clone --> Install[npm install]
    Install --> Env[Create .env file]
    
    Env --> SetupDB[Setup Database]
    SetupDB --> Generate[npx prisma generate]
    Generate --> Push[npx prisma db push]
    
    Push --> CreateAdmin[npm run create-admin]
    CreateAdmin --> EnterDetails[Enter Email, Password, Name]
    EnterDetails --> AdminCreated[Admin User Created]
    
    AdminCreated --> Dev[npm run dev]
    Dev --> Open[Open localhost:3000]
    
    Open --> Ready[Development Ready]
    
    style Start fill:#e1f5ff
    style Ready fill:#e1ffe1
```

### Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm start                # Start production server

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma studio        # Open database GUI

# Admin Management
npm run create-admin     # Create new admin user
npm run reset-admin      # Reset admin password

# Code Quality
npm run lint             # Run ESLint
```

### Environment Variables

Required in `.env`:
```bash
# Database
DATABASE_URL="postgres://user:pass@host:5432/db?sslmode=require"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Workflow

```mermaid
flowchart LR
    A[Edit schema.prisma] --> B[npx prisma db push]
    B --> C[npx prisma generate]
    C --> D[Restart Dev Server]
    D --> E[Changes Applied]
    
    style A fill:#ffe1e1
    style E fill:#e1ffe1
```

---

## MVP Scope & Boundaries

### ✅ What's Built (Current MVP)

```mermaid
mindmap
  root((Glamify Crowns<br/>MVP))
    Customer Features
      Homepage
        Hero Section
        Features Grid
        CTA Buttons
      Product Catalog
        Grid Display
        Product Cards
        Category Labels
      Product Details
        Image Gallery
        Full Information
        Stock Status
        Add to Cart
      Shopping Cart
        View Items
        Update Quantities
        Remove Items
        Calculate Total
        LocalStorage Persist
    Admin Features
      Authentication
        Login Page
        NextAuth.js
        Bcrypt Hashing
        JWT Sessions
        Admin Scripts
      Dashboard
        Statistics
        Quick Links
      Product Management
        List Products
        Create Products
        Edit Products
        Delete Products
        Image Upload
          File Selection
          Base64 Encoding
          Multiple Images
          Image Preview
    Technical
      Database
        PostgreSQL
        Prisma ORM
        Native Arrays
        Supabase Hosted
      Frontend
        Next.js 15
        React 19
        Tailwind CSS
        TypeScript
      State
        Zustand Cart
        LocalStorage
```

### ❌ What's NOT Built (Intentionally Excluded)

**Critical Missing** (Required for Production):
- ❌ Payment processing (Stripe integration)
- ❌ Order management system
- ❌ Customer accounts (non-admin users)
- ❌ Checkout flow
- ❌ Email notifications
- ❌ Tax calculation
- ❌ Shipping integration

**Nice-to-Have Missing** (Future Enhancement):
- ❌ Product search
- ❌ Advanced filtering
- ❌ Product variants (sizes, colors)
- ❌ Coupon/discount system
- ❌ Customer reviews
- ❌ Wishlist
- ❌ Related products
- ❌ Recently viewed

**Infrastructure Missing**:
- ❌ CDN for images
- ❌ Email service
- ❌ Error monitoring
- ❌ Analytics
- ❌ Rate limiting
- ❌ CAPTCHA

### Decision Log

**Why PostgreSQL over SQLite?**
- ✅ Production-grade reliability
- ✅ Native array/JSON support
- ✅ Better concurrent access
- ✅ Easy to scale
- ❌ Requires network connection

**Why Base64 Images in Database?**
- ✅ Self-contained, no external dependencies
- ✅ Simple implementation
- ✅ No CDN costs
- ❌ ~33% larger than binary
- ❌ Increases database size

**Why Client-Side Cart (LocalStorage)?**
- ✅ Fast, instant feedback
- ✅ No server requests
- ✅ Simple implementation
- ❌ Not synced across devices
- ❌ Lost if browser data cleared

**Why NextAuth.js?**
- ✅ Industry standard
- ✅ Flexible providers
- ✅ Built-in CSRF protection
- ✅ JWT strategy efficient
- ✅ Easy to extend

---

## Memory Bank Integration

### How to Use This Master Plan

**When Starting a Session**:
1. Read this master plan first
2. Then read all 6 memory bank files
3. Cross-reference for consistency
4. Proceed with task

**When Updating Memory Bank**:
1. Make code changes
2. Update relevant memory bank file(s)
3. Check this master plan for accuracy
4. Update master plan if architecture changed
5. Commit both changes together

**Memory Bank Files & Their Relationship to Master Plan**:

```mermaid
graph TB
    A[masterplan.md<br/>Visual Blueprint]
    
    A -.verifies.-> B[projectbrief.md<br/>What & Why]
    A -.verifies.-> C[productContext.md<br/>User Experience]
    A -.verifies.-> D[activeContext.md<br/>Current State]
    A -.verifies.-> E[systemPatterns.md<br/>How It Works]
    A -.verifies.-> F[techContext.md<br/>Technologies]
    A -.verifies.-> G[progress.md<br/>What's Done]
    
    B --> H{Consistent?}
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    
    H -->|Yes| I[Memory Bank Accurate]
    H -->|No| J[Update Files]
    
    style A fill:#e1f5ff
    style I fill:#e1ffe1
    style J fill:#ffe1e1
```

### Consistency Checklist

Before updating memory bank, verify:

- [ ] System architecture matches diagrams
- [ ] Database schema matches ERD
- [ ] Component list is complete
- [ ] API routes are documented
- [ ] Technology stack is current
- [ ] MVP scope is accurate
- [ ] All features listed are implemented
- [ ] Decision log reflects reality

### When to Update Master Plan

Update this master plan when:
- ✅ Adding new features/components
- ✅ Changing database schema
- ✅ Modifying system architecture
- ✅ Adding/removing dependencies
- ✅ Changing development workflow
- ✅ Making architectural decisions
- ✅ Deploying to production
- ✅ Major refactoring

Do NOT update for:
- ❌ Minor bug fixes
- ❌ Small UI tweaks
- ❌ Copy/content changes
- ❌ Styling adjustments

---

## Future Roadmap

### Phase 1: Complete MVP ✅
- [x] Product catalog
- [x] Shopping cart
- [x] Admin dashboard
- [x] Admin authentication
- [x] Image upload
- [x] Basic inventory

### Phase 2: E-commerce Essentials (Next Steps)
- [ ] Customer authentication
- [ ] Checkout flow
- [ ] Payment processing (Stripe)
- [ ] Order management
- [ ] Email notifications
- [ ] Enable authentication middleware

### Phase 3: Enhanced Features
- [ ] Product search
- [ ] Advanced filtering
- [ ] Product variants
- [ ] Customer reviews
- [ ] Wishlist
- [ ] Shipping calculation

### Phase 4: Business Tools
- [ ] Discount/coupon system
- [ ] Inventory alerts
- [ ] Sales analytics
- [ ] Customer insights
- [ ] Marketing tools

### Phase 5: Scale & Optimize
- [ ] CDN for images
- [ ] Caching strategy
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] Multi-channel
