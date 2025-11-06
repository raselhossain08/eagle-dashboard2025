// components/transactions/TransactionFilters.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface TransactionFiltersProps {
    filters: {
        status: string;
        type: string;
        startDate: string;
        endDate: string;
    };
    onFilterChange: (filters: any) => void;
}

export function TransactionFilters({ filters, onFilterChange }: TransactionFiltersProps) {
    const [date, setDate] = useState<DateRange | undefined>();

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'succeeded', label: 'Succeeded' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
    ];

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'charge', label: 'Charge' },
        { value: 'refund', label: 'Refund' },
        { value: 'payout', label: 'Payout' },
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

    const clearFilters = () => {
        setDate(undefined);
        onFilterChange({
            status: '',
            type: '',
            startDate: '',
            endDate: '',
        });
    };

    const hasActiveFilters = filters.status || filters.type || filters.startDate || filters.endDate;

    return (
        <div className="flex items-center gap-2">
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}

            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
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

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-48 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
        </div>
    );
}
