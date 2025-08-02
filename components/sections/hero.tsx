import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Users, CheckCircle } from "lucide-react"
import { HeroMap } from "./hero-map"

export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden page-enter">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-10">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                Report Civic Issues, <span className="hero-title">Make a Difference</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-lg leading-relaxed">
                Join thousands of citizens making their communities better by reporting and tracking civic issues in
                real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/report">
                <Button size="lg" className="w-full sm:w-auto gradient-button text-lg px-8 py-4 rounded-2xl">
                  Report an Issue
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="outline" size="lg" className="w-full sm:w-auto glass-effect text-lg px-8 py-4 rounded-2xl border-2 border-primary/30 hover:border-primary hover:bg-primary/10">
                  View Map
                  <MapPin className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center stats-card">
                <div className="flex justify-center mb-3">
                  <MapPin className="h-10 w-10 text-primary float-animation" />
                </div>
                <div className="text-3xl font-bold gradient-text-primary">1,247</div>
                <div className="text-sm text-muted-foreground">Issues Reported</div>
              </div>
              <div className="text-center stats-card">
                <div className="flex justify-center mb-3">
                  <Users className="h-10 w-10 text-secondary float-animation" style={{ animationDelay: '0.5s' }} />
                </div>
                <div className="text-3xl font-bold gradient-text-primary">856</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center stats-card">
                <div className="flex justify-center mb-3">
                  <CheckCircle className="h-10 w-10 text-emerald-500 float-animation" style={{ animationDelay: '1s' }} />
                </div>
                <div className="text-3xl font-bold gradient-text-primary">342</div>
                <div className="text-sm text-muted-foreground">Issues Resolved</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative glass-effect rounded-3xl overflow-hidden shadow-2xl h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10 pointer-events-none" />
              <HeroMap className="w-full h-full" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 modern-card bg-background/90 backdrop-blur p-4 rounded-2xl shadow-lg float-animation">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full pulse-glow"></div>
                <span className="text-sm font-medium">Issue Resolved</span>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 modern-card bg-background/90 backdrop-blur p-4 rounded-2xl shadow-lg float-animation" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full pulse-glow"></div>
                <span className="text-sm font-medium">New Report</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
