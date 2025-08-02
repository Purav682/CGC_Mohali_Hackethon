"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider-google"
import { verifyEmail, resendVerificationCode } from "@/lib/auth"
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react"

export function EmailVerificationForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { toast } = useToast()
  const { updateUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email")
    const storedEmail = localStorage.getItem("verification_email")
    setEmail(emailParam || storedEmail || "")
  }, [searchParams])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newCode = [...code]
    newCode[index] = value.toUpperCase()
    setCode(newCode)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").toUpperCase().slice(0, 6)
    const newCode = [...code]
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^[A-Z0-9]$/.test(pastedData[i])) {
        newCode[i] = pastedData[i]
      }
    }
    
    setCode(newCode)
    setError("")
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(c => !c)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const verificationCode = code.join("")
    if (verificationCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    if (!email) {
      setError("Email address is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await verifyEmail(email, verificationCode)
      
      if (result.success && result.user) {
        localStorage.setItem("civictrack_user_id", result.user.id)
        localStorage.removeItem("verification_email")
        updateUser(result.user)
        
        toast({
          title: "Email Verified!",
          description: "Your account has been successfully verified.",
        })
        
        // Redirect based on user role
        if (result.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        setError(result.message)
        // Clear the code on error
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      setError("Verification failed. Please try again.")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setError("Email address is required")
      return
    }

    setIsResending(true)
    setError("")

    try {
      const result = await resendVerificationCode(email)
      
      if (result.success) {
        toast({
          title: "Code Sent!",
          description: result.message,
        })
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-500/50 text-red-600 bg-red-50/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {email && (
        <div className="text-center text-sm text-muted-foreground">
          Verification code sent to: <strong>{email}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center space-x-3">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-12 text-center text-xl font-bold modern-input"
                placeholder="•"
              />
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Enter the 6-digit code from your email
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || code.join("").length !== 6} 
          className="w-full gradient-button h-12 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Verify Email
            </>
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            disabled={isResending}
            className="glass-effect border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
