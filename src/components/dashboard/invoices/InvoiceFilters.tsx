'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InvoiceFiltersProps {
    onFilterChange: (filters: any) => void;
}

export function InvoiceFilters({ onFilterChange }: InvoiceFiltersProps) {
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        status: '',
        subscriber_id: '',
    });
    const [date, setDate] = useState<{ from: Date; to: Date } | undefined>();

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
        if (range?.from && range?.to) {
            setDate({ from: range.from, to: range.to });
            const newFilters = {
                ...filters,
                start_date: format(range.from, 'yyyy-MM-dd'),
                end_date: format(range.to, 'yyyy-MM-dd'),
            };
            setFilters(newFilters);
            onFilterChange(newFilters);
        } else {
            setDate(undefined);
        }
    };

    const clearFilters = () => {
        const clearedFilters = {
            start_date: '',
            end_date: '',
            status: '',
            subscriber_id: '',
        };
        setFilters(clearedFilters);
        setDate(undefined);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <Label>Filters</Label>
                </div>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                    <Label htmlFor="date-range">Date Range</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date-range"
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date?.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
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

                {/* Status Filter */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={filters.status || "all"}
                        onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                            <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Subscriber ID Filter */}
                <div className="space-y-2">
                    <Label htmlFor="subscriber_id">Subscriber ID</Label>
                    <Input
                        id="subscriber_id"
                        placeholder="Enter subscriber ID"
                        value={filters.subscriber_id}
                        onChange={(e) => handleFilterChange('subscriber_id', e.target.value)}
                    />
                </div>

                {/* Search by Invoice Number */}
                <div className="space-y-2">
                    <Label htmlFor="invoice-number">Invoice Number</Label>
                    <Input
                        id="invoice-number"
                        placeholder="Search by invoice #"
                        onChange={(e) => handleFilterChange('invoice_number', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}