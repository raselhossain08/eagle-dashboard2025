// app/orders/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ordersService, type Order, type OrdersResponse } from '@/lib/api/ordersService';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
    });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersService.getOrders();
            setOrders(response.data.orders);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = !filters.status || order.status === filters.status;
        const matchesSearch = !filters.search ||
            order.customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            order.order_number.includes(filters.search) ||
            order.customer.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            order.customer.last_name.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsAlertOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            processing: { variant: 'default' as const, label: 'Processing' },
            completed: { variant: 'secondary' as const, label: 'Completed' },
            failed: { variant: 'destructive' as const, label: 'Failed' },
            pending: { variant: 'outline' as const, label: 'Pending' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ||
            { variant: 'outline' as const, label: status };

        return (
            <Badge variant={config.variant}>
                {config.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading orders...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            Error: {error}
                        </div>
                        <div className="text-center mt-4">
                            <Button onClick={loadOrders}>Retry</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">
                        Manage and view customer orders
                    </p>
                </div>
                <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-8"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            More Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Order List</CardTitle>
                    <CardDescription>
                        {filteredOrders.length} orders found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        #{order.order_number}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {order.customer.first_name} {order.customer.last_name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {order.customer.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.date_created), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell>
                                        {order.currency} {order.total}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground">
                                            {order.payment_method_title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No orders found matching your criteria.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Alert Dialog */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="max-w-4xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Order Details - #{selectedOrder?.order_number}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                                {selectedOrder && (
                                    <>
                                        {/* Customer Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Customer Information</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div>
                                                        <strong>Name:</strong> {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
                                                    </div>
                                                    <div>
                                                        <strong>Email:</strong> {selectedOrder.customer.email}
                                                    </div>
                                                    <div>
                                                        <strong>Customer ID:</strong> {selectedOrder.customer.id}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Order Information</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div>
                                                        <strong>Status:</strong> {getStatusBadge(selectedOrder.status)}
                                                    </div>
                                                    <div>
                                                        <strong>Date Created:</strong> {format(new Date(selectedOrder.date_created), 'PPpp')}
                                                    </div>
                                                    <div>
                                                        <strong>Total:</strong> {selectedOrder.currency} {selectedOrder.total}
                                                    </div>
                                                    <div>
                                                        <strong>Payment Method:</strong> {selectedOrder.payment_method_title}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Billing & Shipping */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Billing Address</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {selectedOrder.billing_address.first_name ? (
                                                        <div className="space-y-1">
                                                            <div>{selectedOrder.billing_address.first_name} {selectedOrder.billing_address.last_name}</div>
                                                            {selectedOrder.billing_address.company && (
                                                                <div>{selectedOrder.billing_address.company}</div>
                                                            )}
                                                            <div>{selectedOrder.billing_address.address_1}</div>
                                                            {selectedOrder.billing_address.address_2 && (
                                                                <div>{selectedOrder.billing_address.address_2}</div>
                                                            )}
                                                            <div>
                                                                {selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.postcode}
                                                            </div>
                                                            <div>{selectedOrder.billing_address.country}</div>
                                                            <div>{selectedOrder.billing_address.phone}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground">No billing address provided</div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {selectedOrder.shipping_address.first_name ? (
                                                        <div className="space-y-1">
                                                            <div>{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</div>
                                                            {selectedOrder.shipping_address.company && (
                                                                <div>{selectedOrder.shipping_address.company}</div>
                                                            )}
                                                            <div>{selectedOrder.shipping_address.address_1}</div>
                                                            {selectedOrder.shipping_address.address_2 && (
                                                                <div>{selectedOrder.shipping_address.address_2}</div>
                                                            )}
                                                            <div>
                                                                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postcode}
                                                            </div>
                                                            <div>{selectedOrder.shipping_address.country}</div>
                                                            {selectedOrder.shipping_address.phone && (
                                                                <div>{selectedOrder.shipping_address.phone}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground">No shipping address provided</div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Order Items */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Order Items</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Product</TableHead>
                                                            <TableHead>Quantity</TableHead>
                                                            <TableHead>Price</TableHead>
                                                            <TableHead>Total</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedOrder.items.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell>{item.quantity}</TableCell>
                                                                <TableCell>{selectedOrder.currency} {item.price}</TableCell>
                                                                <TableCell>{selectedOrder.currency} {item.total}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button>
                                Download Invoice
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}