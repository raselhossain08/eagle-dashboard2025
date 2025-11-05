// app/admin/audit-logs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, User, Shield, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { DatePicker } from '@/components/ui/date-picker' // TODO: Create date picker component
import { auditService } from '@/lib/services/admin/audit.service'
import { AuditLog, PaginatedResponse } from '@/lib/types'
import { toast } from 'sonner'

const actions = [
  'login',
  'logout',
  'create',
  'update',
  'delete',
  'read',
  'password_change',
  'permission_change'
]

const resources = [
  'users',
  'roles',
  'permissions',
  'system',
  'authentication'
]

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedResource, setSelectedResource] = useState('all')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)



  useEffect(() => {
    loadAuditLogs()
  }, [page, search, selectedAction, selectedResource, startDate, endDate])

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page,
        limit,
        search: search || undefined
      }

      if (selectedAction !== 'all') {
        params.action = selectedAction
      }
      if (selectedResource !== 'all') {
        params.resource = selectedResource
      }
      if (startDate) {
        params.startDate = startDate.toISOString()
      }
      if (endDate) {
        params.endDate = endDate.toISOString()
      }

      const response = await auditService.getAuditLogs(params) as any
      setLogs(response.items || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const variants = {
      login: 'default',
      logout: 'secondary',
      create: 'outline',
      update: 'default',
      delete: 'destructive',
      read: 'secondary',
      password_change: 'outline',
      permission_change: 'default'
    } as const

    return (
      <Badge variant={variants[action as keyof typeof variants] || 'default'}>
        {action.replace('_', ' ')}
      </Badge>
    )
  }

  const getSeverityColor = (action: string) => {
    const highSeverity = ['delete', 'password_change', 'permission_change']
    if (highSeverity.includes(action)) {
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  const exportLogs = async () => {
    try {
      // Implementation for exporting logs
      toast.success('Your audit logs export has been started')
    } catch (error) {
      toast.error('Failed to export audit logs')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                {total} log entr{total !== 1 ? 'ies' : 'y'} found
              </CardDescription>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map(action => (
                    <SelectItem key={action} value={action} className="capitalize">
                      {action.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger>
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {resources.map(resource => (
                    <SelectItem key={resource} value={resource} className="capitalize">
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                placeholder="Start date"
              />

              <Input
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                placeholder="End date"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={log.id || `audit-log-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{log.user?.fullName}</div>
                            <div className="text-sm text-gray-500">{log.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {log.resource}
                        {log.resourceId && (
                          <div className="text-sm text-gray-500">ID: {log.resourceId}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${getSeverityColor(log.action)}`}>
                          {log.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.ipAddress}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No audit logs found for the selected filters
                </div>
              )}

              {Math.ceil(total / limit) > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    Page {page} of {Math.ceil(total / limit)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(Math.ceil(total / limit), page + 1))}
                    disabled={page === Math.ceil(total / limit)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Events Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Events
          </CardTitle>
          <CardDescription>
            Recent security-related activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs
              .filter(log => ['login', 'logout', 'password_change', 'permission_change'].includes(log.action))
              .slice(0, 5)
              .map((log, index) => (
                <div key={log.id || `security-event-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{log.user?.fullName}</div>
                    <div className="text-sm text-gray-500">{log.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}