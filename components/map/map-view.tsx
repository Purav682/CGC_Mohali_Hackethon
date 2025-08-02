"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, Search, MapPin, Calendar, Flag, ExternalLink } from "lucide-react"
import { FlagReportButton } from "@/components/moderation/flag-report-button"
import { getModerationStatus } from "@/lib/moderation"
import { useToast } from "@/hooks/use-toast"
import { getFilterCategories, getCategoryByValue } from "@/lib/categories"

// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading map...</p>
      </div>
    </div>
  ),
})

export interface Issue {
  id: string
  title: string
  description: string
  category: string
  status: "open" | "in-progress" | "resolved"
  location: {
    lat: number
    lng: number
    address?: string
  }
  images: string[]
  flaggedCount: number
  createdAt: string
  createdBy: string
}

const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Broken Street Light",
    description: "Street light has been out for 3 days, making the area unsafe at night.",
    category: "lighting",
    status: "open",
    location: { lat: 40.7128, lng: -74.006, address: "123 Main St, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-15T10:30:00Z",
    createdBy: "john_doe",
  },
  {
    id: "2",
    title: "Pothole on Broadway",
    description: "Large pothole causing damage to vehicles. Needs immediate attention.",
    category: "roads",
    status: "in-progress",
    location: { lat: 40.7589, lng: -73.9851, address: "456 Broadway, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-14T14:20:00Z",
    createdBy: "jane_smith",
  },
  {
    id: "3",
    title: "Overflowing Garbage Bin",
    description: "Garbage bin has been overflowing for days, attracting pests.",
    category: "cleanliness",
    status: "resolved",
    location: { lat: 40.7505, lng: -73.9934, address: "789 Park Ave, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-13T09:15:00Z",
    createdBy: "mike_wilson",
  },
  {
    id: "4",
    title: "Fallen Tree Blocking Sidewalk",
    description: "Large tree branch fell during storm, completely blocking pedestrian access.",
    category: "obstructions",
    status: "open",
    location: { lat: 40.7614, lng: -73.9776, address: "Central Park West, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 2,
    createdAt: "2024-01-16T08:45:00Z",
    createdBy: "park_ranger",
  },
  {
    id: "5",
    title: "Open Manhole Cover",
    description: "Manhole cover is missing, creating serious safety hazard for pedestrians and vehicles.",
    category: "safety",
    status: "open",
    location: { lat: 40.7488, lng: -73.9857, address: "42nd St & 7th Ave, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 5,
    createdAt: "2024-01-16T12:30:00Z",
    createdBy: "concerned_citizen",
  },
  {
    id: "6",
    title: "Water Pipe Burst",
    description: "Major water leak flooding the street, very low pressure in surrounding buildings.",
    category: "water",
    status: "in-progress",
    location: { lat: 40.7282, lng: -74.0000, address: "Greenwich Village, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 1,
    createdAt: "2024-01-15T16:15:00Z",
    createdBy: "resident_124",
  },
]

const categories = getFilterCategories()

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
]

const distanceOptions = [
  { value: "1", label: "1 km radius" },
  { value: "3", label: "3 km radius" }, 
  { value: "5", label: "5 km radius" },
]

export function MapView() {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>(mockIssues)
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>(mockIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationRadius, setLocationRadius] = useState(3) // 3km radius for neighborhood filtering
  const [currentUserId] = useState("user_123") // In real app, get from auth context
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
    distance: "3", // Distance filter in kilometers
  })
  const { toast } = useToast()

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLng = (lng2 - lng1) * (Math.PI / 180)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter issues within the specified radius
  const getIssuesWithinRadius = (issues: Issue[], userLat: number, userLng: number, radius: number): Issue[] => {
    return issues.filter(issue => {
      const distance = calculateDistance(userLat, userLng, issue.location.lat, issue.location.lng)
      return distance <= radius
    })
  }

  // Update location radius when distance filter changes
  useEffect(() => {
    const newRadius = parseInt(filters.distance)
    setLocationRadius(newRadius)
    
    // Re-filter issues with new radius if user location is available
    if (userLocation) {
      const nearbyIssues = getIssuesWithinRadius(mockIssues, userLocation.lat, userLocation.lng, newRadius)
      setIssues(nearbyIssues)
      
      toast({
        title: "Distance Filter Updated",
        description: `Now showing issues within ${newRadius}km of your location.`,
      })
    }
  }, [filters.distance, userLocation, toast])

  // Get user location and update real-time
  useEffect(() => {
    let watchId: number | null = null

    const getLocation = () => {
      if (navigator.geolocation) {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setUserLocation(newLocation)
            
            // Filter issues based on location
            const nearbyIssues = getIssuesWithinRadius(mockIssues, newLocation.lat, newLocation.lng, locationRadius)
            setIssues(nearbyIssues)
            
            toast({
              title: "Location Found",
              description: `Showing civic issues within ${locationRadius}km of your location.`,
            })
          },
          (error) => {
            console.error("Error getting location:", error)
            let errorMessage = "Location access denied."
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location access denied. Please enable location services."
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable."
                break
              case error.TIMEOUT:
                errorMessage = "Location request timed out."
                break
            }
            
            toast({
              title: "Location Access Required",
              description: `${errorMessage} Using default location - you may see limited civic issues.`,
              variant: "destructive",
            })
            
            // Default to NYC coordinates with limited mock data
            const defaultLocation = { lat: 40.7128, lng: -74.006 }
            setUserLocation(defaultLocation)
            const nearbyIssues = getIssuesWithinRadius(mockIssues, defaultLocation.lat, defaultLocation.lng, locationRadius)
            setIssues(nearbyIssues)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )

        // Watch position for real-time updates
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setUserLocation(newLocation)
            
            // Re-filter issues when location changes
            const nearbyIssues = getIssuesWithinRadius(mockIssues, newLocation.lat, newLocation.lng, locationRadius)
            setIssues(nearbyIssues)
          },
          (error) => {
            console.error("Error watching location:", error)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000 // 1 minute
          }
        )
      } else {
        toast({
          title: "Geolocation Not Supported",
          description: "Your browser doesn't support geolocation. Using default location.",
          variant: "destructive",
        })
        const defaultLocation = { lat: 40.7128, lng: -74.006 }
        setUserLocation(defaultLocation)
        const nearbyIssues = getIssuesWithinRadius(mockIssues, defaultLocation.lat, defaultLocation.lng, locationRadius)
        setIssues(nearbyIssues)
      }
    }

    getLocation()

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [toast, locationRadius])

  // Filter issues with location and moderation filtering
  useEffect(() => {
    let filtered = issues

    // Filter out hidden issues first
    filtered = filtered.filter(issue => {
      const moderationStatus = getModerationStatus(issue.id)
      return !moderationStatus?.isHidden
    })

    // Apply location filtering if user location is available
    if (userLocation && locationRadius > 0) {
      filtered = filtered.filter(issue => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          issue.location.lat,
          issue.location.lng
        )
        return distance <= locationRadius
      })
    }

    // Apply other filters
    if (filters.category !== "all") {
      filtered = filtered.filter((issue) => issue.category === filters.category)
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((issue) => issue.status === filters.status)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower)
      )
    }

    setFilteredIssues(filtered)
  }, [issues, userLocation, locationRadius, filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"
      case "in-progress":
        return "default"
      case "resolved":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open"
      case "in-progress":
        return "In Progress"
      case "resolved":
        return "Resolved"
      default:
        return status
    }
  }

  const getCategoryLabel = (category: string) => {
    return getCategoryByValue(category)?.label || category
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-background overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <h2 className="font-semibold">Filters</h2>
          </div>

          {/* Location Status */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Your Neighborhood</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {userLocation ? (
                <>
                  <p>📍 Location detected</p>
                  <p>🔍 Showing issues within {locationRadius}km radius</p>
                  <p>📊 {filteredIssues.length} civic issues found nearby</p>
                </>
              ) : (
                <p>📍 Detecting your location...</p>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.category}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.distance} onValueChange={(value) => setFilters((prev) => ({ ...prev, distance: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              {distanceOptions.map((distance) => (
                <SelectItem key={distance.value} value={distance.value}>
                  {distance.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Issues ({filteredIssues.length})</h3>
            </div>

            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <Card
                  key={issue.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedIssue?.id === issue.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium line-clamp-2">{issue.title}</CardTitle>
                      {issue.flaggedCount > 0 && <Flag className="h-4 w-4 text-destructive flex-shrink-0 ml-2" />}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(issue.status)} className="text-xs">
                          {getStatusLabel(issue.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(issue.category)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{issue.location.address}</span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t flex items-center justify-between space-x-2">
                      <FlagReportButton 
                        issueId={issue.id}
                        currentUserId={currentUserId}
                        isCompact={true}
                        showFlagCount={false}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/issues/${issue.id}`)
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {userLocation && (
          <DynamicMap
            center={userLocation}
            issues={filteredIssues}
            selectedIssue={selectedIssue}
            onIssueSelect={setSelectedIssue}
            radius={locationRadius}
          />
        )}
      </div>
    </div>
  )
}
