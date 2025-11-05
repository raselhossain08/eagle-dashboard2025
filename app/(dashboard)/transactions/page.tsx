"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  ArrowUpDown,
  Plus,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock
} from 'lucide-react';
import {
  transactionService,
  Transaction,
  TransactionFilters,
  TransactionAnalytics,
  CreateTransactionData,
  RefundData
} from '@/src/lib/services/shared/transaction.service';

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
  const [pendingPayouts, setPendingPayouts] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalFees: 0,
    totalNetAmount: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
    disputedCount: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Dialog states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<Partial<CreateTransactionData>>({
    type: 'payment',
    currency: 'USD',
    paymentMethod: 'credit_card'
  });
  const [refundForm, setRefundForm] = useState<RefundData>({ 
    transactionId: '',
    reason: '' 
  });
  const [disputeForm, setDisputeForm] = useState({ reason: '', status: 'open' });

  // Load data on component mount and when filters change
  useEffect(() => {
    loadTransactions();
  }, [filters]);

  useEffect(() => {
    loadAnalytics();
    loadPendingPayouts();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions(filters);
      
      setTransactions(response.transactions);
      // Mock summary data since the service doesn't provide it
      setSummary({
        totalAmount: response.transactions.reduce((sum, t) => sum + t.amount, 0),
        totalFees: 0,
        totalNetAmount: response.transactions.reduce((sum, t) => sum + t.amount, 0),
        successfulCount: response.transactions.filter(t => t.status === 'completed').length,
        pendingCount: response.transactions.filter(t => t.status === 'pending').length,
        failedCount: response.transactions.filter(t => t.status === 'failed').length,
        disputedCount: 0
      });
      setPagination({
        currentPage: response.page,
        totalPages: response.totalPages,
        totalDocs: response.total,
        limit: filters.limit || 10,
        hasNextPage: response.page < response.totalPages,
        hasPrevPage: response.page > 1
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await transactionService.getTransactionAnalytics(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
      );
      
      setAnalytics(response);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadPendingPayouts = async () => {
    try {
      // Since there's no specific method, we'll get transactions and filter for processing
      const response = await transactionService.getTransactions({ 
        status: 'processing', 
        limit: 5 
      });
      
      setPendingPayouts(response.transactions);
    } catch (error) {
      console.error('Error loading pending payouts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadTransactions(),
      loadAnalytics(),
      loadPendingPayouts()
    ]);
    setRefreshing(false);
    
    toast.success("Data refreshed successfully");
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 when changing filters
    }));
  };

  const handleCreateTransaction = async () => {
    try {
      if (!createForm.userId || !createForm.amount || !createForm.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      await transactionService.createTransaction(createForm as CreateTransactionData);
      
      toast.success("Transaction created successfully");
      
      setShowCreateDialog(false);
      setCreateForm({
        type: 'payment',
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
      loadTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error("Failed to create transaction");
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedTransaction || !refundForm.reason) {
      toast.error("Please provide a refund reason");
      return;
    }

    try {
      const refundData = {
        ...refundForm,
        transactionId: selectedTransaction.id
      };
      await transactionService.processRefund(refundData);
      
      toast.success("Refund processed successfully");
      
      setShowRefundDialog(false);
      setRefundForm({ transactionId: '', reason: '' });
      loadTransactions();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error("Failed to process refund");
    }
  };

  const handleMarkDisputed = async () => {
    if (!selectedTransaction || !disputeForm.reason) {
      toast.error("Please provide a dispute reason");
      return;
    }

    try {
      // Since there's no markAsDisputed method, we'll just show a message
      toast.info("Dispute marking functionality not yet implemented");
      
      setShowDisputeDialog(false);
      setDisputeForm({ reason: '', status: 'open' });
    } catch (error) {
      console.error('Error marking as disputed:', error);
      toast.error("Failed to mark as disputed");
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return transactionService.formatAmount(amount, currency);
  };

  const getStatusBadge = (status: string) => (
    <Badge className={transactionService.getStatusColor(status as any)}>
      {status}
    </Badge>
  );

  const getTypeBadge = (type: string) => (
    <Badge variant="outline" className={transactionService.getTypeColor(type as any)}>
      {type}
    </Badge>
  );

  const getPayoutBadge = (status: string) => (
    <Badge className={transactionService.getStatusColor(status as any)}>
      {status.replace('_', ' ')}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Management</h1>
          <p className="text-muted-foreground">
            Monitor payments, refunds, and financial transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Transaction</DialogTitle>
                <DialogDescription>
                  Create a new transaction record in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={createForm.userId || ''}
                    onChange={(e) => setCreateForm({...createForm, userId: e.target.value})}
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentReference">Payment Reference</Label>
                  <Input
                    id="paymentReference"
                    value={createForm.paymentReference || ''}
                    onChange={(e) => setCreateForm({...createForm, paymentReference: e.target.value})}
                    placeholder="Enter payment reference"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={createForm.type}
                    onValueChange={(value) => setCreateForm({...createForm, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="chargeback">Chargeback</SelectItem>
                      <SelectItem value="fee">Fee</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={createForm.amount || ''}
                    onChange={(e) => setCreateForm({...createForm, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={createForm.currency}
                    onValueChange={(value) => setCreateForm({...createForm, currency: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="BDT">BDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={createForm.description || ''}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    placeholder="Enter transaction description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTransaction}>
                  Create Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.totalAmount, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Net: {formatAmount(summary.totalNetAmount, 'USD')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.successfulCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((summary.successfulCount / (summary.successfulCount + summary.failedCount + summary.pendingCount)) * 100) || 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {summary.failedCount} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disputed Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.disputedCount}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Manage and monitor all financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by user ID..."
                      className="pl-8"
                      value={filters.userId || ''}
                      onChange={(e) => handleFilterChange('userId', e.target.value)}
                    />
                  </div>
                </div>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="chargeback">Chargeback</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                  </SelectContent>
                </Select>

              </div>

              {/* Transactions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-mono text-sm">{transaction.id}</div>
                              <div className="text-xs text-muted-foreground">
                                Ref: {transaction.paymentReference || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                User ID: {transaction.userId}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.description || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(transaction.type)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {formatAmount(transaction.amount, transaction.currency)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Amount: {formatAmount(transaction.amount, transaction.currency)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="capitalize">{transaction.paymentMethod}</div>
                              <div className="text-xs text-muted-foreground">
                                {transaction.paymentReference || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowTransactionDetails(true);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {transaction.type === 'payment' && transaction.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setShowRefundDialog(true);
                                  }}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                              {transaction.status !== 'failed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setShowDisputeDialog(true);
                                  }}
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalDocs)} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalDocs)} of{' '}
                  {pagination.totalDocs} transactions
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Analytics</CardTitle>
              <CardDescription>
                Detailed insights into transaction patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Providers</h3>
                  {analytics?.byPaymentMethod && Object.entries(analytics.byPaymentMethod).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between py-2 border-b">
                      <div className="capitalize font-medium">{method}</div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {count} transactions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transaction Status</h3>
                  {analytics?.byStatus && Object.entries(analytics.byStatus).map(([status, count]) => (
                    <div key={status._id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status._id)}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatAmount(status.totalAmount, 'USD')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {status.count} transactions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customers */}
              {analytics?.topCustomers && analytics.topCustomers.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
                  <div className="space-y-2">
                    {analytics.topCustomers.slice(0, 10).map((customer) => (
                      <div key={customer.userId} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatAmount(customer.totalAmount, 'USD')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.transactionCount} transactions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>
                Transactions waiting for payout processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending payouts found
                  </div>
                ) : (
                  pendingPayouts.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{transaction.transactionId}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.customerSnapshot?.name || 'Unknown Customer'}
                          </div>
                        </div>
                        <div>
                          {getPayoutBadge(transaction.payout.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatAmount(transaction.netAmount, transaction.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.payout.expectedDate 
                            ? `Expected: ${new Date(transaction.payout.expectedDate).toLocaleDateString()}`
                            : 'No expected date'
                          }
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about transaction {selectedTransaction?.transactionId}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono">{selectedTransaction.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PSP Reference:</span>
                      <span className="font-mono">{selectedTransaction.pspReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      {getTypeBadge(selectedTransaction.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fees:</span>
                      <span>{formatAmount(selectedTransaction.totalFees, selectedTransaction.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Amount:</span>
                      <span className="font-semibold">
                        {formatAmount(selectedTransaction.netAmount, selectedTransaction.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="capitalize">{selectedTransaction.psp.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="capitalize">{selectedTransaction.paymentMethod.type}</span>
                    </div>
                    {selectedTransaction.paymentMethod.last4 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Card:</span>
                        <span>****{selectedTransaction.paymentMethod.last4}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedTransaction.customerSnapshot?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedTransaction.customerSnapshot?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Payout Information */}
                <div>
                  <h4 className="font-semibold mb-2">Payout Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getPayoutBadge(selectedTransaction.payout.status)}
                    </div>
                    {selectedTransaction.payout.expectedDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected:</span>
                        <span>{new Date(selectedTransaction.payout.expectedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="font-semibold mb-2">Timestamps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedTransaction.processedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processed:</span>
                        <span>{new Date(selectedTransaction.processedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for transaction {selectedTransaction?.transactionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount (Optional)</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundForm.amount || ''}
                onChange={(e) => setRefundForm({...refundForm, amount: parseFloat(e.target.value) || undefined})}
                placeholder={`Max: ${selectedTransaction?.amount || 0}`}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Leave empty to refund full amount: {selectedTransaction && formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
              </div>
            </div>
            <div>
              <Label htmlFor="refundReason">Refund Reason</Label>
              <Textarea
                id="refundReason"
                value={refundForm.reason}
                onChange={(e) => setRefundForm({...refundForm, reason: e.target.value})}
                placeholder="Enter reason for refund..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessRefund}>
              Process Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Disputed</DialogTitle>
            <DialogDescription>
              Mark transaction {selectedTransaction?.transactionId} as disputed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="disputeReason">Dispute Reason</Label>
              <Textarea
                id="disputeReason"
                value={disputeForm.reason}
                onChange={(e) => setDisputeForm({...disputeForm, reason: e.target.value})}
                placeholder="Enter reason for dispute..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="disputeStatus">Dispute Status</Label>
              <Select
                value={disputeForm.status}
                onValueChange={(value) => setDisputeForm({...disputeForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkDisputed}>
              Mark as Disputed
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}