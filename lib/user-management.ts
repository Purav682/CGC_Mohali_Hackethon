// User Management & Banning System for CivicTrack
// Real-time user moderation and account management

export interface UserAccount {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  joinDate: string
  lastLogin: string
  isActive: boolean
  isBanned: boolean
  banReason?: string
  bannedAt?: string
  bannedBy?: string
  banExpiresAt?: string
  role: "user" | "admin" | "moderator"
  reportCount: number
  flaggedReports: number
  verificationStatus: "unverified" | "verified" | "blocked"
  trustScore: number // 0-100 based on community behavior
}

export interface UserBanAction {
  id: string
  userId: string
  moderatorId: string
  action: "ban" | "unban" | "suspend" | "warning"
  reason: string
  duration?: number // Duration in days (null = permanent)
  timestamp: string
  expiresAt?: string
}

export interface UserActivity {
  id: string
  userId: string
  action: "report_created" | "issue_flagged" | "login" | "logout" | "comment_posted"
  details: string
  timestamp: string
  ipAddress?: string
}

// Mock user data for demonstration
export const mockUsers: UserAccount[] = [
  {
    id: "user_001",
    username: "john_doe",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    joinDate: "2024-01-10T10:00:00Z",
    lastLogin: "2024-01-20T15:30:00Z",
    isActive: true,
    isBanned: false,
    role: "user",
    reportCount: 15,
    flaggedReports: 0,
    verificationStatus: "verified",
    trustScore: 85
  },
  {
    id: "user_002", 
    username: "jane_smith",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    joinDate: "2024-01-05T09:00:00Z",
    lastLogin: "2024-01-22T11:20:00Z",
    isActive: true,
    isBanned: false,
    role: "user",
    reportCount: 8,
    flaggedReports: 1,
    verificationStatus: "verified",
    trustScore: 92
  },
  {
    id: "user_003",
    username: "spam_user_123",
    email: "spam@example.com", 
    firstName: "Spam",
    lastName: "User",
    joinDate: "2024-01-18T14:00:00Z",
    lastLogin: "2024-01-19T16:45:00Z",
    isActive: false,
    isBanned: true,
    banReason: "Multiple spam reports and inappropriate content",
    bannedAt: "2024-01-19T17:00:00Z",
    bannedBy: "admin_001",
    role: "user",
    reportCount: 25,
    flaggedReports: 12,
    verificationStatus: "blocked",
    trustScore: 15
  },
  {
    id: "user_004",
    username: "mike_wilson",
    email: "mike@example.com",
    firstName: "Mike", 
    lastName: "Wilson",
    joinDate: "2023-12-15T08:00:00Z",
    lastLogin: "2024-01-21T10:15:00Z",
    isActive: true,
    isBanned: false,
    role: "user",
    reportCount: 32,
    flaggedReports: 2,
    verificationStatus: "verified",
    trustScore: 78
  }
]

export const mockBanActions: UserBanAction[] = [
  {
    id: "ban_001",
    userId: "user_003",
    moderatorId: "admin_001",
    action: "ban",
    reason: "Multiple spam reports and inappropriate content",
    timestamp: "2024-01-19T17:00:00Z"
  }
]

export const mockUserActivities: UserActivity[] = [
  {
    id: "activity_001",
    userId: "user_001",
    action: "report_created",
    details: "Created report: Broken Street Light",
    timestamp: "2024-01-20T14:30:00Z"
  },
  {
    id: "activity_002",
    userId: "user_003", 
    action: "issue_flagged",
    details: "Flagged multiple issues as spam",
    timestamp: "2024-01-19T16:30:00Z"
  }
]

// Ban a user
export function banUser(
  userId: string,
  moderatorId: string,
  reason: string,
  duration?: number // days, undefined = permanent
): UserBanAction {
  const banAction: UserBanAction = {
    id: `ban_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    moderatorId,
    action: "ban",
    reason,
    timestamp: new Date().toISOString(),
    duration,
    expiresAt: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : undefined
  }

  // Update user status
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      isBanned: true,
      isActive: false,
      banReason: reason,
      bannedAt: banAction.timestamp,
      bannedBy: moderatorId,
      banExpiresAt: banAction.expiresAt,
      verificationStatus: "blocked"
    }
  }

  mockBanActions.push(banAction)
  return banAction
}

// Unban a user
export function unbanUser(userId: string, moderatorId: string, reason: string): UserBanAction {
  const unbanAction: UserBanAction = {
    id: `unban_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    moderatorId,
    action: "unban",
    reason,
    timestamp: new Date().toISOString()
  }

  // Update user status
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      isBanned: false,
      isActive: true,
      banReason: undefined,
      bannedAt: undefined,
      bannedBy: undefined,
      banExpiresAt: undefined,
      verificationStatus: "verified"
    }
  }

  mockBanActions.push(unbanAction)
  return unbanAction
}

// Suspend user temporarily
export function suspendUser(
  userId: string,
  moderatorId: string,
  reason: string,
  days: number
): UserBanAction {
  const suspendAction: UserBanAction = {
    id: `suspend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    moderatorId,
    action: "suspend",
    reason,
    duration: days,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  }

  // Update user status
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      isBanned: true,
      isActive: false,
      banReason: `Suspended: ${reason}`,
      bannedAt: suspendAction.timestamp,
      bannedBy: moderatorId,
      banExpiresAt: suspendAction.expiresAt,
      verificationStatus: "blocked"
    }
  }

  mockBanActions.push(suspendAction)
  return suspendAction
}

// Issue warning to user
export function warnUser(userId: string, moderatorId: string, reason: string): UserBanAction {
  const warningAction: UserBanAction = {
    id: `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    moderatorId,
    action: "warning",
    reason,
    timestamp: new Date().toISOString()
  }

  // Reduce trust score
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      trustScore: Math.max(0, mockUsers[userIndex].trustScore - 10)
    }
  }

  mockBanActions.push(warningAction)
  return warningAction
}

