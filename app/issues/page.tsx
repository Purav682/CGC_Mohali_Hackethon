"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getFilterCategories, getCategoryByValue } from "@/lib/categories"
import { FlagReportButton } from "@/components/moderation/flag-report-button"

interface Issue {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  location: {
    lat: number
    lng: number
    address: string
    landmark?: string
  }
  images: string[]
  flaggedCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
  assignedTo?: string
  department?: string
  viewCount: number
  upvotes: number
  downvotes: number
  commentsCount: number
  tags?: Array<{
    id: string
    name: string
    color: string
  }>
}

export default function IssuesPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
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
    { value: "acknowledged", label: "Acknowledged" },
    { value: "under-review", label: "Under Review" },
    { value: "escalated", label: "Escalated" },
  ]
  
  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "critical", label: "Critical" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ]

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          category: filters.category,
          status: filters.status,
          priority: filters.priority,
          search: filters.search,
          sortBy,
          sortOrder,
          limit: '100' // Get more issues for demo
        })

        const response = await fetch(`/api/issues?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch issues')
        }

        const data = await response.json()
        setIssues(data.issues)
        setFilteredIssues(data.issues)
      } catch (error) {
        console.error('Error fetching issues:', error)
        // Fallback to empty array on error
        setIssues([])
        setFilteredIssues([])
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [filters, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive"
      case "acknowledged": return "secondary"
      case "in-progress": return "default"
      case "under-review": return "outline"
      case "escalated": return "destructive"
      case "resolved": return "secondary"
      default: return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertTriangle className="h-4 w-4" />
      case "acknowledged": return <Eye className="h-4 w-4" />
      case "in-progress": return <Clock className="h-4 w-4" />
      case "under-review": return <Search className="h-4 w-4" />
      case "escalated": return <AlertTriangle className="h-4 w-4" />
      case "resolved": return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive"
      case "urgent": return "destructive"
      case "high": return "secondary"
      case "medium": return "default"
      case "low": return "outline"
      default: return "outline"
    }
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

  const getCategoryLabel = (category: string) => {
    return getCategoryByValue(category)?.label || category
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 page-enter">
      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 hero-title">All Community Issues</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Browse and manage all civic issues reported by the community
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Filters */}
        <div className="modern-card glass-effect mb-10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-xl">
              <Filter className="h-6 w-6 text-primary" />
              <span className="gradient-text-primary">Filter & Sort Issues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
              {/* Search */}
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
                  <SelectValue placeholder="Category" />
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
                  <SelectValue placeholder="Status" />
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
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="modern-input h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "gradient-button" : "modern-input border-2"}
                >
                  <Grid3X3 className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setViewMode("table")}
                  className={viewMode === "table" ? "gradient-button" : "modern-input border-2"}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-muted/30 backdrop-blur-sm">
          <div className="text-lg font-medium text-muted-foreground">
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading issues...</span>
              </div>
            ) : (
              <>
                Showing <span className="text-primary font-bold">{filteredIssues.length}</span> issues
              </>
            )}
          </div>
          <Link href="/map">
            <Button className="gradient-button">
              <MapPin className="h-5 w-5 mr-2" />
              View on Map
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground text-lg">Loading civic issues...</p>
            </div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No issues found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === "table" ? (
          <div className="modern-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <Link 
                          href={`/issues/${issue.id}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {issue.title}
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {issue.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(issue.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(issue.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{issue.location.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(issue.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link href={`/issues/${issue.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/map?issue=${issue.id}`}>
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </Link>
                        <FlagReportButton 
                          issueId={issue.id}
                          currentUserId="user_123"
                          isCompact={true}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue, index) => (
              <div key={issue.id} className="modern-card group h-full flex flex-col" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Issue Image */}
                {issue.images && issue.images.length > 0 ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={issue.images[0]}
                      alt={issue.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {issue.images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        +{issue.images.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative h-48 w-full bg-gradient-to-br from-muted/50 to-muted rounded-t-lg flex items-center justify-center">
                    <div className="text-muted-foreground/50 text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">No image available</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link href={`/issues/${issue.id}`}>
                        <CardTitle className="text-lg line-clamp-2 mb-3 group-hover:text-primary transition-colors cursor-pointer">
                          {issue.title}
                        </CardTitle>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusColor(issue.status)} className="flex items-center gap-1 text-xs">
                          {getStatusIcon(issue.status)}
                          {issue.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{getCategoryLabel(issue.category)}</Badge>
                        <Badge variant={getPriorityColor(issue.priority)} className="text-xs">{issue.priority}</Badge>
                      </div>
                    </div>
                    {issue.flaggedCount > 0 && (
                      <Flag className="h-4 w-4 text-destructive flex-shrink-0 ml-3 glow-effect" />
                    )}
                  </div>

                  <CardDescription className="line-clamp-3 mb-4 text-sm leading-relaxed flex-1">
                    {issue.description}
                  </CardDescription>

                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{issue.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span>{formatDate(issue.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <FlagReportButton 
                      issueId={issue.id}
                      currentUserId="user_123"
                    />
                    <div className="flex items-center space-x-2">
                      <Link href={`/issues/${issue.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </Link>
                      <Link href={`/map?issue=${issue.id}`}>
                        <Button variant="outline" size="sm" className="gradient-button text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          Map
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
