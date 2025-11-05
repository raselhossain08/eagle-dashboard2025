
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Receipt,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import {
  invoiceService,
  Invoice,
  InvoiceFilters,
  InvoiceStatus,
  CreateInvoiceRequest,
  RecordPaymentRequest,
  InvoiceAnalytics
} from '@/lib/services/payments/invoice.service';
import { useAuth } from '@/components/providers';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<InvoiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateInvoiceRequest>({
    userId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
    lineItems: [{
      description: '',
      quantity: 1,
      unitPrice: 0
    }]
  });

  const [paymentForm, setPaymentForm] = useState<RecordPaymentRequest>({
    amount: 0,
    method: 'card'
  });

  useEffect(() => {
    loadInvoices();
    loadAnalytics();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAllInvoices(filters);
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await invoiceService.getInvoiceAnalytics('30d');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleCreateInvoice = async () => {
    if (!createForm.userId || !createForm.lineItems.length) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);
      await invoiceService.createInvoice(createForm);
      setSuccess('Invoice created successfully');
      setShowCreateDialog(false);
      resetCreateForm();
      loadInvoices();
      loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setProcessing(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentForm.amount) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      setProcessing(true);
      await invoiceService.recordPayment(selectedInvoice._id, paymentForm);
      setSuccess('Payment recorded successfully');
      setShowPaymentDialog(false);
      setSelectedInvoice(null);
      resetPaymentForm();
      loadInvoices();
      loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      setProcessing(true);
      await invoiceService.sendInvoice(invoice._id);
      setSuccess('Invoice sent successfully');
      loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelInvoice = async (invoice: Invoice) => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;

    try {
      setProcessing(true);
      await invoiceService.cancelInvoice(invoice._id, 'Cancelled by admin');
      setSuccess('Invoice cancelled successfully');
      loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invoice');
    } finally {
      setProcessing(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      userId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      lineItems: [{
        description: '',
        quantity: 1,
        unitPrice: 0
      }]
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: 0,
      method: 'card'
    });
  };

  const addLineItem = () => {
    setCreateForm(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        description: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const removeLineItem = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setCreateForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const variants: Record<InvoiceStatus, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      partially_paid: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={`${variants[status]} hover:${variants[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and billing
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto" 
            onClick={() => setError('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto" 
            onClick={() => setSuccess('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.summary.totalAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.summary.paidAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.summary.paidInvoices} invoices paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics.summary.overdueInvoices}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.summary.overdueAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.newInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.summary.newInvoicesAmount)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search invoices..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status ?? 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : (value as InvoiceStatus)
                }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={filters.currency ?? 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  currency: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="BDT">BDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => {
                const isOverdue = invoiceService.isOverdue(invoice);
                const paymentProgress = invoiceService.calculatePaymentProgress(invoice);
                
                return (
                  <div key={invoice._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customerInfo.name} • {invoice.customerInfo.email}
                          </div>
                        </div>
                        {getStatusBadge(invoice.status)}
                        {isOverdue && (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {formatDate(invoice.dueDate)}
                        </div>
                      </div>
                    </div>

                    {invoice.status === 'partially_paid' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Payment Progress</span>
                          <span>{paymentProgress}%</span>
                        </div>
                        <Progress value={paymentProgress} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          Paid: {formatCurrency(invoice.paymentInfo.paidAmount, invoice.currency)} / 
                          Remaining: {formatCurrency(invoice.paymentInfo.remainingBalance, invoice.currency)}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {invoice.status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => handleSendInvoice(invoice)}>
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}
                      
                      {['sent', 'viewed', 'partially_paid'].includes(invoice.status) && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentForm(prev => ({ 
                              ...prev, 
                              amount: invoice.paymentInfo.remainingBalance 
                            }));
                            setShowPaymentDialog(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Record Payment
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {['draft', 'sent', 'viewed'].includes(invoice.status) && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleCancelInvoice(invoice)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} invoices
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  value={createForm.userId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, userId: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={createForm.currency}
                  onValueChange={(value) => setCreateForm(prev => ({ 
                    ...prev, 
                    currency: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="BDT">BDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={createForm.issueDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {createForm.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={createForm.lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium">
                      {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={createForm.notes || ''}
                onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={processing}>
              {processing ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded">
                <div className="text-sm">
                  <div>Total: {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</div>
                  <div>Paid: {formatCurrency(selectedInvoice.paymentInfo.paidAmount, selectedInvoice.currency)}</div>
                  <div>Remaining: {formatCurrency(selectedInvoice.paymentInfo.remainingBalance, selectedInvoice.currency)}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0.01"
                  max={selectedInvoice.paymentInfo.remainingBalance}
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    amount: parseFloat(e.target.value) 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value) => setPaymentForm(prev => ({ 
                    ...prev, 
                    method: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Transaction reference"
                  value={paymentForm.transactionId || ''}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    transactionId: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="paymentNotes">Notes</Label>
                <Textarea
                  id="paymentNotes"
                  placeholder="Payment notes..."
                  value={paymentForm.notes || ''}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={processing}>
              {processing ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}