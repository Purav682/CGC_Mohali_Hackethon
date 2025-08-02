import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MapPin, Eye, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "Report an Issue",
    description: "Describe the civic issue, add photos, and let GPS automatically detect the location.",
    step: "01",
  },
  {
    icon: MapPin,
    title: "Location Verification",
    description: "Confirm the exact location on the map or manually adjust if needed.",
    step: "02",
  },
  {
    icon: Eye,
    title: "Community Review",
    description: "Your report becomes visible to the community and local authorities for review.",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "Track Progress",
    description: "Monitor the status of your report as it moves from open to in-progress to resolved.",
    step: "04",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">How CivicTrack Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple steps to make a real impact in your community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-0 shadow-lg text-center">
              <CardHeader className="pb-4">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mt-4 mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
