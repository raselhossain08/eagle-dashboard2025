// components/discounts/DiscountDetailsDialog.tsx
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Discount } from '@/lib/services/discount.service';
import { Calendar, Tag, Users, Target, BarChart3 } from 'lucide-react';

interface DiscountDetailsDialogProps {
    discount: Discount | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DiscountDetailsDialog({ discount, open, onOpenChange }: DiscountDetailsDialogProps) {
    if (!discount) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusVariant = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            active: 'default',
            expired: 'destructive',
            disabled: 'outline',
        };
        return variants[status] || 'secondary';
    };

    const getUsagePercentage = () => {
        if (!discount.usageLimit?.total || discount.usageLimit.total === 0) return 0;
        return ((discount.usageLimit.used || 0) / discount.usageLimit.total) * 100;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Discount Details</DialogTitle>
                    <DialogDescription>
                        Complete information for discount code {discount.code}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[80vh]">
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Code:</span>
                                    <p className="text-muted-foreground font-mono">{discount.code}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Name:</span>
                                    <p className="text-muted-foreground">{discount.name}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Type:</span>
                                    <Badge variant="outline" className="mt-1 capitalize">
                                        {discount.type}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="font-medium">Value:</span>
                                    <p className="text-muted-foreground font-medium">
                                        {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                                    </p>
                                </div>
                                {discount.description && (
                                    <div className="col-span-2">
                                        <span className="font-medium">Description:</span>
                                        <p className="text-muted-foreground">{discount.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Validity Period */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Validity Period</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Start Date:
                                    </span>
                                    <p className="text-muted-foreground">{formatDate(discount.startDate)}</p>
                                </div>
                                <div>
                                    <span className="font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        End Date:
                                    </span>
                                    <p className="text-muted-foreground">{formatDate(discount.endDate)}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium">Status:</span>
                                    <div className="mt-1">
                                        <Badge variant={getStatusVariant(discount.status)}>
                                            {discount.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Limits */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Usage Limits</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Total Usage:
                                    </span>
                                    <p className="text-muted-foreground">
                                        {discount.usageLimit?.used || 0} / {discount.usageLimit?.total || '∞'}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Per Customer:
                                    </span>
                                    <p className="text-muted-foreground">
                                        {discount.usageLimit?.perCustomer || 1} time(s)
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4" />
                                        Usage Progress:
                                    </span>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>{getUsagePercentage().toFixed(1)}% used</span>
                                            <span>{discount.usageLimit?.used || 0} of {discount.usageLimit?.total || '∞'}</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applicable To */}
                        {discount.applicableTo && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Applicable To</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {discount.applicableTo.plans && discount.applicableTo.plans.length > 0 && (
                                        <div>
                                            <span className="font-medium">Plans:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {discount.applicableTo.plans.map((plan: any, index: number) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {plan}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {discount.applicableTo.billingCycles && discount.applicableTo.billingCycles.length > 0 && (
                                        <div>
                                            <span className="font-medium">Billing Cycles:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {discount.applicableTo.billingCycles.map((cycle: any, index: number) => (
                                                    <Badge key={index} variant="outline" className="text-xs capitalize">
                                                        {cycle}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Usage History */}
                        {discount.usageHistory && discount.usageHistory.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Recent Usage History</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {discount.usageHistory.slice(0, 5).map((usage: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded text-sm">
                                            <div>
                                                <span className="font-medium">User: {usage.userId.slice(-8)}</span>
                                                <div className="text-muted-foreground">
                                                    Order: ${usage.orderAmount} • Discount: ${usage.discountAmount}
                                                </div>
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {new Date(usage.usedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}