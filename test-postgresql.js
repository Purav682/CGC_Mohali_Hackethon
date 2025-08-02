const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:UyFXvWcYkvfISVovmBpwojAkNFxEYSpg@centerbeam.proxy.rlwy.net:39922/railway"
    }
  }
});

async function testPostgreSQL() {
  try {
    console.log('🔍 Testing PostgreSQL Connection...\n');

    // Test basic connection
    const userCount = await prisma.user.count();
    console.log(`✅ Users in database: ${userCount}`);

    const issueCount = await prisma.issue.count();
    console.log(`✅ Issues in database: ${issueCount}`);

    const departmentCount = await prisma.department.count();
    console.log(`✅ Departments in database: ${departmentCount}`);

    // Test simple issue query
    console.log('\n📋 Testing Issues Query...');
    const issues = await prisma.issue.findMany({
      take: 3,
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
        department: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`✅ Successfully fetched ${issues.length} issues:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (${issue.category}) - ${issue.status}`);
      console.log(`   Reporter: ${issue.reportedBy?.profile?.firstName} ${issue.reportedBy?.profile?.lastName}`);
      console.log(`   Department: ${issue.department?.name || 'Unassigned'}`);
      console.log(`   Images: ${issue.images?.length || 0} files`);
      console.log('');
    });

    console.log('🎉 PostgreSQL integration working perfectly!');
    
  } catch (error) {
    console.error('❌ PostgreSQL test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPostgreSQL();
