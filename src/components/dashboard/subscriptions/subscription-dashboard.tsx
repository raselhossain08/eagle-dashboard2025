
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';
import { SubscriptionService } from '@/lib/services';
import type { Subscription } from '@/lib/services/subscriptions/subscription.service';

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  actor: string;
  resource: string;
  timestamp: Date;
  changes: string;
}

interface DashboardStats {
  expiringSoon: Subscription[];
  dueForRenewal: Subscription[];
  recentActivity: ActivityItem[];
}

export function SubscriptionDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    expiringSoon: [],
    dueForRenewal: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    expiringSoon: false,
    dueForRenewal: false,
    recentActivity: false
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setLoadingStates({
        expiringSoon: true,
        dueForRenewal: true,
        recentActivity: true
      });
      
      // Fetch data with individual error handling
      const [expiringSoonRes, renewalRes, activityRes] = await Promise.allSettled([
        SubscriptionService.getExpiringSoon(7),
        SubscriptionService.getDueForRenewal(),
        SubscriptionService.getRecentActivity(10)
      ]);

      setStats({
        expiringSoon: expiringSoonRes.status === 'fulfilled' && expiringSoonRes.value.success ? expiringSoonRes.value.data : [],
        dueForRenewal: renewalRes.status === 'fulfilled' && renewalRes.value.success ? renewalRes.value.data : [],
        recentActivity: activityRes.status === 'fulfilled' && activityRes.value.success ? activityRes.value.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })) : []
      });

      // Log any errors but don't fail the entire operation
      if (expiringSoonRes.status === 'rejected') {
        console.error('Failed to fetch expiring subscriptions:', expiringSoonRes.reason);
        toast.error('Failed to load expiring subscriptions');
      }
      if (renewalRes.status === 'rejected') {
        console.error('Failed to fetch renewal data:', renewalRes.reason);
        toast.error('Failed to load renewal data');
      }
      if (activityRes.status === 'rejected') {
        console.error('Failed to fetch activity data:', activityRes.reason);
        toast.error('Failed to load activity data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setLoadingStates({
        expiringSoon: false,
        dueForRenewal: false,
        recentActivity: false
      });
    }
  };

  const handleProcessRenewal = async (subscriptionId: string) => {
    try {
      const response = await SubscriptionService.processRenewal(subscriptionId);
      
      if (response.success) {
        toast.success('Renewal processed successfully');
        fetchDashboardData();
      } else {
        throw new Error(response.error || 'Failed to process renewal');
      }
    } catch (error) {
      console.error('Error processing renewal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process renewal');
    }
  };

  // Helper functions
  const getActivityIcon = (action: string) => {
    const iconMap: { [key: string]: string } = {
      'CREATE': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️',
      'CANCEL': '🚫',
      'RENEW': '🔄',
      'SUSPEND': '⏸️',
      'RESUME': '▶️',
      'PAUSE': '⏸️',
      'REACTIVATE': '🔄',
      'PLAN_CHANGE': '🔀',
      'PAYMENT': '💳'
    };
    return iconMap[action.toUpperCase()] || '📄';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Helper function to create sample data
  const createSampleData = async () => {
    try {
      const result = await SubscriptionService.createSampleData();
      
      if (result.success) {
        toast.success(result.message || 'Sample data created successfully');
        fetchDashboardData(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to create sample data');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample data');
    }
  };

  // Helper function to create sample audit logs
  const createSampleAuditLogs = async () => {
    try {
      const result = await SubscriptionService.createSampleAuditLogs();
      
      if (result.success) {
        toast.success(result.message || 'Sample audit logs created successfully');
        fetchDashboardData(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to create sample audit logs');
      }
    } catch (error) {
      console.error('Error creating sample audit logs:', error);
      toast.error('Failed to create sample audit logs');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expiring Soon */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Expiring Soon
            </CardTitle>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              {stats.expiringSoon.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.expiringSoon.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Subscriptions expiring within 7 days
            </p>
          </CardContent>
        </Card>

        {/* Due for Renewal */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              Due for Renewal
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-red-600 border-red-600">
                {stats.dueForRenewal.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchDashboardData}
                className="h-6 w-6 p-0"
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.dueForRenewal.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Subscriptions requiring renewal action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="expiring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expiring" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Expiring Soon
          </TabsTrigger>
          <TabsTrigger value="renewals" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Renewals
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Expiring Soon Tab */}
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Subscriptions Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.expiringSoon.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No subscriptions expiring soon</p>
                  {stats.dueForRenewal.length === 0 && stats.recentActivity.length === 0 && (
                    <Button
                      onClick={createSampleData}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Create Sample Data for Testing
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.expiringSoon.map((subscription) => (
                    <div
                      key={subscription._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{subscription.userId.name}</p>
                            <p className="text-sm text-gray-500">{subscription.userId.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{subscription.planName}</Badge>
                            <Badge 
                              className={`${
                                (subscription.daysRemaining ?? 0) <= 3 
                                  ? 'bg-red-500' 
                                  : 'bg-yellow-500'
                              } text-white`}
                            >
                              {subscription.daysRemaining} days left
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          ${subscription.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleProcessRenewal(subscription._id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Renew
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Due for Renewal Tab */}
        <TabsContent value="renewals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Subscriptions Due for Renewal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.dueForRenewal.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No renewals due</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.dueForRenewal.map((subscription) => (
                    <div
                      key={subscription._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{subscription.userId.name}</p>
                            <p className="text-sm text-gray-500">{subscription.userId.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{subscription.planName}</Badge>
                            <Badge className="bg-blue-500 text-white">
                              Due: {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'Now'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          ${subscription.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleProcessRenewal(subscription._id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Subscription activities will appear here
                  </p>
                  <div className="flex gap-2 justify-center mt-4">
                    {stats.expiringSoon.length > 0 || stats.dueForRenewal.length > 0 ? (
                      <Button
                        onClick={createSampleAuditLogs}
                        variant="outline"
                        size="sm"
                      >
                        Create Sample Activity
                      </Button>
                    ) : (
                      <Button
                        onClick={createSampleData}
                        variant="outline"
                        size="sm"
                      >
                        Create Sample Data
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            {getActivityIcon(activity.action)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              by {activity.actor} • {activity.resource}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {activity.changes}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 ml-4">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SubscriptionDashboard;