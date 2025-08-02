import Link from "next/link"
import { MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-background to-background" />
      <div className="absolute inset-0 glass-effect" />
      
      <div className="container relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 group">
              <MapPin className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              <span className="text-2xl font-bold gradient-text-primary">CivicTrack</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering communities to report and track civic issues for a better tomorrow.
            </p>
            <div className="flex space-x-4">
              <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
              <div className="w-2 h-2 bg-secondary rounded-full pulse-glow" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full pulse-glow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg gradient-text-primary">Quick Links</h3>
            <div className="space-y-3 text-sm">
              <Link href="/issues" className="block hover:text-primary transition-colors duration-200 relative group">
                Browse Issues
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/map" className="block hover:text-primary transition-colors duration-200 relative group">
                View Map
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/report" className="block hover:text-primary transition-colors duration-200 relative group">
                Report Issue
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/help" className="block hover:text-primary transition-colors duration-200 relative group">
                Help & FAQ
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg gradient-text-primary">Categories</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <p>Roads & Infrastructure</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                <p>Lighting</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <p>Garbage & Sanitation</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <p>Water Issues</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                <p>Public Safety</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg gradient-text-primary">Contact</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-3 group">
                <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:text-primary transition-colors duration-200">support@civictrack.com</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:text-primary transition-colors duration-200">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 <span className="gradient-text-primary font-medium">CivicTrack</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
