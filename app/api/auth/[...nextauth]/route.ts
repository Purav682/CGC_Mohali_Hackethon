import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions }
from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Admin credentials from environment variables
        const adminEmail = process.env.ADMIN_EMAIL || "admin@civictrack.com"
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          return {
            id: "admin-1",
            email: adminEmail,
            name: "Admin User",
            role: "ADMIN",
            isVerified: true,
            emailVerified: null,
            image: null
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "CITIZEN"
        token.isVerified = user.isVerified || false
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = (token.role as "CITIZEN" | "WORKER" | "OFFICIAL" | "ADMIN") || "CITIZEN"
        session.user.isVerified = token.isVerified as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow admin credentials login
      if (account?.provider === "credentials") {
        return true
      }

      // For Google OAuth, set default role
      if (account?.provider === "google") {
        user.role = "CITIZEN"
        user.isVerified = true
        return true
      }

      return true
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  debug: process.env.NODE_ENV === "development"
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
