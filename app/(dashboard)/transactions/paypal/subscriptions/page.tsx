// app/dashboard/subscriptions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { paypalService } from '@/lib/services/paypal.service';
import { Subscription } from '@/lib/types/paypal';
import { CancelSubscriptionDialog } from '@/components/dashboard/transactions/subscriptions/cancel-subscription-dialog';
import { Search, Filter, User, MoreVertical } from 'lucide-react';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    // Filters
    const [status, setStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSubscriptions();
    }, [status]);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await paypalService.getSubscriptions({
                page: 1,
                limit: 20,
                status: status === 'all' ? undefined : status,
                searchTerm: searchTerm || undefined,
            });
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Failed to load subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setIsCancelDialogOpen(true);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'cancelled':
                return 'destructive';
            case 'suspended':
                return 'secondary';
            default:
                return 'default';
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by contract number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && loadSubscriptions()}
                            />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadSubscriptions}>
                            <Filter className="mr-2 h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Subscriptions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Subscriptions</CardTitle>
                    <CardDescription>
                        Manage PayPal subscriptions and recurring payments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contract Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions.map((subscription) => (
                                <TableRow key={subscription._id}>
                                    <TableCell className="font-medium">
                                        {subscription.contractNumber}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {subscription.userId.firstName} {subscription.userId.lastName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {subscription.userId.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {subscription.productType}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {subscription.subscriptionType}
                                    </TableCell>
                                    <TableCell>
                                        ${subscription.amount}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(subscription.status)}>
                                            {subscription.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(subscription.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {subscription.status === 'active' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancelSubscription(subscription)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CancelSubscriptionDialog
                subscription={selectedSubscription}
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                onSubscriptionCancelled={loadSubscriptions}
            />
        </div>
    );
}