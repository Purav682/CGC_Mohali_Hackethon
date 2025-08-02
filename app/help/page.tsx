import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { MapPin, Camera, Users, MessageSquare, Shield, Clock } from "lucide-react"

const faqs = [
  {
    question: "How do I report a civic issue?",
    answer:
      'Click on "Report Issue" in the navigation, fill out the form with details about the problem, add photos if possible, and set your location. Our AI assistant can help guide you through the process.',
  },
  {
    question: "What types of issues can I report?",
    answer:
      "You can report various civic issues including road problems (potholes, damaged infrastructure), lighting issues, garbage and sanitation problems, water issues, public safety concerns, and other community problems.",
  },
  {
    question: "How is my location detected?",
    answer:
      "We use your browser's GPS functionality to automatically detect your location. If GPS is not available or you prefer, you can manually enter an address.",
  },
  {
    question: "Can I upload photos with my report?",
    answer:
      "Yes! You can upload up to 5 images per report. Photos help authorities better understand the issue and prioritize responses. Supported formats include JPG, PNG, and GIF.",
  },
  {
    question: "How can I track the status of my report?",
    answer:
      "All reports go through three statuses: Open (newly reported), In Progress (being worked on), and Resolved (completed). You can view the status of all reports on the map view.",
  },
  {
    question: "What happens to flagged content?",
    answer:
      "Our moderation system allows community members to flag inappropriate content. Flagged reports are reviewed by administrators and may be removed if they violate community guidelines.",
  },
  {
    question: "How does the AI categorization work?",
    answer:
      "Our AI analyzes your issue description and suggests the most appropriate category. It also performs sentiment analysis to help prioritize urgent issues that may require immediate attention.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes, we take privacy seriously. Your location data is only used for issue reporting and is not shared with third parties. You can report issues anonymously or create an account for better tracking.",
  },
]

const features = [
  {
    icon: MapPin,
    title: "GPS Location Tracking",
    description: "Automatically detect issue locations with precise GPS coordinates",
  },
  {
    icon: Camera,
    title: "Photo Documentation",
    description: "Upload up to 5 images per report for visual evidence",
  },
  {
    icon: Users,
    title: "Community Engagement",
    description: "View and interact with issues reported by other community members",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Get guided help from our AI chatbot during the reporting process",
  },
  {
    icon: Shield,
    title: "Content Moderation",
    description: "Advanced moderation tools ensure appropriate content and community safety",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Monitor issue resolution progress and community engagement statistics",
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Help & Support</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about using CivicTrack effectively
            </p>
          </div>

          {/* Quick Start Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>Get started with CivicTrack in just a few simple steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">1</Badge>
                    <div>
                      <h3 className="font-semibold">Report an Issue</h3>
                      <p className="text-sm text-muted-foreground">
                        Click "Report Issue" and describe the civic problem you've encountered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">2</Badge>
                    <div>
                      <h3 className="font-semibold">Add Details</h3>
                      <p className="text-sm text-muted-foreground">
                        Include photos, select a category, and set the location
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">3</Badge>
                    <div>
                      <h3 className="font-semibold">Submit Report</h3>
                      <p className="text-sm text-muted-foreground">
                        Review your information and submit the report to the community
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">4</Badge>
                    <div>
                      <h3 className="font-semibold">Track Progress</h3>
                      <p className="text-sm text-muted-foreground">Monitor the status of your report on the map view</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>Discover all the powerful features that make CivicTrack effective</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about using CivicTrack</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Still Need Help?</CardTitle>
              <CardDescription>Can't find what you're looking for? Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Send us an email and we'll get back to you within 24 hours
                  </p>
                  <p className="text-sm font-medium">support@civictrack.com</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">Call us during business hours (9 AM - 5 PM EST)</p>
                  <p className="text-sm font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
