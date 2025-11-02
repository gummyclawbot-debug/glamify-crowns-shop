# Technical Context: Glamify Crowns Shop

## Technology Stack

### Core Framework
- **Next.js 15.5.6**
  - App Router (not Pages Router)
  - React Server Components by default
  - API Routes for backend functionality
  - Built-in Image optimization

### Database & ORM
- **PostgreSQL** (Supabase hosted) - ✅ Production Ready
  - Production-grade relational database
  - Hosted on AWS us-east-1 (Supabase)
  - Native array and JSON support (no workarounds needed)
  - Connection pooling built-in
  - Automatic backups and point-in-time recovery
  - Status: Fully operational, all migrations complete
- **Prisma 5.22.0**
  - Type-safe database client
  - Migration management with `db push`
  - Schema-first development
  - PostgreSQL-optimized queries
  - Native array support in queries

### State Management
- **Zustand** with persistence middleware
  - Shopping cart state
  - LocalStorage integration
  - Minimal boilerplate

### Styling
- **Tailwind CSS 3.x**
  - Utility-first CSS
  - Custom configuration for brand colors
  - Responsive design utilities

### UI Components & Utilities
- **lucide-react**: Icon library
- **react-hot-toast**: Toast notifications for user feedback
- **Next.js Image**: Optimized image loading and transformation
- **NextAuth.js 4.24.5**: Authentication and session management
- **bcryptjs**: Password hashing (10 salt rounds)

### Development Tools
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## Development Setup

### Prerequisites
```bash
- Node.js 18+ 
- npm or yarn
- Git (for version control)
```

### Installation
```bash
cd glamify-crowns-shop
npm install
```

### Environment Variables
File: `.env`
```bash
DATABASE_URL="postgres://[user]:[password]@[host]:5432/[database]?sslmode=require"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-for-jwt-encryption"
NEXTAUTH_URL="http://localhost:3000"
```

**Active and Configured**:
- `DATABASE_URL` - Supabase PostgreSQL connection string (production-ready)
- `NEXTAUTH_SECRET` - JWT encryption key for session tokens
- `NEXTAUTH_URL` - Application base URL for authentication callbacks

**Future Enhancement**:
- Stripe keys for payment processing (structure ready)

### Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Create/update database
npx prisma db push

# Optional: View database in GUI
npx prisma studio
```

### Admin User Setup
```bash
# Create first admin user (interactive prompts)
npm run create-admin

# Reset admin password (interactive prompts)
npm run reset-admin
```

**Note**: These scripts use bcrypt to hash passwords with 10 salt rounds.

### Running Development Server
```bash
npm run dev
```
Server runs at: `http://localhost:3000` (or 3001 if 3000 is occupied)

## Key Dependencies

### Production Dependencies
```json
{
  "@prisma/client": "^5.22.0",
  "bcryptjs": "^2.4.3",
  "lucide-react": "latest",
  "next": "15.5.6",
  "next-auth": "^4.24.5",
  "react": "^19",
  "react-dom": "^19",
  "react-hot-toast": "^2.4.1",
  "zustand": "^5.0.2"
}
```

**Key Dependencies Status**:
- ✅ NextAuth.js fully configured and operational
- ✅ bcryptjs for secure password hashing
- ✅ Prisma client generated and connected
- ✅ All authentication flows working

### Development Dependencies
```json
{
  "@types/bcryptjs": "^2.4.6",
  "@types/node": "latest",
  "@types/react": "latest",
  "prisma": "^5.22.0",
  "tailwindcss": "^3.4.1",
  "typescript": "latest"
}
```

## Technical Constraints

### 1. PostgreSQL Advantages & Considerations
- **Native Arrays**: ✅ Fully supported (String[], Integer[], etc.)
- **Native JSON**: ✅ JSONB type for complex data
- **Concurrent Access**: ✅ Excellent multi-user support
- **Connection Pooling**: ✅ Built-in via Supabase
- **Constraint**: Requires network connection (hosted database)

### 2. Next.js Body Size Limit
- **Default**: 1MB request body
- **Configured**: 10MB for image uploads
- **Recommendation**: Keep images under 5MB

