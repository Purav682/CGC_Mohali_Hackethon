'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Database, 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  ThumbsUp, 
  Building, 
  Tag,
  Activity,
  BarChart3,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface TableInfo {
  table: string
  count: number
  status: string
  error?: string
}

interface TableData {
  table: string
  data: any[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

const TABLE_ICONS: Record<string, any> = {
  user: Users,
  issue: AlertTriangle,
  comment: MessageSquare,
  vote: ThumbsUp,
  department: Building,
  tag: Tag,
  activityLog: Activity,
  analyticsEvent: BarChart3,
}

export default function DatabaseAdminPanel() {
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 20

  useEffect(() => {
    fetchTableInfo()
  }, [])

  const fetchTableInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/database')
      const data = await response.json()
      setTableInfo(data.tables)
    } catch (error) {
      console.error('Error fetching table info:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async (table: string, page = 0) => {
    try {
      setDataLoading(true)
      const offset = page * itemsPerPage
      const response = await fetch(
        `/api/admin/database?table=${table}&limit=${itemsPerPage}&offset=${offset}`
      )
      const data = await response.json()
      setTableData(data)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching table data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleTableSelect = (table: string) => {
    setSelectedTable(table)
    setCurrentPage(0)
    fetchTableData(table, 0)
  }

  const formatValue = (value: any): string => {
    if (value === null) return 'NULL'
    if (value === undefined) return 'UNDEFINED'
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `Array(${value.length})`
      }
      return JSON.stringify(value, null, 2)
    }
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...'
    }
    return String(value)
  }

  const getTableIcon = (tableName: string) => {
    const Icon = TABLE_ICONS[tableName] || Database
    return <Icon className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8" />
            Database Explorer
          </h1>
          <p className="text-gray-600">View and explore all database tables and records</p>
        </div>
        <Button onClick={fetchTableInfo} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tables Overview</TabsTrigger>
          <TabsTrigger value="explorer">Data Explorer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tableInfo.map((table) => (
              <Card 
                key={table.table} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTableSelect(table.table)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getTableIcon(table.table)}
                    {table.table}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{table.count}</span>
                    <Badge variant={table.status === 'success' ? 'default' : 'destructive'}>
                      {table.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {table.count === 1 ? 'record' : 'records'}
                  </p>
                  {table.error && (
                    <p className="text-xs text-red-500 mt-1">{table.error}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="explorer">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Table Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Table</CardTitle>
                <CardDescription>Choose a table to explore</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {tableInfo.map((table) => (
                      <Button
                        key={table.table}
                        variant={selectedTable === table.table ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => handleTableSelect(table.table)}
                      >
                        {getTableIcon(table.table)}
                        <span className="ml-2">{table.table}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {table.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Data Display */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {selectedTable ? `Table: ${selectedTable}` : 'Select a table'}
                    </CardTitle>
                    {tableData && (
                      <CardDescription>
                        Showing {tableData.data.length} of {tableData.total} records
                      </CardDescription>
                    )}
                  </div>
                  {tableData && tableData.total > itemsPerPage && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchTableData(selectedTable, currentPage - 1)}
                        disabled={currentPage === 0 || dataLoading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage + 1} of {Math.ceil(tableData.total / itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchTableData(selectedTable, currentPage + 1)}
                        disabled={!tableData.hasMore || dataLoading}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : tableData ? (
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {tableData.data.length > 0 &&
                            Object.keys(tableData.data[0]).map((key) => (
                              <TableHead key={key} className="font-semibold">
                                {key}
                              </TableHead>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.data.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <TableCell key={cellIndex} className="max-w-xs">
                                <div className="truncate" title={formatValue(value)}>
                                  {formatValue(value)}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a table to view its data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
