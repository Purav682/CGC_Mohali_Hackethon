"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  UserX, 
  UserCheck, 
  AlertTriangle, 
  Shield, 
  Activity,
  Calendar,
  Mail,
  MapPin,
  Flag,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Ban,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"

import { 
  UserAccount, 
  UserBanAction,
  mockUsers,
  banUser,
  unbanUser,
  suspendUser,
  warnUser,
  calculateUserRiskScore,
  getUserStats,
  getUsersByStatus,
  getUserActivityLog,
  getUserBanHistory,
  getAutoModerationSuggestions
} from "@/lib/user-management"

interface UserManagementPanelProps {
  currentAdminId: string
}

export default function UserManagementPanel({ currentAdminId }: UserManagementPanelProps) {
  const [users, setUsers] = useState<UserAccount[]>(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned" | "suspended">("all")
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"ban" | "unban" | "suspend" | "warn" | null>(null)
  const [actionReason, setActionReason] = useState("")
  const [suspendDays, setSuspendDays] = useState(7)
  const [stats, setStats] = useState(getUserStats())
  const [autoSuggestions, setAutoSuggestions] = useState(getAutoModerationSuggestions())

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getUserStats())
      setAutoSuggestions(getAutoModerationSuggestions())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Filter users based on search and status
  useEffect(() => {
    let filtered = getUsersByStatus(statusFilter)
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredUsers(filtered)
  }, [searchTerm, statusFilter, users])

  const handleUserAction = async (action: "ban" | "unban" | "suspend" | "warn", user: UserAccount) => {
    try {
      let result: UserBanAction
      
      switch (action) {
        case "ban":
          result = banUser(user.id, currentAdminId, actionReason)
          break
        case "unban":
          result = unbanUser(user.id, currentAdminId, actionReason)
          break
        case "suspend":
          result = suspendUser(user.id, currentAdminId, actionReason, suspendDays)
          break
        case "warn":
          result = warnUser(user.id, currentAdminId, actionReason)
          break
        default:
          throw new Error("Invalid action")
      }

      // Update local state
      setUsers([...mockUsers])
      setStats(getUserStats())
      setAutoSuggestions(getAutoModerationSuggestions())
      
      // Reset form
      setIsActionDialogOpen(false)
      setActionType(null)
      setActionReason("")
      setSuspendDays(7)
      setSelectedUser(null)

      // Show success message (in real app, use toast)
      console.log(`User ${action} successful:`, result)

    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    }
  }

  const openActionDialog = (action: "ban" | "unban" | "suspend" | "warn", user: UserAccount) => {
    setSelectedUser(user)
    setActionType(action)
    setIsActionDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getRiskBadgeColor = (score: number) => {
    if (score > 80) return "destructive"
    if (score > 60) return "secondary"
    if (score > 40) return "outline"
    return "default"
  }

  const getTrustScoreColor = (score: number) => {
    if (score > 80) return "text-green-600"
    if (score > 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.suspendedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.verifiedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trust Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrustScoreColor(stats.averageTrustScore)}`}>
              {stats.averageTrustScore}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="suggestions">Auto-Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, bans, and moderation actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by username, email, or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="grid gap-4">
            {filteredUsers.map((user) => {
              const riskScore = calculateUserRiskScore(user)
              return (
                <Card key={user.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/api/placeholder/48/48`} />
                        <AvatarFallback>
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {user.isBanned && (
                            <Badge variant="destructive">
                              {user.banExpiresAt ? "Suspended" : "Banned"}
                            </Badge>
                          )}
                          <Badge variant={user.verificationStatus === "verified" ? "default" : "outline"}>
                            {user.verificationStatus}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.username} ({user.email})
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Joined {formatDate(user.joinDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Flag className="h-3 w-3 mr-1" />
                              {user.reportCount} reports
                            </span>
                            <span className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {user.flaggedReports} flagged
                            </span>
                            <span className={`flex items-center ${getTrustScoreColor(user.trustScore)}`}>
                              <Shield className="h-3 w-3 mr-1" />
                              Trust: {user.trustScore}%
                            </span>
                          </div>
                          
                          {user.isBanned && user.banReason && (
                            <div className="flex items-start space-x-1 text-red-600">
                              <Ban className="h-3 w-3 mt-0.5" />
                              <span>{user.banReason}</span>
                            </div>
                          )}
                        </div>
                        
                        {riskScore > 50 && (
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Risk Score:</Label>
                            <Badge variant={getRiskBadgeColor(riskScore)}>
                              {riskScore}% Risk
                            </Badge>
                            <Progress value={riskScore} className="w-20 h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {user.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog("unban", user)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog("warn", user)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Warn
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog("suspend", user)}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openActionDialog("ban", user)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Ban
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Moderation Suggestions</CardTitle>
              <CardDescription>
                AI-powered recommendations for user moderation based on behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {autoSuggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <p>No high-risk users detected. All users appear to be behaving appropriately.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {autoSuggestions.map((suggestion) => (
                    <Card key={suggestion.userId} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{suggestion.user.username}</h4>
                            <Badge variant={getRiskBadgeColor(suggestion.riskScore)}>
                              {suggestion.riskScore}% Risk
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                          <div className="text-xs text-muted-foreground">
                            Reports: {suggestion.user.reportCount} | 
                            Flagged: {suggestion.user.flaggedReports} | 
                            Trust: {suggestion.user.trustScore}%
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openActionDialog("warn", suggestion.user)}
                          >
                            Warn
                          </Button>
                          {suggestion.suggestion === "Suspend User" && (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => openActionDialog("suspend", suggestion.user)}
                            >
                              Suspend
                            </Button>
                          )}
                          {suggestion.suggestion === "Ban User" && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => openActionDialog("ban", suggestion.user)}
                            >
                              Ban
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "ban" && "Ban User"}
              {actionType === "unban" && "Unban User"}
              {actionType === "suspend" && "Suspend User"}
              {actionType === "warn" && "Warn User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  {actionType === "ban" && `Permanently ban ${selectedUser.username} from the platform.`}
                  {actionType === "unban" && `Remove ban from ${selectedUser.username} and restore access.`}
                  {actionType === "suspend" && `Temporarily suspend ${selectedUser.username} from the platform.`}
                  {actionType === "warn" && `Issue a warning to ${selectedUser.username}.`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === "suspend" && (
              <div>
                <Label htmlFor="duration">Suspension Duration (days)</Label>
                <Select value={suspendDays.toString()} onValueChange={(value) => setSuspendDays(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Provide a detailed reason for this action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "ban" ? "destructive" : "default"}
              onClick={() => selectedUser && actionType && handleUserAction(actionType, selectedUser)}
              disabled={!actionReason.trim()}
            >
              Confirm {actionType === "ban" ? "Ban" : actionType === "unban" ? "Unban" : actionType === "suspend" ? "Suspend" : "Warning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
