"use client"

import { Suspense } from "react"
import { MapView } from "@/components/map/map-view"

function MapPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="h-screen pt-16">
        <MapView />
      </main>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading map...</p>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  )
}
