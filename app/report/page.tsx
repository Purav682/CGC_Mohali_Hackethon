import { ReportForm } from "@/components/forms/report-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Camera, MessageSquare } from "lucide-react"

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 page-enter">
      <main className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 hero-title">Report a Civic Issue</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Help improve your community by reporting issues that need attention. Our AI assistant will help guide you through the process.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="stats-card text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4 float-animation" />
              <h3 className="text-lg font-semibold mb-2">GPS Location</h3>
              <p className="text-sm text-muted-foreground">Automatically detect your precise location</p>
            </div>
            <div className="stats-card text-center">
              <Camera className="h-12 w-12 text-secondary mx-auto mb-4 float-animation" style={{ animationDelay: '0.5s' }} />
              <h3 className="text-lg font-semibold mb-2">Photo Evidence</h3>
              <p className="text-sm text-muted-foreground">Upload up to 5 images of the issue</p>
            </div>
            <div className="stats-card text-center">
              <MessageSquare className="h-12 w-12 text-emerald-500 mx-auto mb-4 float-animation" style={{ animationDelay: '1s' }} />
              <h3 className="text-lg font-semibold mb-2">AI Assistance</h3>
              <p className="text-sm text-muted-foreground">Get guided help throughout the process</p>
            </div>
          </div>

          {/* Report Form */}
          <div className="modern-card">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text-primary">Issue Details</CardTitle>
              <CardDescription className="text-base">
                Please provide as much detail as possible to help us understand and resolve the issue quickly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportForm />
            </CardContent>
          </div>
        </div>
      </main>
    </div>
  )
}
