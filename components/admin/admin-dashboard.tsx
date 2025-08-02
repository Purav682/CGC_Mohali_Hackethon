"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag,
  Search,
  Filter,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  ExternalLink,
  History,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminModerationPanel } from "@/components/moderation/admin-moderation-panel"
import UserManagementPanel from "@/components/admin/user-management-panel"
import { getReportAnalytics } from "@/lib/user-management"
import { formatDateConsistent } from "@/lib/date-utils"
import { ClientOnly } from "@/components/client-wrapper"

// Mock data
const mockReports = [
  {
    id: "1",
    title: "Broken Street Light",
    description: "Street light has been out for 3 days",
    category: "lighting",
    status: "open",
    flaggedCount: 0,
    location: { address: "123 Main St, New York, NY" },
    createdAt: "2024-01-15T10:30:00Z",
    createdBy: "john_doe",
  },
  {
    id: "2",
    title: "Pothole on Broadway",
    description: "Large pothole causing damage to vehicles",
    category: "roads",
    status: "in-progress",
    flaggedCount: 2,
    location: { address: "456 Broadway, New York, NY" },
    createdAt: "2024-01-14T14:20:00Z",
    createdBy: "jane_smith",
  },
  {
    id: "3",
    title: "Overflowing Garbage Bin",
    description: "Garbage bin overflowing for days",
    category: "garbage",
    status: "resolved",
    flaggedCount: 0,
    location: { address: "789 Park Ave, New York, NY" },
    createdAt: "2024-01-13T09:15:00Z",
    createdBy: "mike_wilson",
  },
]

const categoryData = [
  { name: "Roads", value: 45, color: "#3b82f6" },
  { name: "Lighting", value: 25, color: "#f59e0b" },
  { name: "Garbage", value: 20, color: "#10b981" },
  { name: "Water", value: 7, color: "#ef4444" },
  { name: "Safety", value: 3, color: "#8b5cf6" },
]

const monthlyData = [
  { month: "Jan", reports: 65, resolved: 45 },
  { month: "Feb", reports: 78, resolved: 52 },
  { month: "Mar", reports: 90, resolved: 68 },
  { month: "Apr", reports: 81, resolved: 71 },
  { month: "May", reports: 95, resolved: 78 },
  { month: "Jun", reports: 88, resolved: 82 },
]

export function AdminDashboard() {
  const router = useRouter()
  const [reports, setReports] = useState(mockReports)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const updateReportStatus = (reportId: string, newStatus: string) => {
    setReports((prev) => prev.map((report) => (report.id === reportId ? { ...report, status: newStatus } : report)))
    toast({
      title: "Status updated",
      description: `Report status changed to ${newStatus}`,
    })
  }

  const flagReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) => (report.id === reportId ? { ...report, flaggedCount: report.flaggedCount + 1 } : report)),
    )
    toast({
      title: "Report flagged",
      description: "Report has been flagged for review",
    })
  }

  const filteredReports = reports.filter((report) => {
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
    const categories = {
      roads: "Roads & Infrastructure",
      lighting: "Lighting",
      garbage: "Garbage & Sanitation",
      water: "Water Issues",
      safety: "Public Safety",
      other: "Other",
    }
    return categories[category as keyof typeof categories] || category
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage civic issue reports and monitor community engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">-8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">923</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Reports Management</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Enhanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <ClientOnly>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          </ClientOnly>

          {/* Reports List */}
          <ClientOnly>
            <div className="space-y-4">
              {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    {report.flaggedCount > 0 && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <Flag className="h-3 w-3" />
                        <span>{report.flaggedCount} flags</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getStatusColor(report.status)}>{getStatusLabel(report.status)}</Badge>
                      <Badge variant="outline">{getCategoryLabel(report.category)}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{report.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateConsistent(report.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Reported by {report.createdBy}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Select value={report.status} onValueChange={(value) => updateReportStatus(report.id, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="sm" onClick={() => flagReport(report.id)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Flag
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push(`/issues/${report.id}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </ClientOnly>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <AdminModerationPanel currentAdminId="admin_001" />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Reports Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Reports & Resolutions</CardTitle>
                <CardDescription>Track report submissions and resolution rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reports" fill="#3b82f6" name="Reports" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Reports by Category</CardTitle>
                <CardDescription>Distribution of issues across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        <TabsContent value="users">
          <UserManagementPanel currentAdminId="admin_001" />
        </TabsContent>

        <TabsContent value="analytics">
          <EnhancedAnalyticsPanel />
        </TabsContent>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for civic issue management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">74%</div>
                  <div className="text-sm text-muted-foreground">Resolution Rate</div>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+8% this quarter</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2.3</div>
                  <div className="text-sm text-muted-foreground">Avg. Response Days</div>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">-15% improvement</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">856</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+23% this month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Enhanced Analytics Panel Component
function EnhancedAnalyticsPanel() {
  const analytics = getReportAnalytics()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enhanced Analytics</h2>
        <p className="text-muted-foreground">Comprehensive reporting and user engagement metrics</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues Posted</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReports}</div>
            <p className="text-xs text-muted-foreground">All-time reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reports/User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.userEngagement.averageReportsPerUser}</div>
            <p className="text-xs text-muted-foreground">Per registered user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.userEngagement.newUsersThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.mostReportedCategories[0]?.category}</div>
            <p className="text-xs text-muted-foreground">{analytics.mostReportedCategories[0]?.count} reports</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Most Reported Categories</CardTitle>
            <CardDescription>Category distribution of all reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.mostReportedCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-blue-${500 + index * 100}`} />
                    <span className="capitalize">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{category.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((category.count / analytics.totalReports) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Report Trends</CardTitle>
            <CardDescription>Monthly report submission trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.reportTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Reporters */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Most active community members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.userEngagement.topReporters.map((reporter, index) => (
                <div key={reporter.userId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{reporter.username}</div>
                      <div className="text-sm text-muted-foreground">Community contributor</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{reporter.count} reports</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((reporter.count / analytics.totalReports) * 100)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
