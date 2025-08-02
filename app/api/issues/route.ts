import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}

    if (category && category !== 'all') {
      where.category = category.toUpperCase()
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace('-', '_')
    }

    if (priority && priority !== 'all') {
      where.priority = priority.toUpperCase()
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (sortBy) {
      case 'date':
        orderBy = { createdAt: sortOrder }
        break
      case 'priority':
        orderBy = { priority: sortOrder }
        break
      case 'status':
        orderBy = { status: sortOrder }
        break
      case 'category':
        orderBy = { category: sortOrder }
        break
      case 'votes':
        orderBy = { upvotes: sortOrder }
        break
      default:
        orderBy = { createdAt: sortOrder }
    }

    // Fetch issues with related data
    const issues = await prisma.issue.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reportedBy: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        assignedTo: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.issue.count({ where })

    // Transform data to match frontend expectations
    const transformedIssues = issues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category.toLowerCase(),
      status: issue.status.toLowerCase().replace('_', '-'),
      priority: issue.priority.toLowerCase(),
      location: {
        lat: issue.latitude,
        lng: issue.longitude,
        address: issue.address,
        landmark: issue.landmark
      },
      images: issue.images || [], // images is now a string array
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      createdBy: issue.reportedBy?.profile ? 
        `${issue.reportedBy.profile.firstName} ${issue.reportedBy.profile.lastName}` : 
        'Anonymous',
      assignedTo: issue.assignedTo?.profile ? 
        `${issue.assignedTo.profile.firstName} ${issue.assignedTo.profile.lastName}` : 
        null,
      department: issue.department?.name || null,
      viewCount: issue.viewCount,
      upvotes: issue.upvotes,
      downvotes: issue.downvotes,
      commentsCount: issue._count.comments,
      votesCount: issue._count.votes,
      estimatedResolutionDate: issue.estimatedResolutionDate?.toISOString(),
      actualResolutionDate: issue.actualResolutionDate?.toISOString(),
      resolutionNotes: issue.resolutionNotes,
      trackingNumber: issue.trackingNumber
    }))

    return NextResponse.json({
      issues: transformedIssues,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}
