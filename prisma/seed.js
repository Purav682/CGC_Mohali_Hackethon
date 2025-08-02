const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // ========================================
  // 1. CREATE USERS
  // ========================================
  console.log('👥 Creating users...')

  // Hash password for all users (password: "password123")
  const hashedPassword = await bcryptjs.hash('password123', 12)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@civictrack.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Anderson',
          phoneNumber: '+1-555-0101',
          city: 'New York',
          state: 'NY',
          emailNotifications: true,
          pushNotifications: true,
        }
      }
    }
  })

  // Create city officials
  const cityOfficial = await prisma.user.create({
    data: {
      email: 'official@nyc.gov',
      password: hashedPassword,
      role: 'CITY_OFFICIAL',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Michael',
          lastName: 'Rodriguez',
          phoneNumber: '+1-555-0102',
          city: 'New York',
          state: 'NY',
        }
      }
    }
  })

  // Create maintenance workers
  const maintenanceWorker = await prisma.user.create({
    data: {
      email: 'maintenance@nyc.gov',
      password: hashedPassword,
      role: 'MAINTENANCE_WORKER',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'David',
          lastName: 'Thompson',
          phoneNumber: '+1-555-0103',
          city: 'New York',
          state: 'NY',
        }
      }
    }
  })

  // Create regular citizens
  const citizens = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        password: hashedPassword,
        role: 'CITIZEN',
        emailVerified: true,
        profile: {
          create: {
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1-555-0201',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@email.com',
        password: hashedPassword,
        role: 'CITIZEN',
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '+1-555-0202',
            address: '456 Broadway',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.wilson@email.com',
        password: hashedPassword,
        role: 'CITIZEN',
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Mike',
            lastName: 'Wilson',
            phoneNumber: '+1-555-0203',
            address: '789 Park Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10003',
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'lisa.chen@email.com',
        password: hashedPassword,
        role: 'CITIZEN',
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Lisa',
            lastName: 'Chen',
            phoneNumber: '+1-555-0204',
            address: '321 Central Park West',
            city: 'New York',
            state: 'NY',
            zipCode: '10004',
          }
        }
      }
    }),
  ])

  // ========================================
  // 2. CREATE DEPARTMENTS
  // ========================================
  console.log('🏢 Creating departments...')

  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Department of Transportation',
        description: 'Handles roads, traffic lights, and transportation infrastructure',
        email: 'dot@nyc.gov',
        phone: '+1-555-DOT-NYC',
        head: 'Commissioner Robert Martinez',
        workingHours: 'Monday-Friday 8:00 AM - 6:00 PM',
        emergencyContact: '+1-555-DOT-EMRG',
      }
    }),
    prisma.department.create({
      data: {
        name: 'Department of Sanitation',
        description: 'Manages waste collection, street cleaning, and sanitation services',
        email: 'sanitation@nyc.gov',
        phone: '+1-555-SAN-NYC',
        head: 'Commissioner Emily Davis',
        workingHours: 'Monday-Saturday 6:00 AM - 8:00 PM',
        emergencyContact: '+1-555-SAN-EMRG',
      }
    }),
    prisma.department.create({
      data: {
        name: 'Parks and Recreation',
        description: 'Maintains parks, playgrounds, and recreational facilities',
        email: 'parks@nyc.gov',
        phone: '+1-555-PARK-NYC',
        head: 'Commissioner Jennifer Lee',
        workingHours: 'Daily 7:00 AM - 7:00 PM',
        emergencyContact: '+1-555-PARK-EMRG',
      }
    }),
    prisma.department.create({
      data: {
        name: 'Public Safety',
        description: 'Handles public safety concerns and emergency response coordination',
        email: 'safety@nyc.gov',
        phone: '+1-555-SAFE-NYC',
        head: 'Director Marcus Johnson',
        workingHours: '24/7',
        emergencyContact: '911',
      }
    }),
  ])

  // ========================================
  // 3. CREATE TAGS
  // ========================================
  console.log('🏷️ Creating tags...')

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'urgent', color: '#EF4444', description: 'Requires immediate attention' } }),
    prisma.tag.create({ data: { name: 'safety-hazard', color: '#F97316', description: 'Poses safety risks' } }),
    prisma.tag.create({ data: { name: 'accessibility', color: '#3B82F6', description: 'Affects accessibility' } }),
    prisma.tag.create({ data: { name: 'environmental', color: '#10B981', description: 'Environmental concern' } }),
    prisma.tag.create({ data: { name: 'high-traffic-area', color: '#8B5CF6', description: 'Located in high traffic area' } }),
    prisma.tag.create({ data: { name: 'recurring', color: '#F59E0B', description: 'Recurring issue' } }),
    prisma.tag.create({ data: { name: 'infrastructure', color: '#6B7280', description: 'Infrastructure related' } }),
    prisma.tag.create({ data: { name: 'community-request', color: '#EC4899', description: 'Requested by community' } }),
  ])

  // ========================================
  // 4. CREATE COMPREHENSIVE ISSUES
  // ========================================
  console.log('🚨 Creating civic issues...')

  const issues = []

  // Issue 1: Broken Street Light (High Priority)
  const issue1 = await prisma.issue.create({
    data: {
      title: 'Broken Street Light on Main Street',
      description: 'The street light at the intersection of Main Street and 5th Avenue has been out for over a week. This creates a dangerous situation for pedestrians and drivers, especially during evening hours. Multiple residents have reported near-miss incidents.',
      category: 'LIGHTING',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St & 5th Ave, New York, NY 10001',
      landmark: 'Near Central Bank',
      reporterId: citizens[0].id,
      assigneeId: maintenanceWorker.id,
      departmentId: departments[0].id,
      estimatedResolutionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      flaggedCount: 0,
      viewCount: 47,
      upvotes: 23,
      downvotes: 1,
      images: {
        create: [
          {
            url: '/placeholder.jpg',
            filename: 'broken_light_main_st.jpg',
            fileSize: 245760,
            mimeType: 'image/jpeg',
            caption: 'Street light completely dark during evening hours',
            isPrimary: true,
          }
        ]
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // urgent
          { tagId: tags[1].id }, // safety-hazard
          { tagId: tags[4].id }, // high-traffic-area
        ]
      }
    }
  })

  // Issue 2: Large Pothole (Critical Priority)
  const issue2 = await prisma.issue.create({
    data: {
      title: 'Massive Pothole on Broadway Causing Vehicle Damage',
      description: 'A large pothole approximately 3 feet in diameter and 8 inches deep has formed on Broadway near Times Square. Multiple vehicles have suffered tire and rim damage. The hole continues to grow with each rainfall and poses a serious hazard to traffic.',
      category: 'ROADS',
      status: 'ACKNOWLEDGED',
      priority: 'CRITICAL',
      latitude: 40.7589,
      longitude: -73.9851,
      address: '1540 Broadway, New York, NY 10036',
      landmark: 'Near Times Square',
      reporterId: citizens[1].id,
      departmentId: departments[0].id,
      estimatedResolutionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      flaggedCount: 0,
      viewCount: 156,
      upvotes: 89,
      downvotes: 3,
      images: {
        create: [
          {
            url: '/placeholder.jpg',
            filename: 'broadway_pothole_1.jpg',
            fileSize: 387240,
            mimeType: 'image/jpeg',
            caption: 'Large pothole with visible depth and rough edges',
            isPrimary: true,
          },
          {
            url: '/placeholder-user.jpg',
            filename: 'broadway_pothole_2.jpg',
            fileSize: 291630,
            mimeType: 'image/jpeg',
            caption: 'Vehicle damage caused by the pothole',
            isPrimary: false,
          }
        ]
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // urgent
          { tagId: tags[1].id }, // safety-hazard
          { tagId: tags[4].id }, // high-traffic-area
          { tagId: tags[6].id }, // infrastructure
        ]
      }
    }
  })

  // Issue 3: Overflowing Garbage Bins
  const issue3 = await prisma.issue.create({
    data: {
      title: 'Overflowing Garbage Bins Attracting Pests',
      description: 'The garbage bins at Park Avenue and 42nd Street have been overflowing for 4 days. Trash is scattered around the area, attracting rats and creating unsanitary conditions. The smell is becoming unbearable for nearby businesses and pedestrians.',
      category: 'GARBAGE',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      latitude: 40.7505,
      longitude: -73.9934,
      address: '789 Park Ave & 42nd St, New York, NY 10017',
      landmark: 'Near Grand Central Terminal',
      reporterId: citizens[2].id,
      assigneeId: maintenanceWorker.id,
      departmentId: departments[1].id,
      actualResolutionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // resolved 2 days ago
      resolutionNotes: 'Garbage collected, bins cleaned, and pickup schedule adjusted to twice daily for this location.',
      flaggedCount: 0,
      viewCount: 73,
      upvotes: 34,
      downvotes: 2,
      images: {
        create: [
          {
            url: '/placeholder.svg',
            filename: 'overflowing_bins.jpg',
            fileSize: 198450,
            mimeType: 'image/jpeg',
            caption: 'Multiple overflowing garbage bins with scattered trash',
            isPrimary: true,
          }
        ]
      },
      tags: {
        create: [
          { tagId: tags[3].id }, // environmental
          { tagId: tags[4].id }, // high-traffic-area
        ]
      }
    }
  })

  // Issue 4: Water Main Leak
  const issue4 = await prisma.issue.create({
    data: {
      title: 'Water Main Leak in Central Park Creating Flooding',
      description: 'A significant water main break has occurred near the Central Park Zoo entrance. Water is flooding the walkway and creating muddy conditions. The pressure loss is affecting nearby buildings and the park fountain systems.',
      category: 'WATER',
      status: 'UNDER_REVIEW',
      priority: 'URGENT',
      latitude: 40.7829,
      longitude: -73.9654,
      address: 'Central Park Zoo Entrance, Central Park West, New York, NY 10024',
      landmark: 'Central Park Zoo',
      reporterId: citizens[3].id,
      departmentId: departments[0].id,
      flaggedCount: 0,
      viewCount: 92,
      upvotes: 67,
      downvotes: 1,
      tags: {
        create: [
          { tagId: tags[0].id }, // urgent
          { tagId: tags[3].id }, // environmental
          { tagId: tags[6].id }, // infrastructure
        ]
      }
    }
  })

  // Issue 5: Dangerous Open Manhole
  const issue5 = await prisma.issue.create({
    data: {
      title: 'Open Manhole Cover Creating Safety Hazard',
      description: 'An open manhole cover on 42nd Street near 7th Avenue poses an extreme safety risk. The cover is completely missing and there are no barriers or warning signs. This is an immediate danger to pedestrians and vehicles.',
      category: 'SAFETY',
      status: 'ESCALATED',
      priority: 'CRITICAL',
      latitude: 40.7488,
      longitude: -73.9857,
      address: '220 W 42nd St & 7th Ave, New York, NY 10036',
      landmark: 'Near Port Authority',
      reporterId: citizens[0].id,
      assigneeId: cityOfficial.id,
      departmentId: departments[3].id,
      estimatedResolutionDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000), // 12 hours
      flaggedCount: 0,
      viewCount: 203,
      upvotes: 156,
      downvotes: 0,
      images: {
        create: [
          {
            url: '/placeholder.jpg',
            filename: 'open_manhole.jpg',
            fileSize: 445120,
            mimeType: 'image/jpeg',
            caption: 'Open manhole with no cover or barriers',
            isPrimary: true,
          }
        ]
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // urgent
          { tagId: tags[1].id }, // safety-hazard
          { tagId: tags[4].id }, // high-traffic-area
        ]
      }
    }
  })

  // Issue 6: Fallen Tree
  const issue6 = await prisma.issue.create({
    data: {
      title: 'Fallen Tree Blocking Sidewalk After Storm',
      description: 'A large oak tree fell during last night\'s storm, completely blocking the sidewalk on Central Park East. Pedestrians are forced to walk in the street, creating a dangerous situation. The tree also damaged a section of the fence.',
      category: 'OBSTRUCTIONS',
      status: 'RESOLVED',
      priority: 'HIGH',
      latitude: 40.7614,
      longitude: -73.9776,
      address: '1040 5th Ave, New York, NY 10028',
      landmark: 'Central Park East',
      reporterId: citizens[1].id,
      assigneeId: maintenanceWorker.id,
      departmentId: departments[2].id,
      actualResolutionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // resolved 1 day ago
      resolutionNotes: 'Tree removed, sidewalk cleared, and fence repaired. Scheduled additional tree inspections in the area.',
      flaggedCount: 0,
      viewCount: 81,
      upvotes: 45,
      downvotes: 1,
      tags: {
        create: [
          { tagId: tags[1].id }, // safety-hazard
          { tagId: tags[3].id }, // environmental
        ]
      }
    }
  })

  // Additional issues for more comprehensive data
  const additionalIssues = [
    {
      title: 'Graffiti on Historic Building',
      description: 'Offensive graffiti has been spray-painted on the exterior wall of the historic city hall building. This vandalism is visible from the main entrance and needs immediate removal.',
      category: 'GRAFFITI',
      status: 'OPEN',
      priority: 'MEDIUM',
      latitude: 40.7127,
      longitude: -74.0059,
      address: 'City Hall, New York, NY 10007',
      reporterId: citizens[2].id,
      departmentId: departments[1].id,
    },
    {
      title: 'Broken Playground Equipment',
      description: 'The swing set in Madison Square Park has broken chains and poses a safety risk to children. Two swings are completely unusable and one is hanging dangerously.',
      category: 'PARKS',
      status: 'ACKNOWLEDGED',
      priority: 'HIGH',
      latitude: 40.7414,
      longitude: -73.9883,
      address: 'Madison Square Park, New York, NY 10010',
      reporterId: citizens[3].id,
      departmentId: departments[2].id,
    },
    {
      title: 'Traffic Light Malfunction',
      description: 'The traffic light at the intersection of Houston and Broadway is stuck on red in all directions, causing major traffic congestion during rush hours.',
      category: 'TRAFFIC',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      latitude: 40.7260,
      longitude: -73.9988,
      address: 'Houston St & Broadway, New York, NY 10012',
      reporterId: citizens[0].id,
      departmentId: departments[0].id,
    },
  ]

  for (const issueData of additionalIssues) {
    await prisma.issue.create({
      data: {
        ...issueData,
        viewCount: Math.floor(Math.random() * 100) + 20,
        upvotes: Math.floor(Math.random() * 50) + 5,
        downvotes: Math.floor(Math.random() * 5),
      }
    })
  }

  issues.push(issue1, issue2, issue3, issue4, issue5, issue6)

  // ========================================
  // 5. CREATE STATUS CHANGES
  // ========================================
  console.log('📊 Creating status changes...')

  await Promise.all([
    // Issue 1 status changes
    prisma.statusChange.create({
      data: {
        issueId: issue1.id,
        previousStatus: 'OPEN',
        newStatus: 'ACKNOWLEDGED',
        reason: 'Issue reported and initial assessment completed',
        changedById: cityOfficial.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.statusChange.create({
      data: {
        issueId: issue1.id,
        previousStatus: 'ACKNOWLEDGED',
        newStatus: 'IN_PROGRESS',
        reason: 'Assigned to maintenance team with replacement parts ordered',
        notes: 'LED streetlight replacement scheduled for this week',
        changedById: maintenanceWorker.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    }),

    // Issue 2 status changes
    prisma.statusChange.create({
      data: {
        issueId: issue2.id,
        previousStatus: 'OPEN',
        newStatus: 'ACKNOWLEDGED',
        reason: 'High priority issue flagged for immediate attention',
        notes: 'Coordinating with emergency road repair team',
        changedById: cityOfficial.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    }),

    // Issue 3 status changes (resolved)
    prisma.statusChange.create({
      data: {
        issueId: issue3.id,
        previousStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        reason: 'Sanitation crew dispatched to location',
        changedById: maintenanceWorker.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.statusChange.create({
      data: {
        issueId: issue3.id,
        previousStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        reason: 'Garbage collected and pickup schedule adjusted',
        notes: 'Implemented twice-daily pickup for this high-traffic location',
        changedById: maintenanceWorker.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    }),
  ])

  // ========================================
  // 6. CREATE COMMENTS
  // ========================================
  console.log('💬 Creating comments...')

  await Promise.all([
    // Comments for Issue 1
    prisma.comment.create({
      data: {
        issueId: issue1.id,
        authorId: citizens[1].id,
        content: 'I walk by here every evening and it\'s really dangerous. Thank you for reporting this!',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.comment.create({
      data: {
        issueId: issue1.id,
        authorId: maintenanceWorker.id,
        content: 'We have ordered the replacement LED streetlight and will install it by Friday. Thank you for your patience.',
        isOfficial: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    }),

    // Comments for Issue 2
    prisma.comment.create({
      data: {
        issueId: issue2.id,
        authorId: citizens[2].id,
        content: 'This pothole damaged my tire yesterday. When will this be fixed?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.comment.create({
      data: {
        issueId: issue2.id,
        authorId: cityOfficial.id,
        content: 'Emergency road repair has been scheduled for tomorrow morning. We apologize for any inconvenience.',
        isOfficial: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      }
    }),

    // Comments for Issue 5
    prisma.comment.create({
      data: {
        issueId: issue5.id,
        authorId: citizens[3].id,
        content: 'I almost fell into this! Please fix immediately - this is extremely dangerous.',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      }
    }),
  ])

  // ========================================
  // 7. CREATE VOTES
  // ========================================
  console.log('👍 Creating votes...')

  const voteData = []
  for (const issue of issues) {
    // Create random votes from different users
    for (const citizen of citizens) {
      if (Math.random() > 0.3) { // 70% chance to vote
        voteData.push({
          issueId: issue.id,
          userId: citizen.id,
          voteType: Math.random() > 0.1 ? 'UPVOTE' : 'DOWNVOTE', // 90% upvotes
        })
      }
    }
  }

  await Promise.all(
    voteData.map(vote => 
      prisma.vote.create({ data: vote }).catch(() => {}) // Ignore duplicates
    )
  )

  // ========================================
  // 8. CREATE NOTIFICATIONS
  // ========================================
  console.log('🔔 Creating notifications...')

  await Promise.all([
    prisma.notification.create({
      data: {
        userId: citizens[0].id,
        type: 'STATUS_CHANGED',
        title: 'Your issue has been updated',
        message: 'The street light issue on Main Street is now in progress.',
        issueId: issue1.id,
        isRead: false,
      }
    }),
    prisma.notification.create({
      data: {
        userId: citizens[1].id,
        type: 'ISSUE_ASSIGNED',
        title: 'Your issue has been assigned',
        message: 'The pothole on Broadway has been assigned to our emergency repair team.',
        issueId: issue2.id,
        isRead: true,
        readAt: new Date(Date.now() - 30 * 60 * 1000),
      }
    }),
    prisma.notification.create({
      data: {
        userId: citizens[2].id,
        type: 'ISSUE_RESOLVED',
        title: 'Your issue has been resolved',
        message: 'The garbage overflow on Park Avenue has been cleaned up.',
        issueId: issue3.id,
        isRead: false,
      }
    }),
  ])

  // ========================================
  // 9. CREATE ACTIVITY LOGS
  // ========================================
  console.log('📝 Creating activity logs...')

  await Promise.all([
    prisma.activityLog.create({
      data: {
        userId: citizens[0].id,
        action: 'ISSUE_CREATED',
        entity: 'Issue',
        entityId: issue1.id,
        details: 'Created new issue: Broken Street Light on Main Street',
        issueId: issue1.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: maintenanceWorker.id,
        action: 'STATUS_UPDATED',
        entity: 'Issue',
        entityId: issue1.id,
        details: 'Changed status from ACKNOWLEDGED to IN_PROGRESS',
        issueId: issue1.id,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }),
  ])

  // ========================================
  // 10. CREATE ANALYTICS DATA
  // ========================================
  console.log('📈 Creating analytics data...')

  const analyticsEvents = []
  const metrics = []

  // Generate page view events
  for (let i = 0; i < 100; i++) {
    analyticsEvents.push({
      eventType: 'page_view',
      eventData: JSON.stringify({
        page: '/issues',
        user_agent: 'Mozilla/5.0 Browser',
        referrer: Math.random() > 0.5 ? 'https://google.com' : 'direct'
      }),
      userId: Math.random() > 0.5 ? citizens[Math.floor(Math.random() * citizens.length)].id : null,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    })
  }

  // Generate system metrics
  const metricNames = ['issues_created', 'issues_resolved', 'user_registrations', 'page_views']
  for (const metricName of metricNames) {
    for (let i = 0; i < 30; i++) { // 30 days of data
      metrics.push({
        metricName,
        metricValue: Math.floor(Math.random() * 50) + 10,
        metricUnit: 'count',
        recordedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      })
    }
  }

  await Promise.all([
    ...analyticsEvents.map(event => prisma.analyticsEvent.create({ data: event })),
    ...metrics.map(metric => prisma.systemMetrics.create({ data: metric })),
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log(`
📊 SEEDING SUMMARY:
==================
👥 Users: ${1 + 1 + 1 + citizens.length} (1 admin, 1 official, 1 worker, ${citizens.length} citizens)
🏢 Departments: ${departments.length}
🏷️ Tags: ${tags.length}
🚨 Issues: ${issues.length + additionalIssues.length}
📊 Status Changes: 5
💬 Comments: 5
👍 Votes: ~${voteData.length}
🔔 Notifications: 3
📝 Activity Logs: 2
📈 Analytics Events: 100
📊 System Metrics: ${metricNames.length * 30}

🔑 LOGIN CREDENTIALS:
====================
Admin: admin@civictrack.com / password123
Official: official@nyc.gov / password123
Worker: maintenance@nyc.gov / password123
Citizen: john.doe@email.com / password123
`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
