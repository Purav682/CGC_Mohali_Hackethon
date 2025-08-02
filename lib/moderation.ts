// Moderation & Safety System for CivicTrack
// Real-time spam detection and auto-hiding functionality

export interface ModerationAction {
  id: string
  issueId: string
  userId: string
  action: "flag" | "unflag" | "hide" | "unhide" | "remove" | "approve" | "reject"
  reason: string
  timestamp: string
  moderatorId?: string
}

export interface ModerationSettings {
  autoHideThreshold: number // Number of flags to auto-hide
  spamDetectionEnabled: boolean
  communityModerationEnabled: boolean
  adminReviewRequired: boolean
}

export interface IssueModerationStatus {
  id: string
  flaggedCount: number
  flaggedBy: string[] // User IDs who flagged
  isHidden: boolean
  hiddenAt?: string
  hiddenReason?: string
  spamScore: number
  moderationActions: ModerationAction[]
  reviewStatus: "pending" | "approved" | "rejected" | "under_review"
}

// Default moderation settings
export const defaultModerationSettings: ModerationSettings = {
  autoHideThreshold: 3, // Auto-hide after 3 flags
  spamDetectionEnabled: true,
  communityModerationEnabled: true,
  adminReviewRequired: true
}

// Spam detection keywords and patterns
const spamKeywords = [
  "spam", "fake", "test", "lorem ipsum", "click here", "buy now", 
  "free money", "get rich", "make money fast", "viagra", "casino"
]

const suspiciousPatterns = [
  /(.)\1{4,}/, // Repeated characters (aaaaa, !!!!!!)
  /[A-Z]{10,}/, // All caps long text
  /\d{10,}/, // Long number sequences
  /(.{1,3})\1{5,}/, // Repeated short sequences
  /[^\w\s]{5,}/, // Excessive special characters
]

// Calculate spam score for an issue
export function calculateSpamScore(title: string, description: string): number {
  let score = 0
  const content = `${title} ${description}`.toLowerCase()

  // Check for spam keywords
  spamKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      score += 2
    }
  })

  // Check for suspicious patterns
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      score += 1
    }
  })

  // Check content quality
  if (title.length < 5) score += 1
  if (description.length < 10) score += 1
  if (content.split(' ').length < 3) score += 2

  return Math.min(score, 10) // Cap at 10
}

// Check if an issue should be auto-hidden
export function shouldAutoHide(
  flagCount: number, 
  spamScore: number, 
  settings: ModerationSettings = defaultModerationSettings
): boolean {
  if (!settings.communityModerationEnabled) return false
  
  // Auto-hide if flagged by multiple users
  if (flagCount >= settings.autoHideThreshold) return true
  
  // Auto-hide if high spam score
  if (settings.spamDetectionEnabled && spamScore >= 7) return true
  
  return false
}

// Flag an issue by a user
export function flagIssue(
  issueId: string, 
  userId: string, 
  reason: string,
  currentStatus: IssueModerationStatus
): IssueModerationStatus {
  // Prevent duplicate flags from same user
  if (currentStatus.flaggedBy.includes(userId)) {
    return currentStatus
  }

  const newAction: ModerationAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    issueId,
    userId,
    action: "flag",
    reason,
    timestamp: new Date().toISOString()
  }

  const updatedStatus: IssueModerationStatus = {
    ...currentStatus,
    flaggedCount: currentStatus.flaggedCount + 1,
    flaggedBy: [...currentStatus.flaggedBy, userId],
    moderationActions: [...currentStatus.moderationActions, newAction]
  }

  // Check if should auto-hide
  if (shouldAutoHide(updatedStatus.flaggedCount, updatedStatus.spamScore)) {
    updatedStatus.isHidden = true
    updatedStatus.hiddenAt = new Date().toISOString()
    updatedStatus.hiddenReason = `Auto-hidden after ${updatedStatus.flaggedCount} flags`
    updatedStatus.reviewStatus = "pending"

    // Add hide action
    const hideAction: ModerationAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issueId,
      userId: "system",
      action: "hide",
      reason: `Auto-hidden: ${updatedStatus.flaggedCount} flags`,
      timestamp: new Date().toISOString()
    }
    updatedStatus.moderationActions.push(hideAction)
  }

  return updatedStatus
}

