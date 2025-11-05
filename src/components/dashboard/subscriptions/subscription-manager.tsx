
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SubscriptionService, { 
  Subscription, 
  SubscriptionAnalytics,
  GetSubscriptionsParams,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest 
} from '@/services/subscriptions';

// Interfaces imported from service layer

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planTypeFilter, setPlanTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch subscriptions with filters using service layer
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

  // Fetch analytics using service layer
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
      // Don't show toast for analytics errors as it's not critical
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchAnalytics();
  }, [currentPage, statusFilter, planTypeFilter]);

  // Filter subscriptions by search term
  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle subscription update using service layer
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

  // Handle subscription cancellation using service layer
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

  // Handle subscription reactivation using service layer
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

  // Handle subscription deletion using service layer
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-500', text: 'Active' },
      cancelled: { color: 'bg-red-500', text: 'Cancelled' },
      expired: { color: 'bg-gray-500', text: 'Expired' },
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      suspended: { color: 'bg-orange-500', text: 'Suspended' },
      trial: { color: 'bg-blue-500', text: 'Trial' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
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
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalActive}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Period</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.newSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.summary.revenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Count</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.churnCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableHead>Billing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.userId.name}</div>
                        <div className="text-sm text-muted-foreground">{subscription.userId.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.planName}</div>
                        <div className="text-sm text-muted-foreground">{subscription.planType}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell className="capitalize">{subscription.billingCycle}</TableCell>
                    <TableCell>${subscription.price}</TableCell>
                    <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {subscription.daysRemaining !== null ? `${subscription.daysRemaining} days` : 'Lifetime'}
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
                            Edit
                          </DropdownMenuItem>
                          {subscription.status === 'active' && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedSubscription(subscription);
                              setShowCancelDialog(true);
                            }}>
                              <Ban className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          {subscription.status === 'cancelled' && (
                            <DropdownMenuItem onClick={() => handleReactivateSubscription(subscription._id)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reactivate
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

      {/* Edit Subscription Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription details for {selectedSubscription?.userId.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <EditSubscriptionForm
              subscription={selectedSubscription}
              onSave={handleUpdateSubscription}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {selectedSubscription?.userId.name}'s subscription?
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <CancelSubscriptionForm
              subscription={selectedSubscription}
              onSave={handleCancelSubscription}
              onCancel={() => setShowCancelDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Subscription Form Component
function EditSubscriptionForm({ subscription, onSave, onCancel }: {
  subscription: Subscription;
  onSave: (id: string, updates: UpdateSubscriptionRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    status: subscription.status,
    price: subscription.price,
    billingCycle: subscription.billingCycle,
    adminNotes: ''
  });

  return (
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

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(subscription._id, formData)}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}

// Cancel Subscription Form Component
function CancelSubscriptionForm({ subscription, onSave, onCancel }: {
  subscription: Subscription;
  onSave: (id: string, reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');

  return (
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

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Keep Subscription</Button>
        <Button 
          variant="destructive" 
          onClick={() => onSave(subscription._id, reason)}
          disabled={!reason.trim()}
        >
          Cancel Subscription
        </Button>
      </DialogFooter>
    </div>
  );
}