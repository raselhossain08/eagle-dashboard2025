// components/transactions/TransactionFilters.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, X, CalendarIcon, DollarSign, Search } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface TransactionFiltersProps {
    filters: {
        status: string;
        type: string;
        startDate: string;
        endDate: string;
        minAmount?: string;
        maxAmount?: string;
        provider?: string;
        customer?: string;
    };
    onFilterChange: (filters: any) => void;
}

export function TransactionFilters({ filters, onFilterChange }: TransactionFiltersProps) {
    const [date, setDate] = useState<DateRange | undefined>();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'succeeded', label: 'Succeeded' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'partially_refunded', label: 'Partially Refunded' },
        { value: 'disputed', label: 'Disputed' },
    ];

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'charge', label: 'Charge' },
        { value: 'refund', label: 'Refund' },
        { value: 'payout', label: 'Payout' },
    ];

    const providerOptions = [
        { value: 'all', label: 'All Providers' },
        { value: 'stripe', label: 'Stripe' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'razorpay', label: 'Razorpay' },
        { value: 'paddle', label: 'Paddle' },
    ];

    const datePresets = [
        { label: 'Today', value: () => ({ from: new Date(), to: new Date() }) },
        { label: 'Last 7 days', value: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
        { label: 'Last 30 days', value: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
        { label: 'This month', value: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    ];

    const handleStatusChange = (status: string) => {
        // Convert 'all' to empty string for the API
        onFilterChange({ ...filters, status: status === 'all' ? '' : status });
    };

    const handleTypeChange = (type: string) => {
        // Convert 'all' to empty string for the API
        onFilterChange({ ...filters, type: type === 'all' ? '' : type });
    };

    const handleDateChange = (range: DateRange | undefined) => {
        setDate(range);
        onFilterChange({
            ...filters,
            startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
            endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
        });
    };

    const handleProviderChange = (provider: string) => {
        onFilterChange({ ...filters, provider: provider === 'all' ? '' : provider });
    };

    const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    const handleCustomerSearch = (value: string) => {
        onFilterChange({ ...filters, customer: value });
    };

    const applyDatePreset = (preset: any) => {
        const range = preset.value();
        setDate(range);
        handleDateChange(range);
    };

    const clearFilters = () => {
        setDate(undefined);
        onFilterChange({
            status: '',
            type: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
            provider: '',
            customer: '',
        });
    };

    const hasActiveFilters = filters.status || filters.type || filters.startDate || filters.endDate ||
        filters.minAmount || filters.maxAmount || filters.provider || filters.customer;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                    </Button>
                )}

                <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {typeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.provider || 'all'} onValueChange={handleProviderChange}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                        {providerOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-64 justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, 'MMM dd')} - {format(date.to, 'MMM dd, yyyy')}
                                    </>
                                ) : (
                                    format(date.from, 'MMM dd, yyyy')
                                )
                            ) : (
                                <span>Date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3 border-b">
                            <div className="flex flex-wrap gap-2">
                                {datePresets.map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => applyDatePreset(preset)}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateChange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <Filter className="h-4 w-4 mr-1" />
                    {showAdvanced ? 'Hide' : 'More'} Filters
                </Button>
            </div>

            {showAdvanced && (
                <div className="flex items-end gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="customer-search" className="text-xs">Customer Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="customer-search"
                                placeholder="Email or name..."
                                value={filters.customer || ''}
                                onChange={(e) => handleCustomerSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="w-32 space-y-2">
                        <Label htmlFor="min-amount" className="text-xs">Min Amount</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="min-amount"
                                type="number"
                                placeholder="0"
                                value={filters.minAmount || ''}
                                onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="w-32 space-y-2">
                        <Label htmlFor="max-amount" className="text-xs">Max Amount</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="max-amount"
                                type="number"
                                placeholder="Any"
                                value={filters.maxAmount || ''}
                                onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
