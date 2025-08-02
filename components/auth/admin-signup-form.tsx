"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { registerUser } from "@/lib/auth"
import { Loader2, User, Mail, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react"

export function AdminSignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
    agreeToTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    } else if (!formData.email.endsWith("@civictrack.com")) {
      newErrors.email = "Admin accounts require @civictrack.com email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.adminCode.trim()) {
      newErrors.adminCode = "Admin verification code is required"
    } else if (formData.adminCode !== "ADMIN2024") {
      newErrors.adminCode = "Invalid admin verification code"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser(formData.email, formData.name, formData.password, "admin")
      
      if (result.success) {
        setRegistrationSuccess(true)
        localStorage.setItem("verification_email", formData.email)
        toast({
          title: "Admin Registration Successful!",
          description: result.message,
        })
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (registrationSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Admin Account Created!</h3>
          <p className="text-muted-foreground">
            We've sent a verification code to <strong>{formData.email}</strong>. 
            Please check your inbox and verify your admin account.
          </p>
        </div>
        <div className="space-y-3">
          <Button 
            onClick={() => router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`)}
            className="w-full gradient-button"
          >
            <Shield className="mr-2 h-4 w-4" />
            Verify Admin Account
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setRegistrationSuccess(false)}
            className="w-full"
          >
            Back to Registration
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
                className={`modern-input pl-12 h-12 text-base ${errors.name ? "border-red-500" : ""}`}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">Admin Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@civictrack.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                className={`modern-input pl-12 h-12 text-base ${errors.email ? "border-red-500" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.email}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be a @civictrack.com email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminCode" className="text-base font-medium">Admin Verification Code</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="adminCode"
                type="text"
                placeholder="Enter admin verification code"
                value={formData.adminCode}
                onChange={(e) => handleInputChange("adminCode", e.target.value)}
                disabled={isLoading}
                className={`modern-input pl-12 h-12 text-base ${errors.adminCode ? "border-red-500" : ""}`}
              />
            </div>
            {errors.adminCode && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.adminCode}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Demo code: <code className="bg-muted px-1 rounded">ADMIN2024</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                className={`modern-input pl-12 h-12 text-base ${errors.password ? "border-red-500" : ""}`}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                disabled={isLoading}
                className={`modern-input pl-12 h-12 text-base ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
              disabled={isLoading}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="agreeToTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
                  Admin Policy
                </Link>
              </Label>
            </div>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errors.agreeToTerms}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full gradient-button h-12 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Admin Account...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Create Admin Account
            </>
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign In
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Need a regular user account?{" "}
          <Link href="/auth/register" className="text-secondary hover:text-secondary/80 font-medium transition-colors">
            User Registration
          </Link>
        </div>
      </form>
    </div>
  )
}
