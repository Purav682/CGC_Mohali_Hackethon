"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, MapPin } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider-google"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-white/20 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <MapPin className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
          <span className="text-xl font-bold gradient-text-primary">CivicTrack</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/issues" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
            Browse Issues
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link href="/map" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
            View Map
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link href="/report" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
            Report Issue
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link href="/help" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
            Help
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
              Admin
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4" suppressHydrationWarning>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
              <Button variant="outline" onClick={logout} className="glass-effect border-primary/30 hover:border-primary hover:bg-primary/10" suppressHydrationWarning>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:bg-primary/10" suppressHydrationWarning>Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="gradient-button" suppressHydrationWarning>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/20 glass-effect">
          <nav className="container py-4 space-y-4">
            <Link
              href="/issues"
              className="block text-sm font-medium hover:text-primary transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Issues
            </Link>
            <Link
              href="/map"
              className="block text-sm font-medium hover:text-primary transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              View Map
            </Link>
            <Link
              href="/report"
              className="block text-sm font-medium hover:text-primary transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Report Issue
            </Link>
            <Link
              href="/help"
              className="block text-sm font-medium hover:text-primary transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Help
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="block text-sm font-medium hover:text-primary transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <div className="pt-4 border-t border-white/20">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
                  <Button variant="outline" onClick={logout} className="w-full glass-effect border-primary/30 hover:border-primary hover:bg-primary/10">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login" className="block">
                    <Button variant="ghost" className="w-full hover:bg-primary/10">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button className="w-full gradient-button">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
