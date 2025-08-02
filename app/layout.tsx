import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider-google"
import { HydrationErrorBoundary } from "@/components/hydration-error-boundary"
import "@/lib/suppress-hydration-warnings"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CivicTrack - Civic Issue Reporting Platform",
  description: "Report and track civic issues in your community",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </HydrationErrorBoundary>
      </body>
    </html>
  )
}
