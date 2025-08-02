import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Camera, Users, BarChart3, MessageSquare, Shield } from "lucide-react"

const features = [
  {
    icon: MapPin,
    title: "GPS Location Tracking",
    description: "Automatically detect and pin-point issue locations with precise GPS coordinates.",
  },
  {
    icon: Camera,
    title: "Photo Documentation",
    description: "Upload up to 5 images per report to provide visual evidence of civic issues.",
  },
  {
    icon: Users,
    title: "Community Engagement",
    description: "View and interact with issues reported by other community members nearby.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track issue resolution progress and community engagement statistics.",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Get guided help from our AI chatbot when reporting issues or seeking information.",
  },
  {
    icon: Shield,
    title: "Content Moderation",
    description: "Advanced moderation tools ensure appropriate content and community safety.",
  },
]

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      
      <div className="container relative">
        <div className="text-center space-y-6 mb-20 page-enter">
          <h2 className="text-4xl lg:text-6xl font-bold">
            Powerful Features for <span className="hero-title">Civic Engagement</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to report, track, and resolve civic issues in your community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="modern-card group hover:scale-105 transition-all duration-300 scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-primary float-animation" style={{ animationDelay: `${index * 0.2}s` }} />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
