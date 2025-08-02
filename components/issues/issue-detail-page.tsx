"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, User, Flag, MapPin, Calendar, Tag, Bell, BellOff, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { FlagReportButton, AutoHideNotification } from "@/components/moderation/flag-report-button"
import { 
  EnhancedIssue, 
  StatusChange, 
  getStatusChangeDescription, 
  getStatusDisplayText, 
  getTimeAgo,
  getStatusColor,
  getPriorityColor,
  createStatusChange,
  sendStatusChangeNotification,
  mockEnhancedIssues 
} from "@/lib/status-tracking"
import { getModerationStatus } from "@/lib/moderation"

interface IssueDetailPageProps {
  issueId: string
}

export default function IssueDetailPage({ issueId }: IssueDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [issue, setIssue] = useState<EnhancedIssue | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatusReason, setNewStatusReason] = useState("")
  const [isAdmin, setIsAdmin] = useState(false) // In real app, get from auth context
  const [currentUserId] = useState("user_123") // In real app, get from auth context

  // Get moderation status for this issue
  const moderationStatus = getModerationStatus(issueId)

  useEffect(() => {
    // Fetch issue from API
    const fetchIssue = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/issues/${issueId}`)
        if (!response.ok) {
          throw new Error('Issue not found')
        }
        const issueData = await response.json()
        
        // Transform API data to match EnhancedIssue interface
        const enhancedIssue: EnhancedIssue = {
          id: issueData.id,
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          status: issueData.status as "open" | "in-progress" | "resolved",
          priority: issueData.priority as "low" | "medium" | "high" | "urgent",
          location: issueData.location,
          images: issueData.images.map((img: any) => img.url || img),
          flaggedCount: issueData.flaggedCount,
          createdAt: issueData.createdAt,
          updatedAt: issueData.updatedAt,
          createdBy: issueData.reporter?.name || issueData.createdBy,
          assignedTo: issueData.assignee?.name,
          statusHistory: issueData.statusHistory || [],
          notificationSettings: {
            emailNotifications: true,
            reporterEmail: issueData.reporter?.email,
          },
          estimatedResolutionDate: issueData.estimatedResolutionDate,
          actualResolutionDate: issueData.actualResolutionDate,
          tags: issueData.tags?.map((tag: any) => tag.name) || []
        }
        
        setIssue(enhancedIssue)
        // Simulate admin check - in real app, get from auth context
        setIsAdmin(true)
      } catch (error) {
        console.error("Error fetching issue:", error)
        toast({
          title: "Error",
          description: "Failed to load issue details",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchIssue()
  }, [issueId, toast])

  const updateIssueStatus = async (newStatus: string) => {
    if (!issue || !isAdmin) return

    setUpdatingStatus(true)
    try {
      const statusChange = createStatusChange(
        issue.status,
        newStatus,
        "admin_user", // In real app, get from auth context
        newStatusReason || undefined,
        `Status updated via issue detail page`
      )

      const updatedIssue: EnhancedIssue = {
        ...issue,
        status: newStatus as any,
        updatedAt: new Date().toISOString(),
        statusHistory: [...issue.statusHistory, statusChange]
      }

      setIssue(updatedIssue)

      // Send notification to reporter
      await sendStatusChangeNotification(updatedIssue, statusChange)

      toast({
        title: "Status Updated",
        description: `Issue status changed to ${getStatusDisplayText(newStatus)}`,
      })

      setNewStatusReason("")
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error", 
        description: "Failed to update issue status",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const toggleNotifications = async () => {
    if (!issue) return

    const newNotificationSettings = {
      ...issue.notificationSettings,
      emailNotifications: !issue.notificationSettings.emailNotifications
    }

    setIssue({
      ...issue,
      notificationSettings: newNotificationSettings
    })

    toast({
      title: newNotificationSettings.emailNotifications ? "Notifications Enabled" : "Notifications Disabled",
      description: newNotificationSettings.emailNotifications 
        ? "You will receive email updates about this issue"
        : "Email notifications have been disabled for this issue"
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Issue Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested issue could not be found.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Auto-hide notification if applicable */}
      <AutoHideNotification issueId={issueId} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Issues
        </Button>
        <div className="flex items-center space-x-2">
          <FlagReportButton 
            issueId={issueId}
            currentUserId={currentUserId}
            showFlagCount={true}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
          >
            {issue.notificationSettings.emailNotifications ? (
              <Bell className="w-4 h-4 mr-2" />
            ) : (
              <BellOff className="w-4 h-4 mr-2" />
            )}
            {issue.notificationSettings.emailNotifications ? "Notifications On" : "Notifications Off"}
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Share Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{issue.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(issue.status)}>
                      {getStatusDisplayText(issue.status)}
                    </Badge>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge variant="outline">{issue.category}</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Issue #{issue.id}</p>
                  <p>Created {getTimeAgo(issue.createdAt)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{issue.description}</p>
              </div>

              {issue.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {issue.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Issue image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{issue.location.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Reported by {issue.createdBy}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {issue.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issue.statusHistory.map((change, index) => (
                  <div key={change.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(change.newStatus).split(' ')[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {getStatusChangeDescription(change)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(change.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {change.reason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Reason: {change.reason}
                        </p>
                      )}
                      {change.adminNotes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Admin notes: {change.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <div className="space-y-2">
                    <Button
                      variant={issue.status === "open" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => updateIssueStatus("open")}
                      disabled={issue.status === "open" || updatingStatus}
                    >
                      Mark as Open
                    </Button>
                    <Button
                      variant={issue.status === "in-progress" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => updateIssueStatus("in-progress")}
                      disabled={issue.status === "in-progress" || updatingStatus}
                    >
                      Mark as In Progress
                    </Button>
                    <Button
                      variant={issue.status === "resolved" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => updateIssueStatus("resolved")}
                      disabled={issue.status === "resolved" || updatingStatus}
                    >
                      Mark as Resolved
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for Status Change</label>
                  <Textarea
                    placeholder="Enter reason for status change..."
                    value={newStatusReason}
                    onChange={(e) => setNewStatusReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Issue Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status Changes</span>
                  <span className="text-sm font-medium">{issue.statusHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Flags</span>
                  <span className="text-sm font-medium">{issue.flaggedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority.toUpperCase()}
                  </Badge>
                </div>
                {issue.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Assigned To</span>
                    <span className="text-sm font-medium">{issue.assignedTo}</span>
                  </div>
                )}
                {issue.estimatedResolutionDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Est. Resolution</span>
                    <span className="text-sm font-medium">
                      {new Date(issue.estimatedResolutionDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {issue.actualResolutionDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Resolved On</span>
                    <span className="text-sm font-medium">
                      {new Date(issue.actualResolutionDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleNotifications}
                  >
                    {issue.notificationSettings.emailNotifications ? (
                      <Bell className="w-4 h-4 text-green-600" />
                    ) : (
                      <BellOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {issue.notificationSettings.emailNotifications && issue.notificationSettings.reporterEmail && (
                  <p className="text-xs text-muted-foreground">
                    Notifications sent to: {issue.notificationSettings.reporterEmail}
                  </p>
                )}
                {issue.notificationSettings.lastNotified && (
                  <p className="text-xs text-muted-foreground">
                    Last notified: {getTimeAgo(issue.notificationSettings.lastNotified)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
