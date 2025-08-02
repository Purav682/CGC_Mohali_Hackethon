import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Stats } from "@/components/sections/stats"
import { HomepageIssuesDisplay } from "@/components/sections/homepage-issues-display"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ClientOnly } from "@/components/client-wrapper"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <Header />
      <main>
        <Hero />
        <ClientOnly>
          <HomepageIssuesDisplay />
        </ClientOnly>
        <Features />
        <HowItWorks />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}
