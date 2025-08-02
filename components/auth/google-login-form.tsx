"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider-google"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function GoogleLoginFormContent() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    
    try {
      await login()
    } catch (error) {
      console.error("Google sign-in error:", error)
      toast({
        title: "Sign-in failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error === "OAuthSignin" && "Error signing in with Google. Please try again."}
            {error === "OAuthCallback" && "Error during Google authentication. Please try again."}
            {error === "OAuthCreateAccount" && "Error creating your account. Please try again."}
            {error === "EmailCreateAccount" && "Error creating account with this email."}
            {error === "Callback" && "Authentication error. Please try again."}
            {error === "OAuthAccountNotLinked" && "This email is already associated with another account."}
            {error === "SessionRequired" && "Please sign in to access this page."}
            {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "OAuthAccountNotLinked", "SessionRequired"].includes(error) && "An error occurred during authentication."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CivicTrack</h2>
          <p className="text-gray-600">Sign in with your Google account to continue</p>
        </div>

        <Button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-12 text-base font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          suppressHydrationWarning
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <GoogleIcon />
              <span className="ml-3">Continue with Google</span>
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:text-primary/80 font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Secure Google Authentication</p>
              <p>Your account is protected by Google's advanced security. We only access your basic profile information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GoogleLoginForm() {
  return (
    <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <GoogleLoginFormContent />
    </Suspense>
  )
}
