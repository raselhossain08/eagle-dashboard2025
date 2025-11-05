'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Shield, 
  Activity, 
  Users, 
  Download, 
  Search, 
  Filter, 
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, subHours } from 'date-fns';
import AuditLogService, {
  AuditLogEntry,
  AuditLogFilters,
  DashboardOverview,
  TimelineData,
  initializeAuditLogService
} from '@/lib/services/admin/audit-log.service';const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AuditLogDashboardProps {
  initialPeriod?: string;
}

const AuditLogDashboard: React.FC<AuditLogDashboardProps> = ({ initialPeriod = '24h' }) => {
  // Service instance
  const [auditService] = useState(() => initializeAuditLogService());
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(initialPeriod);
  
  // Dashboard data
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<AuditLogEntry[]>([]);
  const [failedOperations, setFailedOperations] = useState<AuditLogEntry[]>([]);
  
  // Filters and pagination
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: -1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Real-time updates
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [realTimeEvents, setRealTimeEvents] = useState<any[]>([]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [overviewRes, timelineRes, logsRes, securityRes, failedRes] = await Promise.all([
        auditService.getDashboardOverview(period),
        auditService.getActivityTimeline({ period }),
        auditService.getAuditLogs({ ...filters, limit: 20 }),
        auditService.getSecurityEvents({ limit: 10 }),
        auditService.getFailedOperations({ limit: 10 })
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (timelineRes.success) setTimeline(timelineRes.data);
      if (logsRes.success) {
        setAuditLogs(logsRes.data.logs);
        setPagination(logsRes.data.pagination);
      }
      if (securityRes.success) setSecurityEvents(securityRes.data.logs || []);
      if (failedRes.success) setFailedOperations(failedRes.data.logs || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [auditService, period, filters]);

  // Load audit logs with filters
  const loadAuditLogs = useCallback(async () => {
    try {
      const response = await auditService.getAuditLogs(filters);
      if (response.success) {
        setAuditLogs(response.data.logs);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  }, [auditService, filters]);

  // Handle search
  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  }, [searchTerm]);

  // Handle filter changes
  const updateFilter = useCallback((key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  // Handle export
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await auditService.downloadAuditLogs({
        format,
        filters,
        maxRecords: 10000
      });
    } catch (err) {
      setError('Failed to export audit logs');
      console.error('Export error:', err);
    }
  };

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    if (isRealTimeEnabled) {
      auditService.disconnectRealTime();
      setIsRealTimeEnabled(false);
    } else {
      auditService.subscribeToRealTimeUpdates(
        (event: any) => {
          setRealTimeEvents(prev => [event, ...prev.slice(0, 9)]);
          if (event.type === 'audit_log') {
            loadDashboardData(); // Refresh dashboard on new audit events
          }
        },
        (error: any) => {
          console.error('Real-time error:', error);
          setIsRealTimeEnabled(false);
        }
      );
      setIsRealTimeEnabled(true);
    }
  }, [isRealTimeEnabled, auditService, loadDashboardData]);

  // Effects
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Helper functions
  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (actionType: string) => {
    const icons = {
      CREATE: '➕',
      UPDATE: '✏️', 
      DELETE: '🗑️',
      READ: '👀',
      LOGIN: '🔐',
      LOGOUT: '🚪',
      SECURITY_ALERT: '🚨'
    };
    return icons[actionType as keyof typeof icons] || '📄';
  };

  const getTrendIcon = (trend: string) => {
    const value = parseFloat(trend);
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading audit dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system activities, security events, and compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={isRealTimeEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleRealTime}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isRealTimeEnabled ? 'Live' : 'Static'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.overview.totalLogs.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overview.trends.totalLogs)}
                <span className="ml-1">{overview.trends.totalLogs}% from previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.overview.securityEvents.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overview.trends.securityEvents)}
                <span className="ml-1">{overview.trends.securityEvents}% from previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Operations</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.overview.failedOperations.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overview.trends.failedOperations)}
                <span className="ml-1">{overview.trends.failedOperations}% from previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.overview.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active in period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.overview.successRate}%</div>
              <p className="text-xs text-muted-foreground">Overall success rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Event activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline && timeline.timeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeline.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => {
                          if (typeof value === 'object' && value.hour !== undefined) {
                            return `${value.hour}:00`;
                          }
                          return format(new Date(value), 'HH:mm');
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Events" />
                      <Line type="monotone" dataKey="success" stroke="#82ca9d" name="Success" />
                      <Line type="monotone" dataKey="errors" stroke="#ff7300" name="Errors" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No timeline data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Action Types</CardTitle>
                <CardDescription>Distribution of action types</CardDescription>
              </CardHeader>
              <CardContent>
                {overview && overview.statistics.actionTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={overview.statistics.actionTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="type"
                      >
                        {overview.statistics.actionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No action data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest audit log entries</CardDescription>
            </CardHeader>
            <CardContent>
              {overview && overview.recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {overview.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getActionIcon(activity.action)}</span>
                        <div>
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            by {activity.actor} on {activity.resource}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(activity.timestamp, 'HH:mm:ss')}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.changes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search audit logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filters.severity || ''} onValueChange={(value) => updateFilter('severity', value || undefined)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Severity</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.success === undefined ? '' : filters.success.toString()} 
                  onValueChange={(value) => updateFilter('success', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Success</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply
                </Button>
                <Button variant="outline" onClick={() => handleExport('csv')} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Showing {auditLogs.length} of {pagination.total.toLocaleString()} entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.actor.userName || log.actor.userEmail || 'System'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{getActionIcon(log.action.type)}</span>
                            <span className="text-sm">{log.action.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.resource.type}: {log.resource.name || log.resource.id}
                        </TableCell>
                        <TableCell>
                          {log.action.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(log.action.severity)}>
                            {log.action.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => updateFilter('page', pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => updateFilter('page', pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Events
                </CardTitle>
                <CardDescription>Recent security-related activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {securityEvents.length > 0 ? (
                    <div className="space-y-2">
                      {securityEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">{event.action.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {event.actor.userName || event.actor.userEmail} from {event.actor.ipAddress}
                              </p>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(event.action.severity)}>
                            {event.action.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No security events
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Failed Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Failed Operations
                </CardTitle>
                <CardDescription>Recent failed operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {failedOperations.length > 0 ? (
                    <div className="space-y-2">
                      {failedOperations.map((operation) => (
                        <div key={operation.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div>
                              <p className="text-sm font-medium">{operation.action.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {operation.action.errorMessage}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(operation.timestamp, 'HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No failed operations
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Resource Types */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Types</CardTitle>
                <CardDescription>Activity by resource type</CardDescription>
              </CardHeader>
              <CardContent>
                {overview && overview.statistics.resourceTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overview.statistics.resourceTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No resource data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Events by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                {overview && overview.statistics.severity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={overview.statistics.severity}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ level, percentage }) => `${level} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="level"
                      >
                        {overview.statistics.severity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No severity data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time Events Panel */}
      {isRealTimeEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 animate-pulse" />
              Real-time Events
            </CardTitle>
            <CardDescription>Live audit events as they happen</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              {realTimeEvents.length > 0 ? (
                <div className="space-y-1">
                  {realTimeEvents.map((event, index) => (
                    <div key={index} className="text-xs p-1 border-l-2 border-blue-500 pl-2">
                      <span className="text-muted-foreground">
                        {format(new Date(event.timestamp), 'HH:mm:ss')}
                      </span>
                      <span className="ml-2">{event.message || JSON.stringify(event)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Waiting for real-time events...
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditLogDashboard;