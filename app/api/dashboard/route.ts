import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get overview statistics
    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      urgentIssues,
      totalUsers,
      totalDepartments,
      recentIssues,
      issuesByCategory,
      issuesByPriority,
      issuesByStatus,
      resolutionStats
    ] = await Promise.all([
      // Total counts
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'OPEN' } }),
      prisma.issue.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.issue.count({ where: { status: 'RESOLVED' } }),
      prisma.issue.count({ where: { priority: { in: ['URGENT', 'CRITICAL'] } } }),
      prisma.user.count(),
      prisma.department.count(),

      // Recent issues
      prisma.issue.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reportedBy: {
            select: {
              profile: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      }),

      // Issues by category
      prisma.issue.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      }),

      // Issues by priority
      prisma.issue.groupBy({
        by: ['priority'],
        _count: { priority: true }
      }),

      // Issues by status
      prisma.issue.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // Resolution time stats
      prisma.issue.findMany({
        where: { 
          status: 'RESOLVED',
          actualResolutionDate: { not: null }
        },
        select: {
          createdAt: true,
          actualResolutionDate: true,
          priority: true
        }
      })
    ])

    // Calculate average resolution time
    const avgResolutionTime = resolutionStats.length > 0 
      ? resolutionStats.reduce((acc, issue) => {
          const resolutionTime = new Date(issue.actualResolutionDate!).getTime() - new Date(issue.createdAt).getTime()
          return acc + resolutionTime
        }, 0) / resolutionStats.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0

    // Get recent activity
    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            profile: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        issue: {
          select: { title: true }
        }
      }
    })

    // Transform data
    const dashboard = {
      overview: {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        urgentIssues,
        totalUsers,
        totalDepartments,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10 // Round to 1 decimal
      },
      charts: {
        issuesByCategory: issuesByCategory.map(item => ({
          category: item.category.toLowerCase(),
          count: item._count.category
        })),
        issuesByPriority: issuesByPriority.map(item => ({
          priority: item.priority.toLowerCase(),
          count: item._count.priority
        })),
        issuesByStatus: issuesByStatus.map(item => ({
          status: item.status.toLowerCase().replace('_', '-'),
          count: item._count.status
        }))
      },
      recentIssues: recentIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status.toLowerCase().replace('_', '-'),
        priority: issue.priority.toLowerCase(),
        createdAt: issue.createdAt.toISOString(),
        reporter: issue.reportedBy.profile 
          ? `${issue.reportedBy.profile.firstName} ${issue.reportedBy.profile.lastName}`
          : 'Anonymous'
      })),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        user: activity.user?.profile 
          ? `${activity.user.profile.firstName} ${activity.user.profile.lastName}`
          : 'System',
        issueTitle: activity.issue?.title,
        createdAt: activity.createdAt.toISOString()
      }))
    }

    return NextResponse.json(dashboard)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
