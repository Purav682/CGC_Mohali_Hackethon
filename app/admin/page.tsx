"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import EnhancedAdminDashboard from "@/components/admin/enhanced-admin-dashboard"
import { Header } from "@/components/layout/header"
import { ClientOnly } from "@/components/client-wrapper"
import { useAuth } from "@/components/providers/auth-provider-google"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return
      }
      
      if (user?.role !== "ADMIN") {
        router.push("/")
        return
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <Header />
      <main className="container py-8">
        <ClientOnly>
          <EnhancedAdminDashboard />
        </ClientOnly>
      </main>
    </div>
  )
}
