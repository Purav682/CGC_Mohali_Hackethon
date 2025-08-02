import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (table) {
      // Get specific table data
      const data = await getTableData(table, limit, offset)
      return NextResponse.json(data)
    }

    // Get all table schemas and counts
    const tableInfo = await getAllTableInfo()
    return NextResponse.json(tableInfo)

  } catch (error) {
    console.error('Database admin error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database information' },
      { status: 500 }
    )
  }
}

async function getTableData(table: string, limit: number, offset: number) {
  const prismaModel = (prisma as any)[table]
  if (!prismaModel) {
    throw new Error(`Table ${table} not found`)
  }

  const [data, total] = await Promise.all([
    prismaModel.findMany({
      take: limit,
      skip: offset,
      include: getIncludeConfig(table)
    }),
    prismaModel.count()
  ])

  return {
    table,
    data,
    total,
    limit,
    offset,
    hasMore: offset + limit < total
  }
}

async function getAllTableInfo() {
  const tables = [
    'user', 'userProfile', 'issue', 'issueImage', 'comment', 'vote', 
    'department', 'tag', 'issueTag', 'statusChange', 'notification', 
    'activityLog', 'analyticsEvent', 'systemMetrics', 'flagReport'
  ]

  const tableInfo = await Promise.all(
    tables.map(async (table) => {
      try {
        const prismaModel = (prisma as any)[table]
        const count = await prismaModel.count()
        return { table, count, status: 'success' }
      } catch (error) {
        return { table, count: 0, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })
  )

  return { tables: tableInfo }
}

function getIncludeConfig(table: string) {
  const includeConfigs: Record<string, any> = {
    user: {
      profile: true,
      reportedIssues: { take: 3 },
      comments: { take: 3 }
    },
    issue: {
      reportedBy: { include: { profile: true } },
      assignedTo: { include: { profile: true } },
      department: true,
      images: true,
      tags: { include: { tag: true } },
      comments: { take: 5, include: { author: { include: { profile: true } } } },
      votes: { take: 5, include: { user: { include: { profile: true } } } }
    },
    comment: {
      author: { include: { profile: true } },
      issue: { select: { title: true, id: true } }
    },
    vote: {
      user: { include: { profile: true } },
      issue: { select: { title: true, id: true } }
    },
    statusChange: {
      issue: { select: { title: true, id: true } },
      changedBy: { include: { profile: true } }
    },
    notification: {
      user: { include: { profile: true } },
      issue: { select: { title: true, id: true } }
    },
    activityLog: {
      user: { include: { profile: true } },
      issue: { select: { title: true, id: true } }
    }
  }

  return includeConfigs[table] || {}
}
