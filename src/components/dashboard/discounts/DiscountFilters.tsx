// components/discounts/DiscountFilters.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface DiscountFiltersProps {
    filters: {
        search: string;
        status: string;
        type: string;
    };
    onFilterChange: (filters: any) => void;
}

export function DiscountFilters({ filters, onFilterChange }: DiscountFiltersProps) {
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
        { value: 'disabled', label: 'Disabled' },
    ];

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed', label: 'Fixed Amount' },
    ];

    const handleFilterChange = (key: string, value: string) => {
        // Convert 'all' back to empty string for the API
        const actualValue = value === 'all' ? '' : value;
        onFilterChange({ ...filters, [key]: actualValue });
    };

    const clearFilters = () => {
        onFilterChange({
            search: '',
            status: '',
            type: '',
        });
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'search') return value !== '';
        return value !== '';
    });

    // Convert empty strings to 'all' for display in Select
    const displayStatus = filters.status === '' ? 'all' : filters.status;
    const displayType = filters.type === '' ? 'all' : filters.type;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}

            <Select value={displayStatus} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-32">
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

            <Select value={displayType} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-36">
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
        </div>
    );
}