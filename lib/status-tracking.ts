/**
 * Status tracking utilities and interfaces for CivicTrack
 * Provides comprehensive status change logging and notification functionality
 */

export interface StatusChange {
  id: string
  timestamp: string
  previousStatus: string
  newStatus: string
  changedBy: string
  reason?: string
  adminNotes?: string
}

export interface EnhancedIssue {
  id: string
  title: string
  description: string
  category: string
  status: "open" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high" | "urgent"
  location: {
    lat: number
    lng: number
    address?: string
  }
  images: string[]
  flaggedCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
  assignedTo?: string
  statusHistory: StatusChange[]
  notificationSettings: {
    emailNotifications: boolean
    reporterEmail?: string
    lastNotified?: string
  }
  estimatedResolutionDate?: string
  actualResolutionDate?: string
  tags: string[]
}

/**
 * Create a new status change entry
 */
export function createStatusChange(
  previousStatus: string,
  newStatus: string,
  changedBy: string,
  reason?: string,
  adminNotes?: string
): StatusChange {
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    previousStatus,
    newStatus,
    changedBy,
    reason,
    adminNotes
  }
}

/**
 * Get status change description for display
 */
export function getStatusChangeDescription(change: StatusChange): string {
  const timeAgo = getTimeAgo(change.timestamp)
  const statusText = getStatusDisplayText(change.newStatus)
  
  return `Status changed to ${statusText} by ${change.changedBy} ${timeAgo}`
}

/**
 * Get human-readable status text
 */
export function getStatusDisplayText(status: string): string {
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

/**
 * Get time ago text for timestamps
 */
export function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60))
    return diffInMinutes < 1 ? "just now" : `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
}

/**
 * Get status color for display
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800"
    case "resolved":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Get priority color for display
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-500 text-white"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "medium":
      return "bg-blue-100 text-blue-800"
    case "low":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Send notification to reporter about status change
 */
export async function sendStatusChangeNotification(
  issue: EnhancedIssue, 
  statusChange: StatusChange
): Promise<boolean> {
  // In a real app, this would integrate with email service
  // For now, we'll simulate the notification
  if (!issue.notificationSettings.emailNotifications || !issue.notificationSettings.reporterEmail) {
    return false
  }

  console.log(`📧 Notification sent to ${issue.notificationSettings.reporterEmail}:`)
  console.log(`Issue "${issue.title}" status changed to ${getStatusDisplayText(statusChange.newStatus)}`)
  console.log(`Change made by: ${statusChange.changedBy}`)
  if (statusChange.reason) {
    console.log(`Reason: ${statusChange.reason}`)
  }
  
  return true
}

/**
 * Mock data for enhanced issues with status history
 */
export const mockEnhancedIssues: EnhancedIssue[] = [
  {
    id: "1",
    title: "Broken Street Light",
    description: "Street light has been out for 3 days, making the area unsafe at night.",
    category: "lighting",
    status: "in-progress",
    priority: "high",
    location: { lat: 40.7128, lng: -74.006, address: "123 Main St, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
    createdBy: "john_doe",
    assignedTo: "maintenance_team_1",
    statusHistory: [
      {
        id: "sc1",
        timestamp: "2024-01-15T10:30:00Z",
        previousStatus: "",
        newStatus: "open",
        changedBy: "john_doe",
        reason: "Initial report submission"
      },
      {
        id: "sc2", 
        timestamp: "2024-01-16T09:15:00Z",
        previousStatus: "open",
        newStatus: "in-progress",
        changedBy: "admin_sarah",
        reason: "Assigned to maintenance team",
        adminNotes: "High priority due to safety concerns"
      }
    ],
    notificationSettings: {
      emailNotifications: true,
      reporterEmail: "john.doe@email.com",
      lastNotified: "2024-01-16T09:15:00Z"
    },
    estimatedResolutionDate: "2024-01-18T17:00:00Z",
    tags: ["safety", "urgent", "night-lighting"]
  },
  {
    id: "2",
    title: "Pothole on Broadway", 
    description: "Large pothole causing damage to vehicles. Needs immediate attention.",
    category: "roads",
    status: "resolved",
    priority: "medium",
    location: { lat: 40.7589, lng: -73.9851, address: "456 Broadway, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-17T11:45:00Z",
    createdBy: "jane_smith",
    assignedTo: "roads_crew_2",
    statusHistory: [
      {
        id: "sc3",
        timestamp: "2024-01-14T14:20:00Z",
        previousStatus: "",
        newStatus: "open",
        changedBy: "jane_smith",
        reason: "Initial report submission"
      },
      {
        id: "sc4",
        timestamp: "2024-01-15T08:30:00Z", 
        previousStatus: "open",
        newStatus: "in-progress",
        changedBy: "admin_mike",
        reason: "Assigned to roads crew for assessment"
      },
      {
        id: "sc5",
        timestamp: "2024-01-17T11:45:00Z",
        previousStatus: "in-progress", 
        newStatus: "resolved",
        changedBy: "admin_mike",
        reason: "Pothole filled and road surface restored",
        adminNotes: "Work completed by roads crew. Quality inspection passed."
      }
    ],
    notificationSettings: {
      emailNotifications: true,
      reporterEmail: "jane.smith@email.com",
      lastNotified: "2024-01-17T11:45:00Z"
    },
    actualResolutionDate: "2024-01-17T11:45:00Z",
    tags: ["roads", "vehicle-damage", "completed"]
  }
]
