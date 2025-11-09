import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { customerService } from '@/services/customerService';
import { CustomerDetailsDialog } from './customer-details-dialog';
import { User, Mail, ShoppingBag, Calendar, MoreHorizontal, MapPin } from 'lucide-react';

interface CustomerTableProps {
    customers: Customer[];
    loading: boolean;
}

export function CustomerTable({ customers, loading }: CustomerTableProps) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleViewDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDetailsOpen(true);
    };

    if (loading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Last Order</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell colSpan={7}>
                                    <div className="h-8 bg-muted animate-pulse rounded" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Last Order</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => {
                            const status = customerService.getCustomerStatus(customer);
                            const hasCompleteProfile = customerService.hasCompleteProfile(customer);

                            return (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {customer.display_name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium truncate max-w-[150px]">
                                                        {customer.display_name}
                                                    </div>
                                                    {!hasCompleteProfile && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Incomplete
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate max-w-[180px]">{customer.email}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    @{customer.username}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant}>
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{customer.order_count}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {customerService.formatCurrency(customer.total_spent)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {customerService.formatDate(customer.last_order_date)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {customerService.formatDate(customer.registered_date)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(customer)}
                                            >
                                                View
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <CustomerDetailsDialog
                customer={selectedCustomer}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </>
    );
}