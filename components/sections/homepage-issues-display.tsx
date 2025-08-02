"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  MapPin, 
  Calendar, 
  Flag,
  ExternalLink,
  Filter,
  Grid3X3,
  List,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getFilterCategories, getCategoryByValue } from "@/lib/categories"
import { FlagReportButton } from "@/components/moderation/flag-report-button"

// Mock issues data (in a real app, this would come from an API)
const mockIssues = [
  {
    id: "1",
    title: "Broken Street Light on Main Street",
    description: "The street light has been flickering for weeks and now completely out. Makes walking unsafe at night.",
    category: "lighting",
    status: "open",
    location: { lat: 40.7128, lng: -74.006, address: "123 Main St, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-15T10:30:00Z",
    createdBy: "john_doe",
    priority: "high"
  },
  {
    id: "2",
    title: "Large Pothole on Broadway",
    description: "Deep pothole causing damage to vehicles. Has been getting worse over past month.",
    category: "roads",
    status: "in-progress",
    location: { lat: 40.7589, lng: -73.9851, address: "456 Broadway, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 2,
    createdAt: "2024-01-14T14:20:00Z",
    createdBy: "jane_smith",
    priority: "medium"
  },
  {
    id: "3",
    title: "Overflowing Garbage Bins",
    description: "Multiple garbage bins overflowing for days, attracting pests and creating unsanitary conditions.",
    category: "cleanliness",
    status: "resolved",
    location: { lat: 40.7282, lng: -74.0000, address: "789 Park Ave, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-13T09:15:00Z",
    createdBy: "mike_wilson",
    priority: "medium"
  },
  {
    id: "4",
    title: "Water Leak in Central Park",
    description: "Major water pipe leak creating puddles and low pressure in nearby buildings.",
    category: "water",
    status: "open",
    location: { lat: 40.7829, lng: -73.9654, address: "Central Park West, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 1,
    createdAt: "2024-01-16T16:45:00Z",
    createdBy: "resident_456",
    priority: "urgent"
  },
  {
    id: "5",
    title: "Open Manhole Cover",
    description: "Dangerous open manhole without proper barriers. Safety hazard for pedestrians and vehicles.",
    category: "safety",
    status: "in-progress",
    location: { lat: 40.7488, lng: -73.9857, address: "42nd St & 7th Ave, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 5,
    createdAt: "2024-01-12T12:30:00Z",
    createdBy: "concerned_citizen",
    priority: "urgent"
  },
  {
    id: "6",
    title: "Fallen Tree Blocking Sidewalk",
    description: "Large tree branch fell during storm, completely blocking pedestrian access.",
    category: "obstructions",
    status: "resolved",
    location: { lat: 40.7614, lng: -73.9776, address: "Central Park East, New York, NY" },
    images: ["/placeholder.svg?height=200&width=300"],
    flaggedCount: 0,
    createdAt: "2024-01-11T08:00:00Z",
    createdBy: "park_visitor",
    priority: "high"
  }
]

interface HomepageIssuesDisplayProps {
  maxIssues?: number
  showFilters?: boolean
  title?: string
  description?: string
}

export function HomepageIssuesDisplay({ 
  maxIssues = 50, 
  showFilters = true,
  title = "Recent Community Issues",
  description = "Stay informed about civic issues in your area and see how they're being resolved"
}: HomepageIssuesDisplayProps) {
  const router = useRouter()
  const [issues] = useState(mockIssues)
  const [filteredIssues, setFilteredIssues] = useState(mockIssues)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
    priority: "all"
  })

  const categories = getFilterCategories()
  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
  ]
  
  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ]

  // Filter issues based on current filters
  useEffect(() => {
    let filtered = issues

    // Apply filters
    if (filters.category !== "all") {
      filtered = filtered.filter((issue) => issue.category === filters.category)
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((issue) => issue.status === filters.status)
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter((issue) => issue.priority === filters.priority)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower) ||
          issue.location.address.toLowerCase().includes(searchLower)
      )
    }

    // Limit number of issues shown
    filtered = filtered.slice(0, maxIssues)
    
    setFilteredIssues(filtered)
  }, [issues, filters, maxIssues])

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "default"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-3 w-3" />
      case "high":
        return <TrendingUp className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getCategoryLabel = (category: string) => {
    return getCategoryByValue(category)?.label || category
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const issueStats = {
    total: issues.length,
    open: issues.filter(i => i.status === "open").length,
    inProgress: issues.filter(i => i.status === "in-progress").length,
    resolved: issues.filter(i => i.status === "resolved").length,
    urgent: issues.filter(i => i.priority === "urgent").length
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background via-background to-muted/20 page-enter">
      <div className="container">
        {/* Header with Modern Design */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-6 hero-title">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">{description}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Modern Stats Cards with Animations */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          <div className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
              <Flag className="h-5 w-5 text-primary float-animation" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text-primary">{issueStats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Community reports</div>
            </CardContent>
          </div>

          <div className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500 glow-effect" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text-danger">{issueStats.open}</div>
              <div className="text-xs text-muted-foreground mt-1">Needs attention</div>
            </CardContent>
          </div>

          <div className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text-warning">{issueStats.inProgress}</div>
              <div className="text-xs text-muted-foreground mt-1">Being resolved</div>
            </CardContent>
          </div>

          <div className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text-success">{issueStats.resolved}</div>
              <div className="text-xs text-muted-foreground mt-1">Completed</div>
            </CardContent>
          </div>

          <div className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Urgent</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600 glow-effect" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text-danger">{issueStats.urgent}</div>
              <div className="text-xs text-muted-foreground mt-1">High priority</div>
            </CardContent>
          </div>
        </div>

        {/* Modern Filters with Glass Effect */}
        {showFilters && (
          <div className="modern-card glass-effect mb-10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Filter className="h-6 w-6 text-primary" />
                <span className="gradient-text-primary">Filter Issues</span>
              </CardTitle>
              <CardDescription className="text-base">
                Use filters to find specific types of issues or search for particular problems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Modern Search */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search issues..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="modern-input pl-12 h-12 text-base"
                  />
                </div>

                {/* Category Filter */}
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="modern-input h-12">
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

                {/* Status Filter */}
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="modern-input h-12">
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

                {/* Priority Filter */}
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="modern-input h-12">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Modern View Mode Toggle */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "gradient-button" : "modern-input border-2"}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "gradient-button" : "modern-input border-2"}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        )}

        {/* Modern Results Summary */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-muted/30 backdrop-blur-sm">
          <div className="text-lg font-medium text-muted-foreground">
            Showing <span className="text-primary font-bold">{filteredIssues.length}</span> of <span className="text-secondary font-bold">{issues.length}</span> issues
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/issues")}
              className="glass-effect border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <List className="h-5 w-5 mr-2" />
              View All Issues
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/map")}
              className="gradient-button"
            >
              <MapPin className="h-5 w-5 mr-2" />
              View on Map
            </Button>
          </div>
        </div>

        {/* Modern Issues Display */}
        {filteredIssues.length === 0 ? (
          <div className="modern-card text-center py-16">
            <CardContent>
              <Search className="h-16 w-16 mx-auto mb-6 text-muted-foreground float-animation" />
              <h3 className="text-2xl font-bold mb-4 gradient-text-primary">No Issues Found</h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Try adjusting your filters or search terms to see more results.
              </p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setFilters({ category: "all", status: "all", search: "", priority: "all" })}
                className="gradient-button"
              >
                Clear Filters
              </Button>
            </CardContent>
          </div>
        ) : (
          <div className={`${
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              : "space-y-6"
          }`}>
            {filteredIssues.map((issue, index) => (
              <div key={issue.id} className="modern-card group" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                        {issue.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge 
                          variant={getStatusColor(issue.status)} 
                          className={`flex items-center gap-2 px-3 py-1 text-sm ${
                            issue.status === "open" ? "status-open" : 
                            issue.status === "in-progress" ? "status-progress" : 
                            "status-resolved"
                          }`}
                        >
                          {getStatusIcon(issue.status)}
                          {getStatusLabel(issue.status)}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 text-sm border-primary/30">
                          {getCategoryLabel(issue.category)}
                        </Badge>
                        <Badge 
                          variant={getPriorityColor(issue.priority)} 
                          className={`flex items-center gap-1 px-3 py-1 text-sm ${
                            issue.priority === "urgent" ? "priority-urgent" : 
                            issue.priority === "high" ? "priority-high" : 
                            issue.priority === "medium" ? "priority-medium" : 
                            "priority-low"
                          }`}
                        >
                          {getPriorityIcon(issue.priority)}
                          {issue.priority}
                        </Badge>
                      </div>
                    </div>
                    {issue.flaggedCount > 0 && (
                      <Flag className="h-5 w-5 text-destructive flex-shrink-0 ml-3 glow-effect" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-3 mb-6 text-base leading-relaxed">
                    {issue.description}
                  </CardDescription>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="truncate">{issue.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <span>Reported {formatDate(issue.createdAt)}</span>
                    </div>
                  </div>

                  <Separator className="my-6 bg-gradient-to-r from-transparent via-border to-transparent" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FlagReportButton 
                        issueId={issue.id}
                        currentUserId="user_123"
                        size="sm"
                        variant="outline"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/issues/${issue.id}`)}
                        className="hover:border-primary hover:text-primary transition-all"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/map?issue=${issue.id}`)}
                        className="gradient-button text-sm"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Map
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        )}

        {/* Modern View More Button */}
        {filteredIssues.length >= maxIssues && (
          <div className="text-center mt-12">
            <div className="relative inline-block space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/issues")}
                className="glass-effect border-primary/30 hover:border-primary hover:bg-primary/10 text-lg px-8 py-4 rounded-2xl"
              >
                <List className="h-5 w-5 mr-3" />
                Browse All Issues
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/map")}
                className="gradient-button text-lg px-8 py-4 rounded-2xl"
              >
                <ExternalLink className="h-5 w-5 mr-3" />
                View All Issues on Map
              </Button>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
