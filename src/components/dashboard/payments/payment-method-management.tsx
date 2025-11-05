
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PaymentMethod, paymentMethodService, PaymentMethodListOptions } from '@/lib/services/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/lib/hooks';
import { Loader2, Plus, Search, Filter, Download, Trash2, Shield, CreditCard, University, Wallet, Bitcoin, Eye, Edit, Star, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentMethodForm } from './payment-method-form';
import { PaymentMethodEditForm } from './payment-method-edit-form';
import { PaymentMethodVerifyForm } from './payment-method-verify-form';

interface PaymentMethodManagementProps {
  className?: string;
}

export function PaymentMethodManagement({ className }: PaymentMethodManagementProps) {
  const { toast } = useToast();
  
  // State management
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PaymentMethodListOptions>({
    page: 1,
    limit: 10,
    type: 'all',
    provider: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  /**
   * Load payment methods from API
   */
  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getPaymentMethods(filters);
      
      if (response.success) {
        setPaymentMethods(response.data.paymentMethods);
        setPagination(response.data.pagination);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load payment methods'
        });
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load payment methods'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load payment methods on component mount and filter changes
  useEffect(() => {
    loadPaymentMethods();
  }, [filters]);

  /**
   * Filter payment methods based on search term
   */
  const filteredPaymentMethods = useMemo(() => {
    if (!searchTerm) return paymentMethods;
    
    const term = searchTerm.toLowerCase();
    return paymentMethods.filter(method => {
      const displayName = paymentMethodService.formatDisplayName(method).toLowerCase();
      const provider = method.provider.toLowerCase();
      const type = method.type.toLowerCase();
      const status = method.status.toLowerCase();
      
      return displayName.includes(term) || 
             provider.includes(term) || 
             type.includes(term) || 
             status.includes(term);
    });
  }, [paymentMethods, searchTerm]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof PaymentMethodListOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when changing filters
    }));
  };

  /**
   * Handle page changes
   */
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  /**
   * Handle selection changes
   */
  const handleSelectMethod = (methodId: string, selected: boolean) => {
    setSelectedMethods(prev => {
      if (selected) {
        return [...prev, methodId];
      } else {
        return prev.filter(id => id !== methodId);
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMethods(filteredPaymentMethods.map(method => method._id));
    } else {
      setSelectedMethods([]);
    }
  };

  /**
   * Handle setting default payment method
   */
  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await paymentMethodService.setDefaultPaymentMethod(methodId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Default payment method updated successfully'
        });
        loadPaymentMethods(); // Refresh the list
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to set default payment method'
      });
    }
  };

  /**
   * Handle payment method deletion
   */
  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const response = await paymentMethodService.deletePaymentMethod(methodId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment method deleted successfully'
        });
        loadPaymentMethods(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete payment method'
      });
    }
  };

  /**
   * Handle bulk operations
   */
  const handleBulkOperation = async (operation: 'delete' | 'activate' | 'deactivate') => {
    if (selectedMethods.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select payment methods to perform bulk operation'
      });
      return;
    }

    if (!confirm(`Are you sure you want to ${operation} ${selectedMethods.length} payment method(s)?`)) {
      return;
    }

    try {
      const response = await paymentMethodService.bulkOperation(operation, selectedMethods);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Bulk ${operation} completed successfully. ${response.data.affected} payment methods affected.`
        });
        setSelectedMethods([]);
        loadPaymentMethods(); // Refresh the list
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to perform bulk operation'
      });
    }
  };

  /**
   * Get payment method type icon
   */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank_account': return <University className="h-4 w-4" />;
      case 'digital_wallet': return <Wallet className="h-4 w-4" />;
      case 'crypto': return <Bitcoin className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'expired': return 'destructive';
      case 'failed': return 'destructive';
      case 'pending_verification': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage secure payment methods with PSP tokenization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All payment data is securely tokenized through payment service providers. Raw payment information is never stored.
        </AlertDescription>
      </Alert>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payment methods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="card">Cards</SelectItem>
                  <SelectItem value="bank_account">Bank Account</SelectItem>
                  <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.provider || 'all'} 
                onValueChange={(value) => handleFilterChange('provider', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending_verification">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedMethods.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedMethods.length} payment method(s) selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkOperation('activate')}
                >
                  Activate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkOperation('deactivate')}
                >
                  Deactivate
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkOperation('delete')}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading payment methods...
            </div>
          ) : filteredPaymentMethods.length === 0 ? (
            <div className="text-center p-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Payment Methods Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No payment methods match your search criteria.' : 'Get started by adding your first payment method.'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedMethods.length === filteredPaymentMethods.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Security</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaymentMethods.map((method) => (
                    <TableRow key={method._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMethods.includes(method._id)}
                          onCheckedChange={(checked) => handleSelectMethod(method._id, checked as boolean)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getTypeIcon(method.type)}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {paymentMethodService.formatDisplayName(method)}
                              {method.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {method.billingAddress?.country || 'No address'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {method.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {method.provider}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={getStatusVariant(method.status)} className="capitalize">
                          {method.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {method.type === 'card' ? (
                          <div className={paymentMethodService.isExpired(method) ? 'text-destructive' : ''}>
                            {paymentMethodService.formatExpiryDate(method)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div>{method.usage?.totalTransactions || 0} transactions</div>
                          <div className="text-muted-foreground">
                            {paymentMethodService.formatSuccessRate(method.usage?.successRate || 0)} success rate
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={paymentMethodService.getSecurityLevelVariant(method)}>
                          {method.securityLevel?.replace('_', ' ') || 'secure'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMethod(method);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {!method.isDefault && (
                              <DropdownMenuItem
                                onClick={() => handleSetDefault(method._id)}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            {method.verification?.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMethod(method);
                                  setShowVerifyModal(true);
                                }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(method._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} payment methods
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === pagination.totalPages || 
                          (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                        )
                        .map((page, index, array) => (
                          <>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span key={`ellipsis-${page}`} className="px-2">...</span>
                            )}
                            <Button
                              key={page}
                              variant={page === pagination.currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Payment Method Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Payment Method</DialogTitle>
            <DialogDescription>
              Add a secure payment method with PSP tokenization. All payment data is encrypted and tokenized.
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm
            onSuccess={() => {
              setShowCreateModal(false);
              loadPaymentMethods(); // Refresh the list
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Payment Method Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update payment method details and billing information.
            </DialogDescription>
          </DialogHeader>
          {selectedMethod && (
            <PaymentMethodEditForm
              paymentMethod={selectedMethod}
              onSuccess={() => {
                setShowEditModal(false);
                setSelectedMethod(null);
                loadPaymentMethods(); // Refresh the list
              }}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedMethod(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Payment Method Modal */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verify Payment Method</DialogTitle>
            <DialogDescription>
              Complete payment method verification to enable full functionality.
            </DialogDescription>
          </DialogHeader>
          {selectedMethod && (
            <PaymentMethodVerifyForm
              paymentMethod={selectedMethod}
              onSuccess={() => {
                setShowVerifyModal(false);
                setSelectedMethod(null);
                loadPaymentMethods(); // Refresh the list
              }}
              onCancel={() => {
                setShowVerifyModal(false);
                setSelectedMethod(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}