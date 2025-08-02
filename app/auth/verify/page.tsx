import { EmailVerificationForm } from "@/components/auth/email-verification-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import { Suspense } from "react"

// Force dynamic rendering to handle searchParams
export const dynamic = 'force-dynamic'

function VerifyContent() {
  return (
    <div className="modern-card">
      <CardHeader>
        <CardTitle className="text-xl gradient-text-primary">Email Verification</CardTitle>
        <CardDescription>
          Please check your inbox and enter the 6-digit verification code below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmailVerificationForm />
      </CardContent>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center page-enter">
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold gradient-text-primary mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">
              Enter the verification code sent to your email address
            </p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
