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
import { Subscription } from '@/types/subscription';
import { subscriptionService } from '@/services/subscriptionService';
import { CancelSubscriptionDialog } from './cancel-subscription-dialog';
import { MoreHorizontal, User, Calendar, CreditCard } from 'lucide-react';

interface SubscriptionTableProps {
    subscriptions: Subscription[];
    onRefresh: () => void;
}

export function SubscriptionTable({ subscriptions, onRefresh }: SubscriptionTableProps) {
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const handleCancelClick = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setIsCancelDialogOpen(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedSubscription) return;

        try {
            await subscriptionService.cancelSubscription(selectedSubscription.id);
            onRefresh();
            setIsCancelDialogOpen(false);
            setSelectedSubscription(null);
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
        }
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Billing</TableHead>
                            <TableHead>Next Payment</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.map((subscription) => (
                            <TableRow key={subscription.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">
                                                {subscription.customer.first_name || subscription.customer.last_name
                                                    ? `${subscription.customer.first_name} ${subscription.customer.last_name}`.trim()
                                                    : 'No Name'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {subscription.customer.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {subscription.items[0]?.name || 'No Product'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={subscriptionService.getStatusBadgeVariant(subscription.status)}>
                                        {subscription.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {subscriptionService.formatCurrency(subscription.total, subscription.currency)}
                                </TableCell>
                                <TableCell>
                                    {subscription.billing_period === 'month' ? 'Monthly' : 'Annual'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {subscriptionService.formatDate(subscription.next_payment_date)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <span className="capitalize">
                                            {subscription.payment_method === 'ppcp' ? 'PayPal' : subscription.payment_method}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {subscription.status === 'active' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancelClick(subscription)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <CancelSubscriptionDialog
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                subscription={selectedSubscription}
                onConfirm={handleCancelConfirm}
            />
        </>
    );
}