// Remove flag from an issue
export function unflagIssue(
  issueId: string, 
  userId: string, 
  currentStatus: IssueModerationStatus
): IssueModerationStatus {
  if (!currentStatus.flaggedBy.includes(userId)) {
    return currentStatus
  }

  const newAction: ModerationAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    issueId,
    userId,
    action: "unflag",
    reason: "User removed flag",
    timestamp: new Date().toISOString()
  }

  const updatedStatus: IssueModerationStatus = {
    ...currentStatus,
    flaggedCount: Math.max(0, currentStatus.flaggedCount - 1),
    flaggedBy: currentStatus.flaggedBy.filter(id => id !== userId),
    moderationActions: [...currentStatus.moderationActions, newAction]
  }

  // Check if should un-hide (only if auto-hidden, not manually hidden)
  if (updatedStatus.isHidden && 
      updatedStatus.hiddenReason?.includes("Auto-hidden") &&
      updatedStatus.flaggedCount < defaultModerationSettings.autoHideThreshold) {
    updatedStatus.isHidden = false
    updatedStatus.hiddenAt = undefined
    updatedStatus.hiddenReason = undefined
    updatedStatus.reviewStatus = "approved"

    // Add unhide action
    const unhideAction: ModerationAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issueId,
      userId: "system",
      action: "unhide",
      reason: "Auto-unhidden: flags dropped below threshold",
      timestamp: new Date().toISOString()
    }
    updatedStatus.moderationActions.push(unhideAction)
  }

  return updatedStatus
}

// Admin moderation actions
export function adminModerateIssue(
  issueId: string,
  moderatorId: string,
  action: "hide" | "unhide" | "remove" | "approve" | "reject",
  reason: string,
  currentStatus: IssueModerationStatus
): IssueModerationStatus {
  const newAction: ModerationAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    issueId,
    userId: "admin",
    moderatorId,
    action,
    reason,
    timestamp: new Date().toISOString()
  }

  const updatedStatus: IssueModerationStatus = {
    ...currentStatus,
    moderationActions: [...currentStatus.moderationActions, newAction]
  }

  switch (action) {
    case "hide":
      updatedStatus.isHidden = true
      updatedStatus.hiddenAt = new Date().toISOString()
      updatedStatus.hiddenReason = `Moderator action: ${reason}`
      updatedStatus.reviewStatus = "rejected"
      break
    case "unhide":
      updatedStatus.isHidden = false
      updatedStatus.hiddenAt = undefined
      updatedStatus.hiddenReason = undefined
      updatedStatus.reviewStatus = "approved"
      break
    case "approve":
      updatedStatus.reviewStatus = "approved"
      updatedStatus.isHidden = false
      break
    case "reject":
      updatedStatus.reviewStatus = "rejected"
      updatedStatus.isHidden = true
      updatedStatus.hiddenAt = new Date().toISOString()
      updatedStatus.hiddenReason = `Rejected by moderator: ${reason}`
      break
  }

  return updatedStatus
}

// Get user-friendly flag reason options
export const flagReasons = [
  { value: "spam", label: "Spam or irrelevant content" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "duplicate", label: "Duplicate report" },
  { value: "fake", label: "False or misleading information" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "other", label: "Other (please specify)" }
]

// Mock data for demonstration
export const mockModerationStatuses: IssueModerationStatus[] = [
  {
    id: "issue1",
    flaggedCount: 0,
    flaggedBy: [],
    isHidden: false,
    spamScore: 1,
    moderationActions: [],
    reviewStatus: "approved"
  },
  {
    id: "issue2", 
    flaggedCount: 2,
    flaggedBy: ["user1", "user2"],
    isHidden: false,
    spamScore: 2,
    moderationActions: [],
    reviewStatus: "under_review"
  },
  {
    id: "issue3",
    flaggedCount: 4,
    flaggedBy: ["user1", "user2", "user3", "user4"],
    isHidden: true,
    hiddenAt: "2024-01-15T10:30:00Z",
    hiddenReason: "Auto-hidden after 4 flags",
    spamScore: 6,
    moderationActions: [],
    reviewStatus: "pending"
  }
]

// Utility functions
export function getModerationStatus(issueId: string): IssueModerationStatus | undefined {
  return mockModerationStatuses.find(status => status.id === issueId)
}

export function updateModerationStatus(issueId: string, newStatus: IssueModerationStatus): void {
  const index = mockModerationStatuses.findIndex(status => status.id === issueId)
  if (index !== -1) {
    mockModerationStatuses[index] = newStatus
  } else {
    mockModerationStatuses.push(newStatus)
  }
}

export function getVisibleIssues(allIssues: any[]): any[] {
  return allIssues.filter(issue => {
    const moderationStatus = getModerationStatus(issue.id)
    return !moderationStatus?.isHidden
  })
}

export function getHiddenIssues(allIssues: any[]): any[] {
  return allIssues.filter(issue => {
    const moderationStatus = getModerationStatus(issue.id)
    return moderationStatus?.isHidden
  })
}

export function getPendingReviewIssues(allIssues: any[]): any[] {
  return allIssues.filter(issue => {
    const moderationStatus = getModerationStatus(issue.id)
    return moderationStatus?.reviewStatus === "pending"
  })
}
