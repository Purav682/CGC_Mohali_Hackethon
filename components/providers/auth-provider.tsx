"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { User, LoginResult, authenticateUser, getUserById } from "@/lib/auth-new"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') return
        
        const storedUserId = localStorage.getItem("civictrack_user_id")
        if (storedUserId) {
          const userData = await getUserById(storedUserId)
          if (userData && userData.isVerified) {
            setUser(userData)
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("civictrack_user_id")
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        localStorage.removeItem("civictrack_user_id")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true)
    
    try {
      const result = await authenticateUser(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
        localStorage.setItem("civictrack_user_id", result.user.id)
      }
      
      return result
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "An error occurred during login"
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("civictrack_user_id")
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
