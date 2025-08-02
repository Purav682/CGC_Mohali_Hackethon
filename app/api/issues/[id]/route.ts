import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: PageProps) {
  try {
    const { id } = await params

    // Increment view count
    await prisma.issue.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    // Fetch issue with all related data
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        reportedBy: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
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
        department: true,
        statusHistory: {
          include: {
            changedBy: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              }
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                      }
                    }
                  }
                }
              }
            }
          },
          where: { parentId: null },
          orderBy: { createdAt: 'desc' }
        },
        votes: {
          select: {
            userId: true,
            voteType: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            flagReports: true
          }
        }
      }
    })

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    // Transform data to match frontend expectations
    const transformedIssue = {
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
      images: issue.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        isPrimary: img.isPrimary
      })),
      flaggedCount: issue.flaggedCount,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      reporter: {
        id: issue.reportedBy.id,
        name: issue.reportedBy.profile ? 
          `${issue.reportedBy.profile.firstName} ${issue.reportedBy.profile.lastName}` : 
          'Anonymous',
        email: issue.isAnonymous ? 'Anonymous' : issue.reportedBy.email,
        avatar: issue.reportedBy.profile?.avatar
      },
      assignee: issue.assignedTo ? {
        id: issue.assignedTo.id,
        name: `${issue.assignedTo.profile?.firstName} ${issue.assignedTo.profile?.lastName}`
      } : null,
      department: issue.department ? {
        id: issue.department.id,
        name: issue.department.name,
        email: issue.department.email,
        phone: issue.department.phone
      } : null,
      viewCount: issue.viewCount,
      upvotes: issue.upvotes,
      downvotes: issue.downvotes,
      commentsCount: issue._count.comments,
      votesCount: issue._count.votes,
      flagReportsCount: issue._count.flagReports,
      statusHistory: issue.statusHistory.map((sh: any) => ({
        id: sh.id,
        previousStatus: sh.previousStatus.toLowerCase().replace('_', '-'),
        newStatus: sh.newStatus.toLowerCase().replace('_', '-'),
        reason: sh.reason,
        notes: sh.notes,
        changedBy: sh.changedBy.profile ? 
          `${sh.changedBy.profile.firstName} ${sh.changedBy.profile.lastName}` : 
          'System',
        createdAt: sh.createdAt.toISOString()
      })),
      comments: issue.comments.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        isOfficial: comment.isOfficial,
        author: {
          id: comment.author.id,
          name: comment.author.profile ? 
            `${comment.author.profile.firstName} ${comment.author.profile.lastName}` : 
            'Anonymous',
          avatar: comment.author.profile?.avatar
        },
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        replies: comment.replies.map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          isOfficial: reply.isOfficial,
          author: {
            id: reply.author.id,
            name: reply.author.profile ? 
              `${reply.author.profile.firstName} ${reply.author.profile.lastName}` : 
              'Anonymous',
            avatar: reply.author.profile?.avatar
          },
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString()
        }))
      })),
      votes: issue.votes,
      tags: issue.tags.map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
        description: t.tag.description
      })),
      estimatedResolutionDate: issue.estimatedResolutionDate?.toISOString(),
      actualResolutionDate: issue.actualResolutionDate?.toISOString(),
      resolutionNotes: issue.resolutionNotes,
      isAnonymous: issue.isAnonymous,
      isModerated: issue.isModerated,
      moderationNotes: issue.moderationNotes
    }

    return NextResponse.json(transformedIssue)

  } catch (error) {
    console.error('Error fetching issue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    )
  }
}
