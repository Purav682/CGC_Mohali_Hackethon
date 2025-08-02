"use client"

import { useState } from "react"
import { Shield, Flag, Eye, EyeOff, Trash2, Check, X, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  getModerationStatus,
  updateModerationStatus,
  adminModerateIssue,
  getHiddenIssues,
  getPendingReviewIssues,
  IssueModerationStatus,
  ModerationAction
} from "@/lib/moderation"

interface AdminModerationPanelProps {
  allIssues: any[]
}

export function AdminModerationPanel({ allIssues }: AdminModerationPanelProps) {
  const { toast } = useToast()
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: "hide" | "unhide" | "remove" | "approve" | "reject" | null
    reason: string
  }>({
    open: false,
    action: null,
    reason: ""
  })

  const currentUserId = "admin_user" // In real app, get from auth context

  // Get flagged issues (flagged but not hidden)
  const flaggedIssues = allIssues.filter(issue => {
    const status = getModerationStatus(issue.id)
    return status && status.flaggedCount > 0 && !status.isHidden
  })

  // Get hidden issues
  const hiddenIssues = getHiddenIssues(allIssues)

  // Get pending review issues
  const pendingReviewIssues = getPendingReviewIssues(allIssues)

  const handleModerationAction = async (
    action: "hide" | "unhide" | "remove" | "approve" | "reject"
  ) => {
    if (!selectedIssue || !actionDialog.reason.trim()) {
      toast({
        title: "Please provide a reason",
        description: "A reason is required for all moderation actions.",
        variant: "destructive"
      })
      return
    }

    try {
      const currentStatus = getModerationStatus(selectedIssue.id) || {
        id: selectedIssue.id,
        flaggedCount: 0,
        flaggedBy: [],
        isHidden: false,
        spamScore: 0,
        moderationActions: [],
        reviewStatus: "approved" as const
      }

      const updatedStatus = adminModerateIssue(
        selectedIssue.id,
        currentUserId,
        action,
        actionDialog.reason,
        currentStatus
      )

      updateModerationStatus(selectedIssue.id, updatedStatus)

      toast({
        title: `Issue ${action}`,
        description: `The issue has been ${action} successfully.`,
      })

      // Reset dialog
      setActionDialog({
        open: false,
        action: null,
        reason: ""
      })
      setSelectedIssue(null)
    } catch (error) {
      toast({
        title: "Error performing action",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const openActionDialog = (issue: any, action: "hide" | "unhide" | "remove" | "approve" | "reject") => {
    setSelectedIssue(issue)
    setActionDialog({
      open: true,
      action,
      reason: ""
    })
  }

  const getActionTitle = (action: string) => {
    switch (action) {
      case "hide": return "Hide Issue"
      case "unhide": return "Unhide Issue"
      case "remove": return "Remove Issue"
      case "approve": return "Approve Issue"
      case "reject": return "Reject Issue"
      default: return "Moderate Issue"
    }
  }

  const getActionDescription = (action: string) => {
    switch (action) {
      case "hide": return "This will hide the issue from public view but keep it in the system."
      case "unhide": return "This will make the issue visible to the public again."
      case "remove": return "This will permanently remove the issue from the system."
      case "approve": return "This will approve the issue and remove any flags."
      case "reject": return "This will reject the issue and hide it from view."
      default: return "Please provide a reason for this moderation action."
    }
  }

  const renderIssueCard = (issue: any, showActions: boolean = true) => {
    const moderationStatus = getModerationStatus(issue.id)
    const timeAgo = new Date(issue.createdAt).toLocaleDateString()

    return (
      <Card key={issue.id} className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{issue.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{issue.description}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {moderationStatus?.isHidden && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <EyeOff className="h-3 w-3" />
                  <span>Hidden</span>
                </Badge>
              )}
              {moderationStatus && moderationStatus.flaggedCount > 0 && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Flag className="h-3 w-3" />
                  <span>{moderationStatus.flaggedCount} flags</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span> {timeAgo}
              </div>
              <div>
                <span className="font-medium">Reporter:</span> {issue.createdBy}
              </div>
              <div>
                <span className="font-medium">Status:</span> {issue.status}
              </div>
              <div>
                <span className="font-medium">Category:</span> {issue.category}
              </div>
            </div>

            {moderationStatus && (
              <div className="bg-muted/50 rounded-lg p-3">
                <h5 className="font-medium text-sm mb-2">Moderation Details</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Flags: {moderationStatus.flaggedCount}</div>
                  <div>Spam Score: {moderationStatus.spamScore}/10</div>
                  <div>Review Status: {moderationStatus.reviewStatus}</div>
                  <div>Actions: {moderationStatus.moderationActions.length}</div>
                </div>
                {moderationStatus.hiddenReason && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Hidden: {moderationStatus.hiddenReason}
                  </p>
                )}
              </div>
            )}

            {showActions && (
              <div className="flex flex-wrap gap-2">
                {!moderationStatus?.isHidden ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openActionDialog(issue, "hide")}
                      className="text-destructive hover:text-destructive"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openActionDialog(issue, "approve")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openActionDialog(issue, "unhide")}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Unhide
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openActionDialog(issue, "reject")}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openActionDialog(issue, "remove")}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p className="text-muted-foreground">
            Manage flagged content and community safety
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {flaggedIssues.length} flagged
          </Badge>
          <Badge variant="destructive">
            {hiddenIssues.length} hidden
          </Badge>
          <Badge variant="outline">
            {pendingReviewIssues.length} pending review
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="flagged" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flagged" className="flex items-center space-x-2">
            <Flag className="h-4 w-4" />
            <span>Flagged ({flaggedIssues.length})</span>
          </TabsTrigger>
          <TabsTrigger value="hidden" className="flex items-center space-x-2">
            <EyeOff className="h-4 w-4" />
            <span>Hidden ({hiddenIssues.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Pending Review ({pendingReviewIssues.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="mt-6">
          <div className="space-y-4">
            {flaggedIssues.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Flag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No flagged issues to review</p>
                </CardContent>
              </Card>
            ) : (
              flaggedIssues.map(issue => renderIssueCard(issue))
            )}
          </div>
        </TabsContent>

        <TabsContent value="hidden" className="mt-6">
          <div className="space-y-4">
            {hiddenIssues.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <EyeOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hidden issues</p>
                </CardContent>
              </Card>
            ) : (
              hiddenIssues.map(issue => renderIssueCard(issue))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {pendingReviewIssues.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No issues pending review</p>
                </CardContent>
              </Card>
            ) : (
              pendingReviewIssues.map(issue => renderIssueCard(issue))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-destructive" />
              <span>{getActionTitle(actionDialog.action || "")}</span>
            </DialogTitle>
            <DialogDescription>
              {getActionDescription(actionDialog.action || "")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actionReason">Reason for action</Label>
              <Textarea
                id="actionReason"
                placeholder="Provide a detailed reason for this moderation action..."
                value={actionDialog.reason}
                onChange={(e) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog({ open: false, action: null, reason: "" })}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleModerationAction(actionDialog.action!)}
              disabled={!actionDialog.reason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm {actionDialog.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
