"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { Issue } from "@/components/map/map-view"

// Dynamically import the map to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )
})

// Sample issues for the homepage map
const sampleIssues: Issue[] = [
  {
    id: "1",
    title: "Broken Street Light",
    description: "Street light has been out for 3 days",
    category: "lighting",
    status: "open",
    location: { lat: 40.7589, lng: -73.9851, address: "Times Square, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    createdAt: "2024-01-15T10:30:00Z",
    createdBy: "concerned_citizen",
    flaggedCount: 0
  },
  {
    id: "2",
    title: "Pothole on Broadway",
    description: "Large pothole causing damage to vehicles",
    category: "roads",
    status: "in-progress",
    location: { lat: 40.7614, lng: -73.9776, address: "Central Park East, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    createdAt: "2024-01-14T14:20:00Z",
    createdBy: "driver_123",
    flaggedCount: 2
  },
  {
    id: "3",
    title: "Graffiti on Public Building",
    description: "Offensive graffiti on city hall exterior wall",
    category: "vandalism",
    status: "resolved",
    location: { lat: 40.7505, lng: -73.9934, address: "Wall Street, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    createdAt: "2024-01-13T09:15:00Z",
    createdBy: "city_employee",
    flaggedCount: 0
  }
]

interface HeroMapProps {
  className?: string
}

export function HeroMap({ className }: HeroMapProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Default center location (New York City)
  const defaultCenter = { lat: 40.7589, lng: -73.9851 }
  const [center, setCenter] = useState<{ lat: number; lng: number }>(defaultCenter)

  useEffect(() => {
    setIsMounted(true)
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    setIsLoadingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLocation = { lat: latitude, lng: longitude }
        setUserLocation(newLocation)
        setCenter(newLocation) // Update map center to user location
        setLocationError(null)
        setIsLoadingLocation(false)
      },
      (error) => {
        console.warn("Error getting location:", error.message)
        let errorMessage = "Unable to get your location"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Using default location."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Using default location."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Using default location."
            break
        }
        
        setLocationError(errorMessage)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  if (!isMounted) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">
            {isLoadingLocation ? "Getting your location..." : "Loading map..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <div id="map" className="w-full h-full rounded-3xl overflow-hidden">
        <LeafletMap
          center={center}
          issues={sampleIssues}
          selectedIssue={selectedIssue}
          onIssueSelect={setSelectedIssue}
          radius={5}
        />
      </div>
      
      {/* Map overlay with location status */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            userLocation ? 'bg-green-500 animate-pulse' : 
            isLoadingLocation ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`}></div>
          <p className="text-sm font-medium">
            {userLocation ? '� Your Location' : 
             isLoadingLocation ? '🔄 Finding Location...' : 
             '�🗺️ Default View'}
          </p>
        </div>
        {locationError && (
          <p className="text-xs text-muted-foreground mt-1">{locationError}</p>
        )}
      </div>
      
      {/* Issue count overlay */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium">
          <span className="text-primary font-bold">{sampleIssues.length}</span> Active Issues
        </p>
      </div>

      {/* Location refresh button */}
      {!userLocation && !isLoadingLocation && (
        <div className="absolute top-4 right-4">
          <button
            onClick={getCurrentLocation}
            className="bg-primary/90 hover:bg-primary text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur text-sm font-medium transition-colors"
            title="Get my location"
          >
            📍 Use My Location
          </button>
        </div>
      )}
    </div>
  )
}