### 3. Base64 Image Storage
- **Pro**: Self-contained, no external dependencies
- **Con**: ~33% larger than binary
- **Limit**: Affects payload size and database size

### 4. Client-Side State
- **Cart persists** in LocalStorage
- **Cleared** if user clears browser data
- **Not synced** across devices (future: server-side sessions)

## File Structure Conventions

### Naming Conventions
- **Components**: PascalCase (`ProductCard.tsx`)
- **Utilities**: camelCase (`prisma.ts`)
- **Routes**: lowercase with hyphens (`/products/[id]`)
- **API Routes**: `route.ts` (Next.js convention)

### Import Aliases
```typescript
import { prisma } from '@/lib/prisma'          // @/ = project root
import Component from '@/app/components/...'
```

## Database Management

### Schema Location
`prisma/schema.prisma`

### Making Schema Changes
```bash
# 1. Edit schema.prisma
# 2. Push changes to PostgreSQL database
npx prisma db push

# 3. Regenerate Prisma Client
npx prisma generate
```

### Viewing Data
```bash
# Local GUI (recommended)
npx prisma studio

# Or use Supabase Dashboard
# Visit your Supabase project dashboard
```

### Database Backups
- Automatic backups via Supabase
- Manual backups: `pg_dump` utility
- Point-in-time recovery available

## Build & Deployment

### Production Build
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

### Deployment Considerations
1. **Database**: Already hosted on Supabase (production-ready)
2. **Environment**: Update `DATABASE_URL` for production if needed
3. **Connection String**: Ensure SSL mode enabled (`?sslmode=require`)
4. **Images**: Currently base64 in database, consider CDN for scale
5. **Static Assets**: Automatically optimized by Next.js

### Recommended Hosting
- **Vercel**: Native Next.js support, zero config
- **Netlify**: Good for static sites
- **Railway**: Easy database hosting
- **DigitalOcean**: Full control, manual setup

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm start            # Start production server

# Database
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Update database schema
npx prisma studio    # Open database GUI

# Admin Management
npm run create-admin # Create new admin user
npm run reset-admin  # Reset admin password

# Code Quality
npm run lint         # Run ESLint
```

## Troubleshooting

### Database Connection Errors
```
Error: Invalid DATABASE_URL
```
**Solution**: Verify `.env` has valid PostgreSQL connection string starting with `postgres://` or `postgresql://`

### Supabase Connection Issues
```
Error: Connection timeout
```
**Solution**: 
1. Check Supabase project is active
2. Verify connection pooler URL (not direct connection)
3. Ensure SSL mode is enabled (`?sslmode=require`)

### Port Already in Use
```
Port 3000 is in use
```
**Solution**: Next.js automatically tries 3001, 3002, etc.

### Prisma Client Not Generated
```
Cannot find module '@prisma/client'
```
**Solution**: Run `npx prisma generate`

### Image Upload Fails (500 Error)
```
Request body too large
```
**Solution**: Verify `next.config.js` has `bodySizeLimit: '10mb'`

### Server Component Error
```
Event handlers cannot be passed to Client Component props
```
**Solution**: Extract interactive elements to separate Client Component with `'use client'` directive

### NextAuth Session Error
```
[next-auth][error][JWT_SESSION_ERROR]
```
**Solution**: Verify `NEXTAUTH_SECRET` is set in `.env` file

### Admin User Not Found
```
No user found with this email
```
**Solution**: Run `npm run create-admin` to create an admin user first

### Password Hash Comparison Fails
```
bcrypt compare returns false
```
**Solution**: Ensure password was hashed with bcrypt.hash() when created, not stored as plain text

## Performance Optimization

### Already Implemented
1. Server Components for most pages
2. Image optimization via Next.js Image
3. Static generation where possible
4. Minimal client-side JavaScript
5. Cart state persisted locally

### Future Optimizations
1. Implement ISR (Incremental Static Regeneration)
2. Add caching headers
3. Lazy load images below fold
4. Implement virtual scrolling for large lists
5. Consider CDN for image delivery
