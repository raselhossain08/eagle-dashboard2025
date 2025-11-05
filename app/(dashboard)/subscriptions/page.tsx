
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Ban,
  RotateCcw,
  Trash2,
  Eye,
  Play,
  Pause,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  RefreshCw,
  ArrowDown,
  PauseCircle,
  PlayCircle,
  StopCircle,
  ArrowUp,
  RefreshCcw,
  Shuffle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { SubscriptionService } from '@/lib/services';
import PlanService from '@/lib/services/plans/plan.service';
import type { 
  Subscription, 
  SubscriptionAnalytics,
  GetSubscriptionsParams,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest 
} from '@/lib/services/subscriptions/subscription.service';
import type { Plan } from '@/lib/services/plans/plan.service';
import SubscriptionDashboard from '@/components/dashboard/subscriptions/subscription-dashboard';

export default function SubscriptionManagementPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planTypeFilter, setPlanTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);

  // Fetch subscriptions with filters
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      const params: GetSubscriptionsParams = {
        page: currentPage,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (planTypeFilter !== 'all') params.planType = planTypeFilter;

      const response = await SubscriptionService.getSubscriptions(params);
      
      if (response.success) {
        setSubscriptions(response.data);
        setTotalPages(response.pagination.pages);
      } else {
        throw new Error(response.error || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await SubscriptionService.getAnalytics();
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch available plans for plan changes
  const fetchAvailablePlans = async () => {
    try {
      const response = await PlanService.getPlans({ isActive: true });
      if (response.success && response.data) {
        setAvailablePlans(response.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchAnalytics();
    fetchAvailablePlans();
  }, [currentPage, statusFilter, planTypeFilter]);

  // Filter subscriptions by search term and health status
  const filteredSubscriptions = subscriptions.filter(sub => {
    // Safe string operations with null checks
    const userName = sub.userId?.name || '';
    const userEmail = sub.userId?.email || '';
    const planName = sub.planName || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (healthFilter === 'all') return true;
    
    const daysRemaining = sub.daysRemaining ?? null;
    const isActive = sub.status === 'active';
    
    switch (healthFilter) {
      case 'healthy':
        return isActive && (daysRemaining === null || daysRemaining > 30);
      case 'warning':
        return isActive && daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 7;
      case 'critical':
        return isActive && daysRemaining !== null && daysRemaining <= 7;
      case 'inactive':
        return !isActive;
      default:
        return true;
    }
  });

  // Action handlers
  const handleUpdateSubscription = async (subscriptionId: string, updates: UpdateSubscriptionRequest) => {
    try {
      const response = await SubscriptionService.updateSubscription(subscriptionId, updates);
      
      if (response.success) {
        toast.success('Subscription updated successfully');
        fetchSubscriptions();
        setShowEditDialog(false);
      } else {
        throw new Error(response.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, reason: string) => {
    try {
      const cancelData: CancelSubscriptionRequest = { reason };
      const response = await SubscriptionService.cancelSubscription(subscriptionId, cancelData);
      
      if (response.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptions();
        setShowCancelDialog(false);
      } else {
        throw new Error(response.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      const response = await SubscriptionService.reactivateSubscription(subscriptionId);
      
      if (response.success) {
        toast.success('Subscription reactivated successfully');
        fetchSubscriptions();
      } else {
        throw new Error(response.error || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate subscription');
    }
  };

  const handleSuspendSubscription = async (subscriptionId: string, reason: string) => {
    try {
      const response = await SubscriptionService.suspendSubscription(subscriptionId, reason);
      
      if (response.success) {
        toast.success('Subscription suspended successfully');
        fetchSubscriptions();
      } else {
        throw new Error(response.error || 'Failed to suspend subscription');
      }
    } catch (error) {
      console.error('Error suspending subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to suspend subscription');
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      const response = await SubscriptionService.resumeSubscription(subscriptionId);
      
      if (response.success) {
        toast.success('Subscription resumed successfully');
        fetchSubscriptions();
      } else {
        throw new Error(response.error || 'Failed to resume subscription');
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resume subscription');
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await SubscriptionService.deleteSubscription(subscriptionId);
      
      if (response.success) {
        toast.success('Subscription deleted successfully');
        fetchSubscriptions();
      } else {
        throw new Error(response.error || 'Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete subscription');
    }
  };

  const handlePlanChange = async (subscriptionId: string, newPlanId: string, newBillingCycle: string, effectiveDate?: string) => {
    try {
      const selectedPlan = availablePlans.find(plan => plan._id === newPlanId);
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // Use the dedicated plan change service method
      const response = await SubscriptionService.changePlan(subscriptionId, {
        newPlanId,
        billingCycle: newBillingCycle,
        effectiveDate,
        prorationMode: effectiveDate ? 'next_cycle' : 'immediate'
      });
      
      if (response.success) {
        const changeType = effectiveDate ? 'scheduled' : 'immediate';
        toast.success(`Plan change ${changeType === 'immediate' ? 'completed' : 'scheduled'} successfully`);
        fetchSubscriptions();
        setShowPlanChangeDialog(false);
      } else {
        throw new Error(response.error || 'Failed to change plan');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change plan');
    }
  };

  const handleCancelScheduledChange = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel the scheduled plan change?')) {
      return;
    }

    try {
      const response = await SubscriptionService.cancelScheduledPlanChange(subscriptionId);
      
      if (response.success) {
        toast.success('Scheduled plan change cancelled successfully');
        fetchSubscriptions();
      } else {
        throw new Error(response.error || 'Failed to cancel scheduled change');
      }
    } catch (error) {
      console.error('Error cancelling scheduled change:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel scheduled change');
    }
  };

  // UI Helper Functions
  const getStatusBadge = (status: string, isPaused?: boolean) => {
    if (isPaused) {
      return <Badge className="bg-orange-500 text-white">Paused</Badge>;
    }

    const statusConfig = {
      active: { color: 'bg-green-500', text: 'Active', icon: CheckCircle },
      cancelled: { color: 'bg-red-500', text: 'Cancelled', icon: XCircle },
      expired: { color: 'bg-gray-500', text: 'Expired', icon: Clock },
      pending: { color: 'bg-yellow-500', text: 'Pending', icon: Clock },
      suspended: { color: 'bg-orange-500', text: 'Suspended', icon: PauseCircle },
      trial: { color: 'bg-blue-500', text: 'Trial', icon: Zap },
      paused: { color: 'bg-orange-500', text: 'Paused', icon: PauseCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getHealthBadge = (daysRemaining: number | null, status: string) => {
    if (status !== 'active') return null;
    if (daysRemaining === null) return <Badge className="bg-purple-500 text-white">Lifetime</Badge>;
    
    if (daysRemaining <= 7) {
      return <Badge className="bg-red-500 text-white flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Critical
      </Badge>;
    }
    
    if (daysRemaining <= 30) {
      return <Badge className="bg-yellow-500 text-white flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Warning
      </Badge>;
    }
    
    return <Badge className="bg-green-500 text-white flex items-center gap-1">
      <CheckCircle className="w-3 h-3" />
      Healthy
    </Badge>;
  };

  const getDaysRemainingProgress = (daysRemaining: number | null, billingCycle: string) => {
    if (daysRemaining === null) return 100;
    
    const totalDays = billingCycle === 'monthly' ? 30 : 365;
    const progress = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
    return progress;
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user subscriptions, renewals, and billing cycles
          </p>
        </div>
      </div>
    {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.summary.totalActive}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Changes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {subscriptions.filter(sub => sub.scheduledPlanChange).length}
              </div>
              <p className="text-xs text-muted-foreground">Plan changes pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Period</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.summary.newSubscriptions}</div>
              <p className="text-xs text-muted-foreground">New signups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${analytics.summary.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Count</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.summary.churnCount}</div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cancelled</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{analytics.summary.totalCancelled}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Dashboard */}
      <SubscriptionDashboard />

  
      {/* Main Management Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, email, or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubscriptions}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planTypeFilter} onValueChange={setPlanTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plan Types</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
                <SelectItem value="mentorship">Mentorships</SelectItem>
                <SelectItem value="script">Scripts</SelectItem>
                <SelectItem value="addon">Add-ons</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>

            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health Status</SelectItem>
                <SelectItem value="healthy">Healthy (30+ days)</SelectItem>
                <SelectItem value="warning">Warning (7-30 days)</SelectItem>
                <SelectItem value="critical">Critical (≤7 days)</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.userId?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{subscription.userId?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.planName}</div>
                        <div className="text-sm text-muted-foreground capitalize">{subscription.planType}</div>
                        {subscription.scheduledPlanChange && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                              Changes to {subscription.scheduledPlanChange.newPlanName} on{' '}
                              {new Date(subscription.scheduledPlanChange.effectiveDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(subscription.status)}
                    </TableCell>
                    <TableCell>
                      {getHealthBadge(subscription.daysRemaining ?? null, subscription.status)}
                    </TableCell>
                    <TableCell className="capitalize">{subscription.billingCycle}</TableCell>
                    <TableCell>${subscription.price}</TableCell>
                    <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {subscription.daysRemaining !== null ? `${subscription.daysRemaining} days` : 'Lifetime'}
                    </TableCell>
                    <TableCell>
                      {subscription.daysRemaining !== null && subscription.daysRemaining !== undefined && (
                        <div className="w-20">
                          <Progress 
                            value={getDaysRemainingProgress(subscription.daysRemaining ?? null, subscription.billingCycle)} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowEditDialog(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          
                          {subscription.status === 'active' && (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowPlanChangeDialog(true);
                              }}>
                                <Shuffle className="mr-2 h-4 w-4" />
                                Change Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowPauseDialog(true);
                              }}>
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Pause
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowCancelDialog(true);
                              }}>
                                <Ban className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSuspendSubscription(subscription._id, 'Admin suspension')}>
                                <StopCircle className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowDowngradeDialog(true);
                              }}>
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Schedule Downgrade
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {(subscription.status === 'cancelled' || subscription.status === 'suspended') && (
                            <DropdownMenuItem onClick={() => handleReactivateSubscription(subscription._id)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}

                          {subscription.status === 'paused' && (
                            <DropdownMenuItem onClick={() => handleResumeSubscription(subscription._id)}>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Resume
                            </DropdownMenuItem>
                          )}

                          {subscription.scheduledPlanChange && (
                            <DropdownMenuItem onClick={() => handleCancelScheduledChange(subscription._id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Scheduled Change
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteSubscription(subscription._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedSubscription && (
        <>
          <EditSubscriptionDialog
            subscription={selectedSubscription}
            open={showEditDialog}
            onClose={() => setShowEditDialog(false)}
            onSave={handleUpdateSubscription}
          />

          <CancelSubscriptionDialog
            subscription={selectedSubscription}
            open={showCancelDialog}
            onClose={() => setShowCancelDialog(false)}
            onSave={handleCancelSubscription}
          />

          <PauseSubscriptionDialog
            subscription={selectedSubscription}
            open={showPauseDialog}
            onClose={() => setShowPauseDialog(false)}
            onSave={(id, duration, reason) => {
              // Implementation for pause functionality
              toast.success('Pause functionality will be implemented');
              setShowPauseDialog(false);
            }}
          />

          <PlanChangeDialog
            subscription={selectedSubscription}
            availablePlans={availablePlans}
            open={showPlanChangeDialog}
            onClose={() => setShowPlanChangeDialog(false)}
            onSave={handlePlanChange}
          />
        </>
      )}
    </div>
  );
}

// Dialog Components
function EditSubscriptionDialog({ subscription, open, onClose, onSave }: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: UpdateSubscriptionRequest) => void;
}) {
  const [formData, setFormData] = useState({
    status: subscription.status,
    price: subscription.price,
    billingCycle: subscription.billingCycle,
    adminNotes: subscription.adminNotes || ''
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update subscription details for {subscription.userId?.name || 'User'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            />
          </div>

          <div>
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select value={formData.billingCycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billingCycle: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="oneTime">One Time</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
              placeholder="Add notes about this change..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(subscription._id, formData)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelSubscriptionDialog({ subscription, open, onClose, onSave }: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel {subscription.userId?.name || 'this user'}'s subscription?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Cancellation Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Keep Subscription</Button>
          <Button 
            variant="destructive" 
            onClick={() => onSave(subscription._id, reason)}
            disabled={!reason.trim()}
          >
            Cancel Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PauseSubscriptionDialog({ subscription, open, onClose, onSave }: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, duration: number, reason: string) => void;
}) {
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pause Subscription</DialogTitle>
          <DialogDescription>
            Temporarily pause {subscription.userId?.name || 'this user'}'s subscription
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="duration">Pause Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              max={90}
            />
          </div>
          <div>
            <Label htmlFor="reason">Pause Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for pausing..."
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSave(subscription._id, duration, reason)}
            disabled={!reason.trim()}
          >
            Pause Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanChangeDialog({ subscription, availablePlans, open, onClose, onSave }: {
  subscription: Subscription;
  availablePlans: Plan[];
  open: boolean;
  onClose: () => void;
  onSave: (subscriptionId: string, newPlanId: string, newBillingCycle: string, effectiveDate?: string) => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'oneTime'>('monthly');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [changeType, setChangeType] = useState<'immediate' | 'scheduled'>('immediate');

  const selectedPlan = availablePlans.find(plan => plan._id === selectedPlanId);
  const currentPlan = availablePlans.find(plan => plan.name === subscription.planName);

  // Get available billing cycles for selected plan
  const getAvailableBillingCycles = (plan: Plan) => {
    const cycles: Array<{ value: string; label: string; price: number }> = [];
    
    if (plan.pricing.monthly) {
      cycles.push({
        value: 'monthly',
        label: 'Monthly',
        price: plan.pricing.monthly.price
      });
    }
    
    if (plan.pricing.annual) {
      cycles.push({
        value: 'annual',
        label: 'Annual',
        price: plan.pricing.annual.price
      });
    }
    
    if (plan.pricing.oneTime) {
      cycles.push({
        value: 'oneTime',
        label: 'One Time',
        price: plan.pricing.oneTime.price
      });
    }
    
    return cycles;
  };

  const availableCycles = selectedPlan ? getAvailableBillingCycles(selectedPlan) : [];
  const currentPrice = subscription.price;
  const newPrice = selectedPlan?.pricing[billingCycle as keyof typeof selectedPlan.pricing]?.price || 0;
  const priceDifference = newPrice - currentPrice;

  const getPlanChangeType = () => {
    if (!selectedPlan || !currentPlan) return 'change';
    
    // Simple logic based on price and access level
    if (selectedPlan.accessLevel > currentPlan.accessLevel || newPrice > currentPrice) {
      return 'upgrade';
    } else if (selectedPlan.accessLevel < currentPlan.accessLevel || newPrice < currentPrice) {
      return 'downgrade';
    }
    return 'change';
  };

  const planChangeType = getPlanChangeType();

  const handleSubmit = () => {
    if (!selectedPlanId || !billingCycle) {
      toast.error('Please select a plan and billing cycle');
      return;
    }

    const effectiveDateValue = changeType === 'scheduled' ? effectiveDate : undefined;
    onSave(subscription._id, selectedPlanId, billingCycle, effectiveDateValue);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            Change Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Change {subscription.userId?.name || 'this user'}'s subscription plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Current Plan</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{subscription.planName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.billingCycle} • ${subscription.price}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Current
              </Badge>
            </div>
          </div>

          {/* Change Type */}
          <div className=' w-full flex-1'>
            <Label htmlFor="changeType" className='pb-3'>Change Type</Label>
            <Select  value={changeType} onValueChange={(value: 'immediate' | 'scheduled') => setChangeType(value)}>
              <SelectTrigger className='flex-1'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='flex-1'>
                <SelectItem value="immediate">
                  <div className="flex items-center gap-2 ">
                    <Zap className="w-4 h-4" />
                    Immediate Change
                  </div>
                </SelectItem>
                <SelectItem value="scheduled">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule for Later
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Effective Date */}
          {changeType === 'scheduled' && (
            <div>
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Plan Selection */}
          <div className='flex-1 w-full'>
            <Label htmlFor="planSelect" className='pb-3'>Select New Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availablePlans
                  .filter(plan => plan._id !== currentPlan?._id)
                  .map((plan) => (
                  <SelectItem key={plan._id} value={plan._id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="font-medium">{plan.displayName}</p>
                        <p className="text-sm text-gray-500 capitalize">{plan.category} • {plan.planType}</p>
                      </div>
                      {plan.isPopular && (
                        <Badge variant="secondary" className="ml-2">Popular</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Billing Cycle Selection */}
          {selectedPlan && (
            <div>
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(value: 'monthly' | 'annual' | 'oneTime') => setBillingCycle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{cycle.label}</span>
                        <span className="ml-2 font-medium">${cycle.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Comparison */}
          {selectedPlan && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Price Comparison</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span>${currentPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Price:</span>
                  <span>${newPrice}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Difference:</span>
                  <span className={`font-medium ${priceDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {priceDifference >= 0 ? '+' : ''}${priceDifference}
                  </span>
                </div>
              </div>

              {/* Change Type Badge */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Change Type:</span>
                <Badge 
                  className={
                    planChangeType === 'upgrade' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : planChangeType === 'downgrade'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }
                >
                  {planChangeType === 'upgrade' && <ArrowUp className="w-3 h-3 mr-1" />}
                  {planChangeType === 'downgrade' && <ArrowDown className="w-3 h-3 mr-1" />}
                  {planChangeType === 'change' && <RefreshCcw className="w-3 h-3 mr-1" />}
                  {planChangeType.charAt(0).toUpperCase() + planChangeType.slice(1)}
                </Badge>
              </div>
            </div>
          )}

          {/* Plan Features Preview */}
          {selectedPlan && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">New Plan Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPlan.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-800 dark:text-blue-200">{feature}</span>
                  </div>
                ))}
                {selectedPlan.features.length > 6 && (
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    +{selectedPlan.features.length - 6} more features
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedPlanId || !billingCycle || (changeType === 'scheduled' && !effectiveDate)}
            className={
              planChangeType === 'upgrade' 
                ? 'bg-green-600 hover:bg-green-700'
                : planChangeType === 'downgrade'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : ''
            }
          >
            {changeType === 'immediate' ? 'Change Plan Now' : 'Schedule Plan Change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
