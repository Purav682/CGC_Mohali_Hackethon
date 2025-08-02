"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Issue } from "./map-view"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface LeafletMapProps {
  center: { lat: number; lng: number }
  issues: Issue[]
  selectedIssue: Issue | null
  onIssueSelect: (issue: Issue) => void
  radius?: number // Add radius prop
}

export default function LeafletMap({ center, issues, selectedIssue, onIssueSelect, radius = 3 }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map("map").setView([center.lat, center.lng], 13)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current)

      // Add user location marker
      const userIcon = L.divIcon({
        html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        className: "user-location-marker",
      })

      L.marker([center.lat, center.lng], { icon: userIcon }).addTo(mapRef.current).bindPopup("Your Location")

      // Add radius circle (dynamic radius)
      L.circle([center.lat, center.lng], {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        radius: radius * 1000, // Convert km to meters
      }).addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center])

  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Add issue markers
    issues.forEach((issue) => {
      const getMarkerColor = (status: string) => {
        switch (status) {
          case "open":
            return "#ef4444"
          case "in-progress":
            return "#f59e0b"
          case "resolved":
            return "#10b981"
          default:
            return "#6b7280"
        }
      }

      const markerIcon = L.divIcon({
        html: `<div style="background-color: ${getMarkerColor(issue.status)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
        </div>`,
        iconSize: [24, 24],
        className: "issue-marker",
      })

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon: markerIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${issue.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${issue.description}</p>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span style="background: ${getMarkerColor(issue.status)}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: capitalize;">${issue.status.replace("-", " ")}</span>
              <span style="background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: capitalize;">${issue.category}</span>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #9ca3af;">${new Date(issue.createdAt).toLocaleDateString()}</p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <a href="/issues/${issue.id}" style="display: inline-flex; align-items: center; gap: 4px; color: #3b82f6; text-decoration: none; font-size: 11px; font-weight: 500;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                View Full Details & Status History
              </a>
            </div>
          </div>
        `)
        .on("click", () => {
          onIssueSelect(issue)
        })

      markersRef.current.push(marker)
    })
  }, [issues, onIssueSelect])

  useEffect(() => {
    if (!mapRef.current || !selectedIssue) return

    // Find and open popup for selected issue
    const selectedMarker = markersRef.current.find((marker) => {
      const markerLatLng = marker.getLatLng()
      return markerLatLng.lat === selectedIssue.location.lat && markerLatLng.lng === selectedIssue.location.lng
    })

    if (selectedMarker) {
      mapRef.current.setView([selectedIssue.location.lat, selectedIssue.location.lng], 15)
      selectedMarker.openPopup()
    }
  }, [selectedIssue])

  // Update map center when center prop changes (for user location updates)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], 13)
    }
  }, [center.lat, center.lng])

  return <div id="map" className="h-full w-full" />
}
