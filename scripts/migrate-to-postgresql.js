const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrateToPostgreSQL() {
  console.log('🔄 Starting PostgreSQL Migration...\n');

  try {
    // Clear existing data (be careful with this in production!)
    console.log('🧹 Clearing existing PostgreSQL data...');
    await prisma.$executeRaw`TRUNCATE TABLE "users", "user_profiles", "issues", "comments", "votes", "departments", "department_staff", "notifications", "analytics", "user_analytics", "activity_logs", "issue_status_history", "system_config" RESTART IDENTITY CASCADE;`;
    
    console.log('✅ Database cleared successfully\n');

    // 1. Create Departments
    console.log('🏢 Creating departments...');
    const departments = await Promise.all([
      prisma.department.create({
        data: {
          name: "Public Works Department",
          description: "Responsible for infrastructure, roads, and utilities",
          code: "PWD",
          email: "pwd@nyc.gov",
          phone: "+1-555-0101",
          address: "123 City Hall Plaza, New York, NY 10007",
          isActive: true,
          autoAssign: true,
          slaHours: 48
        }
      }),
      prisma.department.create({
        data: {
          name: "Parks and Recreation",
          description: "Manages parks, playgrounds, and recreational facilities",
          code: "PARKS",
          email: "parks@nyc.gov",
          phone: "+1-555-0102",
          address: "456 Parks Avenue, New York, NY 10001",
          isActive: true,
          autoAssign: true,
          slaHours: 72
        }
      }),
      prisma.department.create({
        data: {
          name: "Traffic Department",
          description: "Handles traffic signals, road signs, and traffic flow",
          code: "TRAFFIC",
          email: "traffic@nyc.gov",
          phone: "+1-555-0103",
          address: "789 Traffic Control Center, New York, NY 10002",
          isActive: true,
          autoAssign: true,
          slaHours: 24
        }
      }),
      prisma.department.create({
        data: {
          name: "Sanitation Department",
          description: "Waste management and street cleaning services",
          code: "SANIT",
          email: "sanitation@nyc.gov",
          phone: "+1-555-0104",
          address: "321 Sanitation Depot, New York, NY 10003",
          isActive: true,
          autoAssign: true,
          slaHours: 48
        }
      })
    ]);
    console.log(`✅ Created ${departments.length} departments\n`);

    // 2. Create Users with hashed passwords
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await Promise.all([
      // Admin Users
      prisma.user.create({
        data: {
          email: "admin@civictrack.com",
          password: hashedPassword,
          role: "ADMIN",
          emailVerified: true,
          lastLoginAt: new Date(),
          profile: {
            create: {
              firstName: "System",
              lastName: "Administrator",
              phone: "+1-555-ADMIN",
              address: "City Hall, New York, NY",
              city: "New York",
              state: "NY",
              zipCode: "10007",
              bio: "CivicTrack platform administrator"
            }
          }
        }
      }),
      
      // Department Officials
      prisma.user.create({
        data: {
          email: "official@nyc.gov",
          password: hashedPassword,
          role: "OFFICIAL",
          emailVerified: true,
          lastLoginAt: new Date(Date.now() - 86400000), // 1 day ago
          profile: {
            create: {
              firstName: "Maria",
              lastName: "Rodriguez",
              phone: "+1-555-0201",
              address: "456 Government Plaza, New York, NY",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              bio: "Public Works Department Official"
            }
          }
        }
      }),
      
      // Workers
      prisma.user.create({
        data: {
          email: "maintenance@nyc.gov",
          password: hashedPassword,
          role: "WORKER",
          emailVerified: true,
          lastLoginAt: new Date(Date.now() - 3600000), // 1 hour ago
          profile: {
            create: {
              firstName: "James",
              lastName: "Wilson",
              phone: "+1-555-0301",
              address: "789 Workshop Lane, Brooklyn, NY",
              city: "Brooklyn",
              state: "NY",
              zipCode: "11201",
              bio: "Field maintenance worker"
            }
          }
        }
      }),
      
      // Citizens
      prisma.user.create({
        data: {
          email: "john.doe@email.com",
          password: hashedPassword,
          role: "CITIZEN",
          emailVerified: true,
          lastLoginAt: new Date(Date.now() - 7200000), // 2 hours ago
          profile: {
            create: {
              firstName: "John",
              lastName: "Doe",
              phone: "+1-555-0401",
              address: "123 Main Street, New York, NY",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              defaultLatitude: 40.7128,
              defaultLongitude: -74.0060,
              searchRadius: 5
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: "jane.smith@email.com",
          password: hashedPassword,
          role: "CITIZEN",
          emailVerified: true,
          lastLoginAt: new Date(Date.now() - 10800000), // 3 hours ago
          profile: {
            create: {
              firstName: "Jane",
              lastName: "Smith",
              phone: "+1-555-0402",
              address: "456 Broadway, New York, NY",
              city: "New York",
              state: "NY",
              zipCode: "10002",
              defaultLatitude: 40.7589,
              defaultLongitude: -73.9851
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: "mike.johnson@email.com",
          password: hashedPassword,
          role: "CITIZEN",
          emailVerified: true,
          lastLoginAt: new Date(Date.now() - 14400000), // 4 hours ago
          profile: {
            create: {
              firstName: "Michael",
              lastName: "Johnson",
              phone: "+1-555-0403",
              address: "789 Park Avenue, New York, NY",
              city: "New York",
              state: "NY",
              zipCode: "10003"
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: "sarah.davis@email.com",
          password: hashedPassword,
          role: "CITIZEN",
          emailVerified: true,
          lastLoginAt: new Date(Date.now() - 18000000), // 5 hours ago
          profile: {
            create: {
              firstName: "Sarah",
              lastName: "Davis",
              phone: "+1-555-0404",
              address: "321 5th Avenue, New York, NY",
              city: "New York",
              state: "NY",
              zipCode: "10004"
            }
          }
        }
      })
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    // 3. Assign department staff
    console.log('🏢 Assigning department staff...');
    const departmentStaff = await Promise.all([
      prisma.departmentStaff.create({
        data: {
          departmentId: departments[0].id, // Public Works
          userId: users[1].id, // Maria Rodriguez (Official)
          role: "HEAD"
        }
      }),
      prisma.departmentStaff.create({
        data: {
          departmentId: departments[0].id, // Public Works
          userId: users[2].id, // James Wilson (Worker)
          role: "WORKER"
        }
      })
    ]);
    console.log(`✅ Created ${departmentStaff.length} department staff assignments\n`);

    // 4. Create Issues
    console.log('🚨 Creating civic issues...');
    const issues = await Promise.all([
      prisma.issue.create({
        data: {
          title: "Massive Pothole on Main Street",
          description: "Large pothole near the intersection of Main St and 2nd Ave causing vehicle damage. Multiple cars have been affected.",
          category: "ROADS",
          priority: "URGENT",
          status: "IN_PROGRESS",
          latitude: 40.7128,
          longitude: -74.0060,
          address: "Main Street & 2nd Avenue, New York, NY 10001",
          landmark: "Near City Bank",
          images: ["/placeholder.jpg"],
          reportedById: users[3].id, // John Doe
          assignedToId: users[2].id, // James Wilson
          departmentId: departments[0].id, // Public Works
          upvotes: 15,
          downvotes: 2,
          viewCount: 127,
          estimatedResolutionDate: new Date(Date.now() + 86400000 * 3) // 3 days from now
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Broken Street Light on Park Avenue",
          description: "Street light has been out for over a week, creating a safety hazard for pedestrians at night.",
          category: "LIGHTING",
          priority: "HIGH",
          status: "ACKNOWLEDGED",
          latitude: 40.7589,
          longitude: -73.9851,
          address: "Park Avenue between 15th and 16th Street",
          landmark: "Near Metro Station",
          images: ["/placeholder.jpg"],
          reportedById: users[4].id, // Jane Smith
          assignedToId: users[2].id, // James Wilson
          departmentId: departments[0].id, // Public Works
          upvotes: 8,
          downvotes: 0,
          viewCount: 89,
          estimatedResolutionDate: new Date(Date.now() + 86400000 * 2) // 2 days from now
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Overflowing Garbage Bins Downtown",
          description: "Multiple garbage bins in the downtown area are overflowing, attracting pests and creating unsanitary conditions.",
          category: "GARBAGE",
          priority: "MEDIUM",
          status: "OPEN",
          latitude: 40.7505,
          longitude: -73.9934,
          address: "Downtown Plaza, New York, NY 10005",
          landmark: "Central Plaza",
          images: ["/placeholder.jpg", "/placeholder.svg"],
          reportedById: users[5].id, // Mike Johnson
          departmentId: departments[3].id, // Sanitation
          upvotes: 12,
          downvotes: 1,
          viewCount: 156
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Traffic Light Malfunction at Broadway",
          description: "Traffic light stuck on red for over 30 minutes causing major traffic backup during rush hour.",
          category: "TRAFFIC",
          priority: "CRITICAL",
          status: "ESCALATED",
          latitude: 40.7580,
          longitude: -73.9855,
          address: "Broadway & 42nd Street, New York, NY 10036",
          landmark: "Times Square Area",
          images: ["/placeholder.jpg"],
          reportedById: users[6].id, // Sarah Davis
          assignedToId: users[1].id, // Maria Rodriguez
          departmentId: departments[2].id, // Traffic
          upvotes: 23,
          downvotes: 0,
          viewCount: 298,
          estimatedResolutionDate: new Date(Date.now() + 86400000) // 1 day from now
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Water Main Leak on 5th Avenue",
          description: "Large water leak flooding the sidewalk and street. Water pressure in nearby buildings is affected.",
          category: "WATER",
          priority: "URGENT",
          status: "IN_PROGRESS",
          latitude: 40.7614,
          longitude: -73.9776,
          address: "5th Avenue & 59th Street, New York, NY 10019",
          landmark: "Near Central Park",
          images: ["/placeholder.jpg", "/placeholder.svg"],
          reportedById: users[3].id, // John Doe
          assignedToId: users[2].id, // James Wilson
          departmentId: departments[0].id, // Public Works
          upvotes: 31,
          downvotes: 1,
          viewCount: 445,
          estimatedResolutionDate: new Date(Date.now() + 86400000 * 2) // 2 days from now
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Dangerous Open Manhole Cover",
          description: "Manhole cover is missing on busy street creating serious safety hazard for vehicles and pedestrians.",
          category: "SAFETY",
          priority: "CRITICAL",
          status: "RESOLVED",
          latitude: 40.7505,
          longitude: -73.9934,
          address: "Wall Street & Water Street, New York, NY 10005",
          landmark: "Financial District",
          images: ["/placeholder.jpg"],
          reportedById: users[4].id, // Jane Smith
          assignedToId: users[2].id, // James Wilson
          departmentId: departments[0].id, // Public Works
          upvotes: 45,
          downvotes: 0,
          viewCount: 523,
          resolvedAt: new Date(Date.now() - 86400000), // Resolved 1 day ago
          actualResolutionDate: new Date(Date.now() - 86400000),
          resolutionNotes: "Emergency repair completed. New manhole cover installed and area secured."
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Fallen Tree Blocking Sidewalk",
          description: "Large tree fell during last night's storm blocking entire sidewalk and part of the road in Central Park area.",
          category: "OBSTRUCTIONS",
          priority: "HIGH",
          status: "RESOLVED",
          latitude: 40.7794,
          longitude: -73.9632,
          address: "Central Park West & 72nd Street, New York, NY 10023",
          landmark: "Central Park West",
          images: ["/placeholder.jpg", "/placeholder.svg"],
          reportedById: users[5].id, // Mike Johnson
          assignedToId: users[2].id, // James Wilson
          departmentId: departments[1].id, // Parks and Recreation
          upvotes: 18,
          downvotes: 0,
          viewCount: 234,
          resolvedAt: new Date(Date.now() - 3600000 * 6), // Resolved 6 hours ago
          actualResolutionDate: new Date(Date.now() - 3600000 * 6),
          resolutionNotes: "Tree removal completed. Sidewalk and road cleared and safe for use."
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Graffiti on Historic Building",
          description: "Vandalism with spray paint on the historic courthouse building facade needs immediate attention.",
          category: "GRAFFITI",
          priority: "MEDIUM",
          status: "UNDER_REVIEW",
          latitude: 40.7127,
          longitude: -74.0059,
          address: "60 Centre Street, New York, NY 10007",
          landmark: "Historic Courthouse",
          images: ["/placeholder.jpg"],
          reportedById: users[6].id, // Sarah Davis
          departmentId: departments[0].id, // Public Works
          upvotes: 7,
          downvotes: 3,
          viewCount: 98,
          estimatedResolutionDate: new Date(Date.now() + 86400000 * 5) // 5 days from now
        }
      }),
      
      prisma.issue.create({
        data: {
          title: "Broken Playground Equipment in Washington Square",
          description: "Swing set has broken chains and slide has sharp edges. Safety concern for children using the playground.",
          category: "PARKS",
          priority: "HIGH",
          status: "ACKNOWLEDGED",
          latitude: 40.7308,
          longitude: -73.9973,
          address: "Washington Square Park, New York, NY 10012",
          landmark: "Washington Square Park Playground",
          images: ["/placeholder.jpg", "/placeholder.svg"],
          reportedById: users[3].id, // John Doe
          departmentId: departments[1].id, // Parks and Recreation
          upvotes: 22,
          downvotes: 0,
          viewCount: 189,
          estimatedResolutionDate: new Date(Date.now() + 86400000 * 7) // 7 days from now
        }
      })
    ]);
    console.log(`✅ Created ${issues.length} civic issues\n`);

    // 5. Create Comments
    console.log('💬 Creating comments...');
    const comments = await Promise.all([
      prisma.comment.create({
        data: {
          content: "This pothole damaged my car's tire yesterday. Really needs urgent attention!",
          issueId: issues[0].id,
          authorId: users[4].id, // Jane Smith
          isOfficial: false
        }
      }),
      prisma.comment.create({
        data: {
          content: "We have dispatched a crew to assess the damage. Repair work will begin tomorrow morning.",
          issueId: issues[0].id,
          authorId: users[1].id, // Maria Rodriguez (Official)
          isOfficial: true,
          isPinned: true
        }
      }),
      prisma.comment.create({
        data: {
          content: "I walk this route every evening. The darkness makes it very unsafe for pedestrians.",
          issueId: issues[1].id,
          authorId: users[5].id, // Mike Johnson
          isOfficial: false
        }
      }),
      prisma.comment.create({
        data: {
          content: "Emergency repair completed successfully. The manhole cover has been replaced and the area is now safe.",
          issueId: issues[5].id,
          authorId: users[2].id, // James Wilson (Worker)
          isOfficial: true,
          isPinned: true
        }
      }),
      prisma.comment.create({
        data: {
          content: "Thank you for the quick response! The area looks much better now.",
          issueId: issues[6].id,
          authorId: users[5].id, // Mike Johnson
          isOfficial: false
        }
      })
    ]);
    console.log(`✅ Created ${comments.length} comments\n`);

    // 6. Create Votes
    console.log('🗳️ Creating votes...');
    const votes = await Promise.all([
      // Votes for pothole issue
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[0].id, userId: users[4].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[0].id, userId: users[5].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[0].id, userId: users[6].id }
      }),
      
      // Votes for street light issue
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[1].id, userId: users[3].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[1].id, userId: users[5].id }
      }),
      
      // Votes for garbage issue
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[2].id, userId: users[3].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[2].id, userId: users[4].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[2].id, userId: users[6].id }
      }),
      
      // Votes for traffic light issue
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[3].id, userId: users[3].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[3].id, userId: users[4].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[3].id, userId: users[5].id }
      }),
      
      // Votes for water leak issue
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[4].id, userId: users[4].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[4].id, userId: users[5].id }
      }),
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[4].id, userId: users[6].id }
      }),
      
      // Votes for playground issue
      prisma.vote.create({
        data: { type: "UPVOTE", issueId: issues[8].id, userId: users[4].id }
      })
    ]);
    console.log(`✅ Created ${votes.length} votes\n`);

    // 7. Create Status History
    console.log('📊 Creating issue status history...');
    const statusHistory = await Promise.all([
      prisma.issueStatusHistory.create({
        data: {
          issueId: issues[0].id,
          fromStatus: "OPEN",
          toStatus: "ACKNOWLEDGED",
          changedById: users[1].id, // Maria Rodriguez
          reason: "Issue acknowledged by department",
          notes: "Crew will be dispatched for assessment"
        }
      }),
      prisma.issueStatusHistory.create({
        data: {
          issueId: issues[0].id,
          fromStatus: "ACKNOWLEDGED",
          toStatus: "IN_PROGRESS",
          changedById: users[2].id, // James Wilson
          reason: "Repair work started",
          notes: "Materials ordered and crew assigned"
        }
      }),
      prisma.issueStatusHistory.create({
        data: {
          issueId: issues[5].id,
          fromStatus: "OPEN",
          toStatus: "IN_PROGRESS",
          changedById: users[2].id, // James Wilson
          reason: "Emergency response initiated",
          notes: "Critical safety issue - immediate action required"
        }
      }),
      prisma.issueStatusHistory.create({
        data: {
          issueId: issues[5].id,
          fromStatus: "IN_PROGRESS",
          toStatus: "RESOLVED",
          changedById: users[2].id, // James Wilson
          reason: "Repair completed successfully",
          notes: "New manhole cover installed and area secured"
        }
      })
    ]);
    console.log(`✅ Created ${statusHistory.length} status history records\n`);

    // 8. Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = await Promise.all([
      prisma.notification.create({
        data: {
          title: "Issue Status Updated",
          message: "Your reported pothole issue has been assigned to a repair crew.",
          type: "ISSUE_UPDATED",
          priority: "NORMAL",
          userId: users[3].id, // John Doe
          issueId: issues[0].id,
          channels: ["EMAIL", "IN_APP"],
          isRead: false
        }
      }),
      prisma.notification.create({
        data: {
          title: "New Issue Assigned",
          message: "You have been assigned a new traffic light repair issue.",
          type: "ISSUE_ASSIGNED",
          priority: "HIGH",
          userId: users[1].id, // Maria Rodriguez
          issueId: issues[3].id,
          channels: ["EMAIL", "SMS", "IN_APP"],
          isRead: true,
          readAt: new Date(Date.now() - 3600000) // Read 1 hour ago
        }
      }),
      prisma.notification.create({
        data: {
          title: "Issue Resolved",
          message: "The dangerous manhole issue you reported has been successfully resolved.",
          type: "ISSUE_RESOLVED",
          priority: "NORMAL",
          userId: users[4].id, // Jane Smith
          issueId: issues[5].id,
          channels: ["EMAIL", "IN_APP"],
          isRead: false
        }
      })
    ]);
    console.log(`✅ Created ${notifications.length} notifications\n`);

    // 9. Create Analytics Data
    console.log('📊 Creating analytics data...');
    const analyticsData = [];
    const dates = Array.from({length: 30}, (_, i) => new Date(Date.now() - i * 86400000)); // Last 30 days
    
    for (const date of dates.slice(0, 10)) { // Create data for last 10 days
      analyticsData.push(
        prisma.analytics.create({
          data: {
            metric: "issues_created",
            value: Math.floor(Math.random() * 10) + 1,
            dimension1: "daily",
            date: date
          }
        }),
        prisma.analytics.create({
          data: {
            metric: "users_registered",
            value: Math.floor(Math.random() * 5) + 1,
            dimension1: "daily",
            date: date
          }
        }),
        prisma.analytics.create({
          data: {
            metric: "issues_resolved",
            value: Math.floor(Math.random() * 8) + 1,
            dimension1: "daily",
            date: date
          }
        })
      );
    }
    
    const analytics = await Promise.all(analyticsData);
    console.log(`✅ Created ${analytics.length} analytics records\n`);

    // 10. Create User Analytics
    console.log('👤 Creating user analytics...');
    const userAnalytics = await Promise.all([
      prisma.userAnalytics.create({
        data: {
          userId: users[3].id, // John Doe
          issuesReported: 3,
          commentsPosted: 2,
          votesGiven: 5,
          loginCount: 15,
          lastActiveAt: new Date(Date.now() - 7200000), // 2 hours ago
          totalTimeSpent: 180, // 3 hours
          reputationScore: 85,
          badgesEarned: ["reporter", "engaged_citizen"]
        }
      }),
      prisma.userAnalytics.create({
        data: {
          userId: users[4].id, // Jane Smith
          issuesReported: 2,
          commentsPosted: 1,
          votesGiven: 8,
          loginCount: 12,
          lastActiveAt: new Date(Date.now() - 10800000), // 3 hours ago
          totalTimeSpent: 145, // 2.4 hours
          reputationScore: 72,
          badgesEarned: ["reporter"]
        }
      })
    ]);
    console.log(`✅ Created ${userAnalytics.length} user analytics records\n`);

    // 11. Create System Configuration
    console.log('⚙️ Creating system configuration...');
    const systemConfig = await Promise.all([
      prisma.systemConfig.create({
        data: {
          key: "site_name",
          value: "CivicTrack NYC",
          description: "The display name of the civic tracking platform",
          category: "general"
        }
      }),
      prisma.systemConfig.create({
        data: {
          key: "default_sla_hours",
          value: "72",
          description: "Default service level agreement in hours",
          category: "general"
        }
      }),
      prisma.systemConfig.create({
        data: {
          key: "email_notifications_enabled",
          value: "true",
          description: "Whether email notifications are enabled system-wide",
          category: "email"
        }
      }),
      prisma.systemConfig.create({
        data: {
          key: "max_file_upload_size",
          value: "10485760",
          description: "Maximum file upload size in bytes (10MB)",
          category: "uploads"
        }
      })
    ]);
    console.log(`✅ Created ${systemConfig.length} system configuration records\n`);

    console.log('🎉 PostgreSQL Migration completed successfully!\n');
    
    // Summary
    console.log('📊 MIGRATION SUMMARY:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏢 Departments: ${departments.length}`);
    console.log(`🚨 Issues: ${issues.length}`);
    console.log(`💬 Comments: ${comments.length}`);
    console.log(`🗳️ Votes: ${votes.length}`);
    console.log(`📈 Status History: ${statusHistory.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log(`📊 Analytics: ${analytics.length}`);
    console.log(`👤 User Analytics: ${userAnalytics.length}`);
    console.log(`⚙️ System Config: ${systemConfig.length}`);
    console.log('\n✅ All data migrated successfully to PostgreSQL!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateToPostgreSQL()
    .then(() => {
      console.log('\n🚀 Ready for production deployment!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToPostgreSQL };
