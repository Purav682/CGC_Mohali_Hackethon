import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: "CITIZEN" | "WORKER" | "OFFICIAL" | "ADMIN"
      isVerified: boolean
      profile?: {
        firstName?: string
        lastName?: string
        phone?: string
        address?: string
        city?: string
        state?: string
        zipCode?: string
      }
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: "CITIZEN" | "WORKER" | "OFFICIAL" | "ADMIN"
    isVerified: boolean
    profile?: {
      firstName?: string
      lastName?: string
      phone?: string
      address?: string
      city?: string
      state?: string
      zipCode?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: "CITIZEN" | "WORKER" | "OFFICIAL" | "ADMIN"
  }
}
