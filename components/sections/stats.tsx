import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock, Users, Award } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    value: "1,247",
    label: "Issues Reported",
    change: "+12% this month",
  },
  {
    icon: Clock,
    value: "2.3 days",
    label: "Avg. Response Time",
    change: "-15% improvement",
  },
  {
    icon: Users,
    value: "856",
    label: "Active Citizens",
    change: "+23% this month",
  },
  {
    icon: Award,
    value: "74%",
    label: "Resolution Rate",
    change: "+8% this quarter",
  },
]

export function Stats() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Making Real Impact</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            See how CivicTrack is transforming communities across the region.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-primary-foreground/10 border-primary-foreground/20 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg mb-2">{stat.label}</div>
                <div className="text-sm opacity-75">{stat.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
