"use client"

import { useState } from "react"
import { Flag, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  flagIssue, 
  unflagIssue, 
  flagReasons, 
  getModerationStatus, 
  updateModerationStatus,
  IssueModerationStatus 
} from "@/lib/moderation"

interface FlagReportButtonProps {
  issueId: string
  currentUserId: string
  isCompact?: boolean
  showFlagCount?: boolean
  onFlagChange?: (newFlagCount: number, isHidden: boolean) => void
}

export function FlagReportButton({ 
  issueId, 
  currentUserId, 
  isCompact = false,
  showFlagCount = true,
  onFlagChange 
}: FlagReportButtonProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current moderation status
  const moderationStatus = getModerationStatus(issueId) || {
    id: issueId,
    flaggedCount: 0,
    flaggedBy: [],
    isHidden: false,
    spamScore: 0,
    moderationActions: [],
    reviewStatus: "approved" as const
  }

  const userHasFlagged = moderationStatus.flaggedBy.includes(currentUserId)

  const handleFlag = async () => {
    if (!selectedReason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for flagging this report.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const reason = selectedReason === "other" ? customReason : 
        flagReasons.find(r => r.value === selectedReason)?.label || selectedReason

      const updatedStatus = flagIssue(issueId, currentUserId, reason, moderationStatus)
      updateModerationStatus(issueId, updatedStatus)

      toast({
        title: "Report flagged",
        description: updatedStatus.isHidden 
          ? "This report has been flagged and hidden pending review."
          : "Thank you for helping keep our community safe.",
      })

      // Notify parent component
      onFlagChange?.(updatedStatus.flaggedCount, updatedStatus.isHidden)
      
      setIsOpen(false)
      setSelectedReason("")
      setCustomReason("")
    } catch (error) {
      toast({
        title: "Error flagging report",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnflag = async () => {
    setIsSubmitting(true)
    try {
      const updatedStatus = unflagIssue(issueId, currentUserId, moderationStatus)
      updateModerationStatus(issueId, updatedStatus)

      toast({
        title: "Flag removed",
        description: "Your flag has been removed from this report.",
      })

      // Notify parent component
      onFlagChange?.(updatedStatus.flaggedCount, updatedStatus.isHidden)
    } catch (error) {
      toast({
        title: "Error removing flag",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (moderationStatus.isHidden) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="destructive" className="flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>Hidden</span>
        </Badge>
        {showFlagCount && (
          <span className="text-xs text-muted-foreground">
            {moderationStatus.flaggedCount} flags
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {userHasFlagged ? (
        <Button
          variant="ghost"
          size={isCompact ? "sm" : "default"}
          onClick={handleUnflag}
          disabled={isSubmitting}
          className="text-destructive hover:text-destructive"
        >
          <Flag className="h-4 w-4 mr-1 fill-current" />
          {!isCompact && "Flagged"}
        </Button>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size={isCompact ? "sm" : "default"}
              className="text-muted-foreground hover:text-destructive"
            >
              <Flag className="h-4 w-4 mr-1" />
              {!isCompact && "Flag"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Flag This Report</span>
              </DialogTitle>
              <DialogDescription>
                Help us maintain a safe community by reporting inappropriate content.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for flagging</Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {flagReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customReason">Please specify</Label>
                  <Textarea
                    id="customReason"
                    placeholder="Describe why you're flagging this report..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              )}

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Reports flagged by multiple community members are automatically 
                  hidden pending review by moderators. False flagging may result in account restrictions.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFlag} 
                disabled={isSubmitting || !selectedReason || (selectedReason === "other" && !customReason.trim())}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSubmitting ? "Flagging..." : "Flag Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showFlagCount && moderationStatus.flaggedCount > 0 && (
        <span className="text-xs text-muted-foreground">
          {moderationStatus.flaggedCount} flags
        </span>
      )}
    </div>
  )
}

// Component for showing moderation status in admin views
export function ModerationStatusBadge({ issueId }: { issueId: string }) {
  const moderationStatus = getModerationStatus(issueId)
  
  if (!moderationStatus) return null

  if (moderationStatus.isHidden) {
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span>Hidden ({moderationStatus.flaggedCount} flags)</span>
      </Badge>
    )
  }

  if (moderationStatus.flaggedCount > 0) {
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Flag className="h-3 w-3" />
        <span>{moderationStatus.flaggedCount} flags</span>
      </Badge>
    )
  }

  return null
}

// Auto-hide notification component
export function AutoHideNotification({ issueId }: { issueId: string }) {
  const moderationStatus = getModerationStatus(issueId)
  
  if (!moderationStatus?.isHidden || !moderationStatus.hiddenReason?.includes("Auto-hidden")) {
    return null
  }

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Shield className="h-5 w-5 text-destructive mt-0.5" />
        <div>
          <h4 className="font-medium text-destructive">Content Hidden</h4>
          <p className="text-sm text-muted-foreground mt-1">
            This report has been automatically hidden due to multiple community flags 
            and is pending moderator review.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Flagged by {moderationStatus.flaggedCount} community members
          </p>
        </div>
      </div>
    </div>
  )
}
