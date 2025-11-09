'use client';

import { useState, useEffect } from 'react';
import { TaxRate } from '@/lib/types/tax';
import { taxService } from '@/lib/services/tax.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Percent,
  AlertCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface TaxRateFilters {
  search: string;
  country: string;
  taxType: string;
  status: string;
}

export function TaxRatesManager() {
    const [rates, setRates] = useState<TaxRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingRate, setEditingRate] = useState<TaxRate | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<TaxRateFilters>({
      search: '',
      country: '',
      taxType: '',
      status: ''
    });

    const loadMockRates = () => {
      const mockRates: TaxRate[] = [
        {
          _id: '1',
          name: 'California Sales Tax',
          description: 'Standard sales tax for California',
          country: 'United States',
          state: 'California',
          taxType: 'SALES_TAX',
          rate: 8.75,
          active: true,
          effectiveFrom: '2024-01-01',
          effectiveTo: '2024-12-31',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          name: 'Ontario GST',
          description: 'Goods and Services Tax for Ontario',
          country: 'Canada',
          state: 'Ontario',
          taxType: 'GST',
          rate: 13.0,
          active: true,
          effectiveFrom: '2024-01-01',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '3',
          name: 'UK VAT Standard Rate',
          description: 'Standard VAT rate for United Kingdom',
          country: 'United Kingdom',
          state: 'UK',
          taxType: 'VAT',
          rate: 20.0,
          active: true,
          effectiveFrom: '2024-01-01',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '4',
          name: 'Texas Sales Tax',
          description: 'Sales tax for Texas state',
          country: 'United States',
          state: 'Texas',
          taxType: 'SALES_TAX',
          rate: 6.25,
          active: false,
          effectiveFrom: '2023-01-01',
          effectiveTo: '2023-12-31',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      setRates(mockRates);
    };

    const loadRates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await taxService.getTaxRates({
              search: filters.search || undefined,
              country: filters.country || undefined,
              taxType: filters.taxType || undefined,
              active: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined
            });
            setRates(response.data || []);
        } catch (error) {
            console.error('Failed to load tax rates:', error);
            setError('Failed to load tax rates');
            // Load mock data as fallback
            loadMockRates();
        } finally {
            setLoading(false);
        }
    };

    // Load rates on component mount
    useEffect(() => {
        loadRates();
    }, []);

    // Reload when filters change
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (filters.search || filters.country || filters.taxType || filters.status) {
          loadRates();
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleRefresh = async () => {
      setRefreshing(true);
      await loadRates();
      setRefreshing(false);
      toast.success('Tax rates refreshed');
    };

    const handleEdit = (rate: TaxRate) => {
      setEditingRate(rate);
      setEditDialogOpen(true);
    };

    const handleUpdateRate = async (id: string, data: Partial<TaxRate>) => {
        try {
            await taxService.updateTaxRate(id, data);
            toast.success('Tax rate updated successfully');
            await loadRates();
            setEditDialogOpen(false);
            setEditingRate(null);
        } catch (error) {
            console.error('Failed to update tax rate:', error);
            toast.error('Failed to update tax rate');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this tax rate? This action cannot be undone.')) {
          return;
        }

        try {
            await taxService.deleteTaxRate(id);
            toast.success('Tax rate deleted successfully');
            await loadRates();
        } catch (error) {
            console.error('Failed to delete tax rate:', error);
            toast.error('Failed to delete tax rate');
        }
    };

    const handleToggleActive = async (id: string, active: boolean) => {
      try {
        await taxService.updateTaxRate(id, { active });
        toast.success(`Tax rate ${active ? 'activated' : 'deactivated'} successfully`);
        await loadRates();
      } catch (error) {
        console.error('Failed to toggle tax rate status:', error);
        toast.error('Failed to update tax rate status');
      }
    };

    const handleExport = () => {
      const csvContent = [
        ['Name', 'Country', 'State', 'Tax Type', 'Rate', 'Status', 'Effective From', 'Effective To'].join(','),
        ...rates.map(rate => [
          `"${rate.name}"`,
          `"${rate.country}"`,
          `"${rate.state}"`,
          rate.taxType,
          rate.rate,
          rate.active ? 'Active' : 'Inactive',
          rate.effectiveFrom || '',
          rate.effectiveTo || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-rates-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Tax rates exported successfully');
    };

    const getStatusBadge = (active: boolean) => {
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    };

    const getTaxTypeBadge = (taxType: string) => {
      const colors = {
        'SALES_TAX': 'bg-blue-100 text-blue-800',
        'VAT': 'bg-green-100 text-green-800',
        'GST': 'bg-purple-100 text-purple-800',
        'WITHHOLDING': 'bg-red-100 text-red-800',
        'EXCISE': 'bg-yellow-100 text-yellow-800',
        'OTHER': 'bg-gray-100 text-gray-800'
      };

      return (
        <Badge 
          variant="outline" 
          className={colors[taxType as keyof typeof colors] || colors.OTHER}
        >
          {taxType.replace('_', ' ')}
        </Badge>
      );
    };

    const filteredRates = rates.filter(rate => {
      const matchesSearch = !filters.search || 
        rate.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        rate.country.toLowerCase().includes(filters.search.toLowerCase()) ||
        rate.state.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCountry = !filters.country || rate.country === filters.country;
      const matchesTaxType = !filters.taxType || rate.taxType === filters.taxType;
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && rate.active) ||
        (filters.status === 'inactive' && !rate.active);

      return matchesSearch && matchesCountry && matchesTaxType && matchesStatus;
    });

    const countries = [...new Set(rates.map(rate => rate.country))];
    const taxTypes = [...new Set(rates.map(rate => rate.taxType))];

    if (loading && rates.length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading tax rates...</span>
          </div>
        </div>
      );
    }

    return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tax Rates Manager</h2>
              <p className="text-muted-foreground">
                Manage tax rates for different jurisdictions and tax types
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tax Rate
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button variant="link" onClick={loadRates} className="ml-2 h-auto p-0">
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tax rates..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select 
                    value={filters.country} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Type</label>
                  <Select 
                    value={filters.taxType} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, taxType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {taxTypes.map(type => (
                        <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Rates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Rates ({filteredRates.length})</CardTitle>
              <CardDescription>
                Manage and configure tax rates for different jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Country/State</TableHead>
                    <TableHead>Tax Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Effective Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && rates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading tax rates...
                      </TableCell>
                    </TableRow>
                  ) : filteredRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No tax rates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRates.map((rate) => (
                      <TableRow key={rate._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rate.name}</p>
                            {rate.description && (
                              <p className="text-sm text-muted-foreground">{rate.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rate.country}</p>
                            <p className="text-sm text-muted-foreground">{rate.state}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTaxTypeBadge(rate.taxType)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {rate.rate}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rate.active}
                              onCheckedChange={(checked) => handleToggleActive(rate._id, checked)}
                            />
                            {getStatusBadge(rate.active)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              From: {rate.effectiveFrom ? formatDate(rate.effectiveFrom) : 'N/A'}
                            </p>
                            {rate.effectiveTo && (
                              <p className="text-sm text-muted-foreground">
                                To: {formatDate(rate.effectiveTo)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(rate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rate._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
    );
}