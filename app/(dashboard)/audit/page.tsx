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
import { auditService } from '@/lib/services/admin/audit.service';
import { AuditLog } from '@/lib/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Helper function to safely format dates
const safeFormatDate = (timestamp: any, formatStr: string): string => {
  if (!timestamp || timestamp === null || timestamp === undefined) return 'N/A';

  try {
    // Handle various timestamp formats
    let date: Date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'Invalid date';
    }

    // Check if the date is valid
    if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
      return 'Invalid date';
    }

    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, 'for timestamp:', timestamp);
    return 'Invalid date';
  }
};

// Define the types that the component needs
interface AuditLogEntry extends AuditLog { }

interface AuditLogFilters {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  action?: string;
  userId?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  severity?: string;
  success?: boolean;
}

interface DashboardOverview {
  totalEvents: number;
  successfulOperations: number;
  failedOperations: number;
  uniqueUsers: number;
  criticalEvents: number;
  systemChanges: number;
}

interface TimelineData {
  hourly: Array<{ time: string; events: number; success: number; failures: number }>;
  daily: Array<{ date: string; events: number; success: number; failures: number }>;
}

interface AuditLogDashboardProps {
  initialPeriod?: string;
}

const AuditLogDashboard: React.FC<AuditLogDashboardProps> = ({ initialPeriod = '24h' }) => {
  // Service instance (use the imported auditService directly)

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
    sortOrder: 'desc'
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
      const [statisticsRes, logsRes, securityRes] = await Promise.all([
        auditService.getAuditStatistics(),
        auditService.getAuditLogs({ ...filters, limit: 20 }),
        auditService.getSecurityEvents({ limit: 10 })
      ]);

      // Create overview from statistics
      setOverview({
        totalEvents: statisticsRes.totalEvents || 0,
        successfulOperations: statisticsRes.successfulOperations || 0,
        failedOperations: statisticsRes.failedOperations || 0,
        uniqueUsers: statisticsRes.uniqueUsers || 0,
        criticalEvents: statisticsRes.criticalEvents || 0,
        systemChanges: statisticsRes.systemChanges || 0
      });

      // Set audit logs
      if (logsRes.items) {
        setAuditLogs(logsRes.items);
        setPagination({
          total: logsRes.pagination?.total || 0,
          page: logsRes.pagination?.page || 1,
          limit: logsRes.pagination?.limit || 20,
          pages: logsRes.pagination?.pages || 1,
          hasNext: logsRes.pagination?.hasNext || false,
          hasPrev: logsRes.pagination?.hasPrev || false
        });
      }

      // Set security events
      if (securityRes.items) {
        setSecurityEvents(securityRes.items);
        setFailedOperations(securityRes.items.slice(0, 3)); // Show first few as failed operations
      }

      // Generate mock timeline data
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        events: Math.floor(Math.random() * 50) + 10,
        success: Math.floor(Math.random() * 40) + 8,
        failures: Math.floor(Math.random() * 10) + 1
      }));

      const dailyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          events: Math.floor(Math.random() * 200) + 50,
          success: Math.floor(Math.random() * 180) + 40,
          failures: Math.floor(Math.random() * 20) + 5
        };
      });

      setTimeline({ hourly: hourlyData, daily: dailyData });

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
      if (response.items) {
        setAuditLogs(response.items);
        setPagination({
          total: response.pagination?.total || 0,
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 20,
          pages: response.pagination?.pages || 1,
          hasNext: response.pagination?.hasNext || false,
          hasPrev: response.pagination?.hasPrev || false
        });
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  }, [filters]);

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
      // Get all audit logs for export
      const response = await auditService.getAuditLogs({ ...filters, limit: 10000 });
      const data = response.items || [];

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Simple CSV export
        const headers = ['Timestamp', 'Action', 'User', 'Resource', 'Description', 'IP Address'];
        const csvData = [
          headers.join(','),
          ...data.map(log => [
            log.timestamp || '',
            log.action || '',
            log.userId || '',
            log.resource || '',
            (log.description || '').replace(/,/g, ';'),
            log.ipAddress || ''
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to export audit logs');
      console.error('Export error:', err);
    }
  };

  // Toggle real-time updates (simplified - real-time not supported by current service)
  const toggleRealTime = useCallback(() => {
    if (isRealTimeEnabled) {
      setIsRealTimeEnabled(false);
    } else {
      // For now, just enable polling every 30 seconds when "real-time" is enabled
      setIsRealTimeEnabled(true);
      // Could implement polling here if needed
    }
  }, [isRealTimeEnabled]);

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
              <div className="text-2xl font-bold">{overview.totalEvents.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="ml-1">Total events in period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.criticalEvents.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="ml-1">Critical security events</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Operations</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.failedOperations.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="ml-1">Failed operations</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active in period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.successfulOperations > 0
                  ? Math.round((overview.successfulOperations / overview.totalEvents) * 100)
                  : 0}%
              </div>
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
                {timeline && timeline.hourly.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeline.hourly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => {
                          if (typeof value === 'object' && value.hour !== undefined) {
                            return `${value.hour}:00`;
                          }
                          return safeFormatDate(value, 'HH:mm');
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
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Action type distribution chart would appear here
                </div>
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
              {auditLogs.length > 0 ? (
                <div className="space-y-2">
                  {auditLogs.slice(0, 5).map((log, index) => (
                    <div key={log.id || `recent-log-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                        <div>
                          <p className="text-sm font-medium">{log.description}</p>
                          <p className="text-xs text-muted-foreground">
                            by {log.user?.firstName || 'Unknown'} on {log.resource}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {safeFormatDate(log.timestamp, 'HH:mm:ss')}
                        </p>
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
                <Select value={filters.severity || 'all'} onValueChange={(value) => updateFilter('severity', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.success === undefined ? 'all' : filters.success.toString()}
                  onValueChange={(value) => updateFilter('success', value === 'all' ? undefined : value === 'true')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
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
                    {auditLogs.map((log, index) => (
                      <TableRow key={log.id || `audit-log-${index}`}>
                        <TableCell className="text-sm">
                          {safeFormatDate(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.user?.firstName || log.user?.email || 'System'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{getActionIcon(log.action)}</span>
                            <span className="text-sm">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.resource}: {log.resourceId || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-gray-100 text-gray-800">
                            Medium
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
                      {securityEvents.map((event, index) => (
                        <div key={event.id || `security-event-${index}`} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">{event.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {event.user?.firstName || 'Unknown'} from {event.ipAddress}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">
                            High
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
                      {failedOperations.map((operation, index) => (
                        <div key={operation.id || `failed-op-${index}`} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div>
                              <p className="text-sm font-medium">{operation.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Failed operation
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {safeFormatDate(operation.timestamp, 'HH:mm')}
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
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Resource type analytics chart would appear here
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Events by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Severity distribution chart would appear here
                </div>
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
                        {safeFormatDate(event.timestamp, 'HH:mm:ss')}
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