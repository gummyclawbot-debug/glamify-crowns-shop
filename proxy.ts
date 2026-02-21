import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(_req) {
    // Proxy logic runs after authentication check
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // User must have a valid token to access protected routes
        return !!token
      }
    },
    pages: {
      signIn: "/admin/login",
    }
  }
)

// Protect all /admin routes except /admin/login
export const config = {
  matcher: [
    '/admin',
    '/admin/((?!login).*)',
  ]
}
