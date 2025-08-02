"use client"

import type React from "react"
import { createContext, useContext, ReactNode } from "react"
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"

interface AuthContextType {
  user: Session["user"] | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: Session["user"]) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  
  const isLoading = status === "loading"
  const isAuthenticated = !!session?.user
  const user = session?.user || null

  const login = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const updateUser = (updatedUser: Session["user"]) => {
    // NextAuth handles session updates automatically
    // This is here for compatibility with existing code
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
