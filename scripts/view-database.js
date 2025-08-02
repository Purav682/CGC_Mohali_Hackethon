const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function queryDatabase() {
  console.log('🗄️  CivicTrack Database Explorer')
  console.log('=====================================\n')

  try {
    // Get all users with their profiles
    console.log('👥 USERS:')
    console.log('=========')
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: {
            reportedIssues: true,
            comments: true,
            votes: true,
            notifications: true
          }
        }
      }
    })

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.profile?.firstName} ${user.profile?.lastName} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Verified: ${user.emailVerified}`)
      console.log(`   Issues: ${user._count.reportedIssues}, Comments: ${user._count.comments}, Votes: ${user._count.votes}`)
      console.log(`   Phone: ${user.profile?.phoneNumber || 'N/A'}`)
      console.log(`   Address: ${user.profile?.address || 'N/A'}, ${user.profile?.city || 'N/A'}, ${user.profile?.state || 'N/A'}`)
      console.log('')
    })

    // Get all issues with details
    console.log('\n🚨 ISSUES:')
    console.log('==========')
    const issues = await prisma.issue.findMany({
      include: {
        reporter: {
          include: { profile: true }
        },
        assignee: {
          include: { profile: true }
        },
        department: true,
        images: true,
        tags: {
          include: { tag: true }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title}`)
      console.log(`   Status: ${issue.status} | Priority: ${issue.priority} | Category: ${issue.category}`)
      console.log(`   Reporter: ${issue.reporter.profile?.firstName} ${issue.reporter.profile?.lastName}`)
      console.log(`   Assignee: ${issue.assignee?.profile?.firstName || 'Unassigned'} ${issue.assignee?.profile?.lastName || ''}`)
      console.log(`   Department: ${issue.department?.name || 'N/A'}`)
      console.log(`   Location: ${issue.address}`)
      console.log(`   Views: ${issue.viewCount}, Upvotes: ${issue.upvotes}, Comments: ${issue._count.comments}`)
      console.log(`   Images: ${issue.images.length}, Tags: ${issue.tags.length}`)
      console.log(`   Created: ${issue.createdAt.toLocaleDateString()}`)
      if (issue.actualResolutionDate) {
        console.log(`   Resolved: ${issue.actualResolutionDate.toLocaleDateString()}`)
      }
      console.log('')
    })

    // Get departments
    console.log('\n🏢 DEPARTMENTS:')
    console.log('===============')
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            issues: true
          }
        }
      }
    })

    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name}`)
      console.log(`   Email: ${dept.email}`)
      console.log(`   Phone: ${dept.phone}`)
      console.log(`   Head: ${dept.head}`)
      console.log(`   Working Hours: ${dept.workingHours}`)
      console.log(`   Issues Assigned: ${dept._count.issues}`)
      console.log('')
    })

    // Get comments
    console.log('\n💬 RECENT COMMENTS:')
    console.log('===================')
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          include: { profile: true }
        },
        issue: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    comments.forEach((comment, index) => {
      console.log(`${index + 1}. ${comment.author.profile?.firstName} ${comment.author.profile?.lastName}`)
      console.log(`   Issue: ${comment.issue.title}`)
      console.log(`   Comment: ${comment.content}`)
      console.log(`   Official: ${comment.isOfficial ? 'Yes' : 'No'}`)
      console.log(`   Date: ${comment.createdAt.toLocaleDateString()}`)
      console.log('')
    })

    // Get votes
    console.log('\n👍 VOTING SUMMARY:')
    console.log('==================')
    const voteStats = await prisma.vote.groupBy({
      by: ['voteType'],
      _count: {
        voteType: true
      }
    })

    voteStats.forEach(stat => {
      console.log(`${stat.voteType}: ${stat._count.voteType}`)
    })

    // Get notifications
    console.log('\n🔔 NOTIFICATIONS:')
    console.log('=================')
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          include: { profile: true }
        },
        issue: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.user.profile?.firstName} ${notif.user.profile?.lastName}`)
      console.log(`   Type: ${notif.type}`)
      console.log(`   Title: ${notif.title}`)
      console.log(`   Message: ${notif.message}`)
      console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`)
      console.log(`   Issue: ${notif.issue?.title || 'N/A'}`)
      console.log('')
    })

    // Get activity logs
    console.log('\n📝 RECENT ACTIVITY:')
    console.log('===================')
    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          include: { profile: true }
        },
        issue: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.user?.profile?.firstName || 'System'} ${activity.user?.profile?.lastName || ''}`)
      console.log(`   Action: ${activity.action}`)
      console.log(`   Details: ${activity.details}`)
      console.log(`   Issue: ${activity.issue?.title || 'N/A'}`)
      console.log(`   IP: ${activity.ipAddress}`)
      console.log(`   Date: ${activity.createdAt.toLocaleDateString()}`)
      console.log('')
    })

    // Database statistics
    console.log('\n📊 DATABASE STATISTICS:')
    console.log('=======================')
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.issue.count(),
      prisma.comment.count(),
      prisma.vote.count(),
      prisma.department.count(),
      prisma.tag.count(),
      prisma.notification.count(),
      prisma.activityLog.count(),
      prisma.analyticsEvent.count(),
      prisma.systemMetrics.count()
    ])

    console.log(`Total Users: ${stats[0]}`)
    console.log(`Total Issues: ${stats[1]}`)
    console.log(`Total Comments: ${stats[2]}`)
    console.log(`Total Votes: ${stats[3]}`)
    console.log(`Total Departments: ${stats[4]}`)
    console.log(`Total Tags: ${stats[5]}`)
    console.log(`Total Notifications: ${stats[6]}`)
    console.log(`Total Activity Logs: ${stats[7]}`)
    console.log(`Total Analytics Events: ${stats[8]}`)
    console.log(`Total System Metrics: ${stats[9]}`)

  } catch (error) {
    console.error('❌ Error querying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

queryDatabase()
