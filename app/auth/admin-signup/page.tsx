import { AdminSignupForm } from "@/components/auth/admin-signup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center page-enter">
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-bold gradient-text-primary mb-2">Admin Registration</h1>
            <p className="text-muted-foreground">
              Create an administrator account for CivicTrack
            </p>
          </div>

          <Alert className="mb-6 border-yellow-500/50 text-yellow-600 bg-yellow-50/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Access:</strong> Administrator accounts require approval and must use an @civictrack.com email address. 
              Contact your system administrator if you need special access.
            </AlertDescription>
          </Alert>

          <div className="modern-card">
            <CardHeader>
              <CardTitle className="text-xl gradient-text-primary flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Account
              </CardTitle>
              <CardDescription>
                Create your admin account to access the CivicTrack management dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSignupForm />
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  )
}