// Calculate user risk score
export function calculateUserRiskScore(user: UserAccount): number {
  let score = 0

  // High flagged reports ratio
  if (user.reportCount > 0) {
    const flaggedRatio = user.flaggedReports / user.reportCount
    score += flaggedRatio * 40
  }

  // Low trust score
  score += (100 - user.trustScore) * 0.3

  // Recent ban history
  const recentBans = mockBanActions.filter(
    action => action.userId === user.id && 
    action.action === "ban" &&
    new Date(action.timestamp) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
  )
  score += recentBans.length * 20

  // Unverified status
  if (user.verificationStatus === "unverified") {
    score += 15
  }

  return Math.min(100, Math.round(score))
}

// Get user statistics
export function getUserStats() {
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.isActive).length
  const bannedUsers = mockUsers.filter(u => u.isBanned).length
  const verifiedUsers = mockUsers.filter(u => u.verificationStatus === "verified").length

  return {
    totalUsers,
    activeUsers,
    bannedUsers,
    verifiedUsers,
    suspendedUsers: mockUsers.filter(u => u.isBanned && u.banExpiresAt).length,
    averageTrustScore: Math.round(
      mockUsers.reduce((sum, user) => sum + user.trustScore, 0) / totalUsers
    )
  }
}

// Get users by status
export function getUsersByStatus(status: "active" | "banned" | "suspended" | "all"): UserAccount[] {
  switch (status) {
    case "active":
      return mockUsers.filter(u => u.isActive && !u.isBanned)
    case "banned":
      return mockUsers.filter(u => u.isBanned && !u.banExpiresAt)
    case "suspended":
      return mockUsers.filter(u => u.isBanned && u.banExpiresAt)
    case "all":
    default:
      return mockUsers
  }
}

// Get user activity log
export function getUserActivityLog(userId: string): UserActivity[] {
  return mockUserActivities.filter(activity => activity.userId === userId)
}

// Get user ban history
export function getUserBanHistory(userId: string): UserBanAction[] {
  return mockBanActions.filter(action => action.userId === userId)
}

// Check if user can perform action
export function canUserPerformAction(userId: string, action: string): boolean {
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return false

  // Banned users cannot perform any actions
  if (user.isBanned) return false

  // Check if suspension has expired
  if (user.banExpiresAt && new Date(user.banExpiresAt) < new Date()) {
    // Auto-unban expired suspensions
    unbanUser(userId, "system", "Suspension period expired")
    return true
  }

  // Low trust score users have limited actions
  if (user.trustScore < 30 && action === "report") {
    return false // Prevent spam reporting
  }

  return true
}

// Auto-moderation suggestions
export function getAutoModerationSuggestions(): Array<{
  userId: string
  user: UserAccount
  riskScore: number
  suggestion: string
  reason: string
}> {
  return mockUsers
    .map(user => ({
      userId: user.id,
      user,
      riskScore: calculateUserRiskScore(user),
      suggestion: "",
      reason: ""
    }))
    .filter(item => item.riskScore > 60)
    .map(item => {
      if (item.riskScore > 80) {
        item.suggestion = "Ban User"
        item.reason = "High risk score indicating spam/abuse behavior"
      } else if (item.riskScore > 70) {
        item.suggestion = "Suspend User"
        item.reason = "Elevated risk score suggesting problematic behavior"
      } else {
        item.suggestion = "Issue Warning"
        item.reason = "Moderate risk score requiring attention"
      }
      return item
    })
}

// Report analytics for admin
export interface ReportAnalytics {
  totalReports: number
  categoryBreakdown: { [category: string]: number }
  mostReportedCategories: Array<{ category: string; count: number }>
  reportTrends: Array<{ month: string; count: number }>
  userEngagement: {
    topReporters: Array<{ userId: string; username: string; count: number }>
    averageReportsPerUser: number
    newUsersThisMonth: number
  }
}

export function getReportAnalytics(): ReportAnalytics {
  // Calculate from all users' report counts
  const totalReports = mockUsers.reduce((sum, user) => sum + user.reportCount, 0)
  
  // Mock category breakdown (in real app, would query actual reports)
  const categoryBreakdown = {
    "roads": 45,
    "lighting": 25, 
    "garbage": 20,
    "water": 7,
    "safety": 3
  }

  const mostReportedCategories = Object.entries(categoryBreakdown)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const reportTrends = [
    { month: "Jan", count: 65 },
    { month: "Feb", count: 78 },
    { month: "Mar", count: 90 },
    { month: "Apr", count: 81 },
    { month: "May", count: 95 }
  ]

  const topReporters = mockUsers
    .filter(u => u.reportCount > 0)
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 5)
    .map(user => ({
      userId: user.id,
      username: user.username,
      count: user.reportCount
    }))

  const averageReportsPerUser = Math.round(totalReports / mockUsers.length)
  const newUsersThisMonth = mockUsers.filter(
    u => new Date(u.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length

  return {
    totalReports,
    categoryBreakdown,
    mostReportedCategories,
    reportTrends,
    userEngagement: {
      topReporters,
      averageReportsPerUser,
      newUsersThisMonth
    }
  }
}
