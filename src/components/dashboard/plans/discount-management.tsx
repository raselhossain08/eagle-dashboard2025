"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Upload, MoreVertical, Eye, Edit, Trash2, Clock, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { discountService, type Discount, type DiscountFilters, type DiscountAnalytics } from "@/lib/services/plans/discount.service";
import { usePermissions } from "@/hooks/use-permissions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DiscountForm, DiscountAnalyticsCard } from "./index";
import { Checkbox } from "@/components/ui/checkbox";

export default function DiscountManagement() {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  // State management
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [analytics, setAnalytics] = useState<DiscountAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<DiscountFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20
  });
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Permissions
  const canCreate = hasPermission('discount:create');
  const canEdit = hasPermission('discount:update');
  const canDelete = hasPermission('discount:delete');
  const canViewAnalytics = hasPermission('discount:analytics');
  const canApprove = hasPermission('discount:approve');
  const canBulkOperations = hasPermission('discount:bulk');

  // Fetch discounts
  const fetchDiscounts = async (newFilters?: Partial<DiscountFilters>) => {
    setLoading(true);
    const updatedFilters = { ...filters, ...newFilters };
    
    try {
      const response = await discountService.getAllDiscounts({
        ...updatedFilters,
        search: searchTerm || undefined
      });

      if (response.success && response.data) {
        setDiscounts(response.data.discounts || []);
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.totalItems || 0,
          limit: response.data.limit || 20
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load discounts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load discounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!canViewAnalytics) return;
    
    try {
      const response = await discountService.getAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDiscounts();
    fetchAnalytics();
  }, []);

  // Search handler
  const handleSearch = () => {
    fetchDiscounts({ page: 1 });
  };

  // Filter change handler
  const handleFilterChange = (key: keyof DiscountFilters, value: string) => {
    const newFilters = { 
      ...filters, 
      [key]: value === 'all' ? undefined : value,
      page: 1 
    };
    setFilters(newFilters);
    fetchDiscounts(newFilters);
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchDiscounts(newFilters);
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDiscounts(discounts.map(d => d._id!));
    } else {
      setSelectedDiscounts([]);
    }
  };

  const handleSelectDiscount = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDiscounts([...selectedDiscounts, id]);
    } else {
      setSelectedDiscounts(selectedDiscounts.filter(sid => sid !== id));
    }
  };

  // CRUD operations
  const handleCreate = () => {
    setEditingDiscount(null);
    setShowForm(true);
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await discountService.deleteDiscount(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Discount deleted successfully",
        });
        fetchDiscounts();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete discount",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete discount",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setDiscountToDelete(null);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedDiscounts.length === 0) return;

    try {
      const response = await discountService.bulkOperation({
        discountIds: selectedDiscounts,
        operation: 'delete'
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${selectedDiscounts.length} discount(s) deleted successfully`,
        });
        setSelectedDiscounts([]);
        fetchDiscounts();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete discounts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete discounts",
        variant: "destructive",
      });
    }
    setBulkDeleteDialogOpen(false);
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedDiscounts.length === 0) return;

    try {
      const response = await discountService.bulkOperation({
        discountIds: selectedDiscounts,
        operation: 'update',
        updateData: { status }
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${selectedDiscounts.length} discount(s) ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
        });
        setSelectedDiscounts([]);
        fetchDiscounts();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update discounts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update discounts",
        variant: "destructive",
      });
    }
  };

  // Export handler
  const handleExport = async (format: 'json' | 'csv' = 'csv') => {
    try {
      const response = await discountService.exportDiscounts({
        format,
        includeUsage: true,
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      if (response.success) {
        if (format === 'json') {
          const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `discounts-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        
        toast({
          title: "Success",
          description: "Discounts exported successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to export discounts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export discounts",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDiscount(null);
    fetchDiscounts();
    fetchAnalytics();
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {canViewAnalytics && analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overall.totalDiscounts}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overall.activeDiscounts} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overall.totalUses}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overall.utilizationRate}% utilization rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {discountService.formatCurrency(analytics.overall.totalDiscountAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: {discountService.formatCurrency(analytics.overall.averageDiscountValue)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {discountService.formatCurrency(analytics.overall.totalOrderValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total order value
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discount Management</CardTitle>
              <CardDescription>
                Create and manage discount codes, track usage, and analyze performance
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {canCreate && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Discount
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8"
                  />
                </div>
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              <Select onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="exhausted">Exhausted</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('isPublic', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Public</SelectItem>
                  <SelectItem value="false">Private</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="usageCount">Usage</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {canBulkOperations && selectedDiscounts.length > 0 && (
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <span className="text-sm font-medium">
                  {selectedDiscounts.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('active')}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('inactive')}
                >
                  Deactivate
                </Button>
                {canDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Discounts Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {canBulkOperations && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedDiscounts.length === discounts.length && discounts.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount._id}>
                      {canBulkOperations && (
                        <TableCell>
                          <Checkbox
                            checked={selectedDiscounts.includes(discount._id!)}
                            onCheckedChange={(checked) =>
                              handleSelectDiscount(discount._id!, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono">
                        <div className="flex items-center space-x-2">
                          <span>{discount.code}</span>
                          {discount.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Public
                            </Badge>
                          )}
                          {discountService.isDiscountExpiringSoon(discount) && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              <Clock className="mr-1 h-3 w-3" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{discount.name}</div>
                          {discount.description && (
                            <div className="text-sm text-muted-foreground">
                              {discount.description.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {discountService.getDiscountTypeLabel(discount.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {discountService.formatDiscountValue(discount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={discountService.getStatusColor(discount.status!)}>
                          {discount.status}
                        </Badge>
                        {discount.approvalStatus && discount.approvalStatus !== 'approved' && (
                          <Badge className={`ml-1 ${discountService.getApprovalStatusColor(discount.approvalStatus)}`}>
                            {discount.approvalStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{discount.analytics.totalUses} uses</div>
                          <div className="text-muted-foreground">
                            {discountService.calculateUsageRate(discount)}% used
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {discountService.formatDate(discount.createdAt!)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(discount)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleEdit(discount)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDiscountToDelete(discount._id!);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{" "}
                    {pagination.totalItems} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      const page = Math.max(
                        1,
                        Math.min(
                          pagination.currentPage - 2 + i,
                          pagination.totalPages - 4 + i
                        )
                      );
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
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

      {/* Discount Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
            </DialogTitle>
            <DialogDescription>
              {editingDiscount 
                ? 'Update the discount details below' 
                : 'Fill in the details to create a new discount code'
              }
            </DialogDescription>
          </DialogHeader>
          <DiscountForm
            discount={editingDiscount}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the discount code
              and all associated usage data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => discountToDelete && handleDelete(discountToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDiscounts.length} discount(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected
              discount codes and all associated usage data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Analytics Detail (if needed) */}
      {canViewAnalytics && analytics && (
        <DiscountAnalyticsCard analytics={analytics} />
      )}
    </div>
  );
}