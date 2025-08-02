"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider-google"
import { Loader2, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setNeedsVerification(false)

    try {
      const result = await login(email, password)
      
      if (result.success && result.user) {
        toast({
          title: "Welcome back!",
          description: `Hello ${result.user.name}! You have been successfully logged in.`,
        })
        
        // Redirect based on user role
        if (result.user.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        if (result.needsVerification) {
          setNeedsVerification(true)
          toast({
            title: "Email Verification Required",
            description: result.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Login Failed",
            description: result.message,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {needsVerification && (
        <Alert className="border-yellow-500/50 text-yellow-600 bg-yellow-50/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please verify your email address to continue. Check your inbox for a verification code.
            <Link href="/auth/verify" className="ml-2 font-medium underline hover:no-underline">
              Verify Email →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="modern-input pl-12 h-12 text-base"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="modern-input pl-12 h-12 text-base"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link 
            href="/auth/forgot-password" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full gradient-button h-12 text-base font-medium"
          suppressHydrationWarning
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Sign In
            </>
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Create Account
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Are you an administrator?{" "}
          <Link href="/auth/admin-signup" className="text-secondary hover:text-secondary/80 font-medium transition-colors">
            Admin Sign Up
          </Link>
        </div>

        <div className="text-xs text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <p>User: john@example.com / password123</p>
          <p>Admin: admin@civictrack.com / password123</p>
        </div>
      </form>
    </div>
  )
}
