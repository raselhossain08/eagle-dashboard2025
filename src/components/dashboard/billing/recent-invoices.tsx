import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { billingService } from '@/lib/services/billing.service';
import { Invoice } from '@/lib/types/billing';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye, Mail, Download } from 'lucide-react';

export function RecentInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const response = await billingService.getInvoices({
                page: 1,
                limit: 5,
            });
            setInvoices(response.data || []);
        } catch (error) {
            console.error('Failed to load invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'default';
            case 'OPEN':
                return 'secondary';
            case 'OVERDUE':
                return 'destructive';
            case 'VOID':
                return 'outline';
            default:
                return 'default';
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading invoices...</div>;
    }

    return (
        <div className="space-y-4">
            {invoices.map((invoice) => (
                <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                                {invoice.invoiceNumber}
                            </p>
                            <Badge variant={getStatusVariant(invoice.status)}>
                                {invoice.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {typeof invoice.customerId === 'string'
                                ? invoice.customerName
                                : `${invoice.customerId.firstName} ${invoice.customerId.lastName}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Due {formatDate(invoice.dueDate)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <div className="font-medium">{formatCurrency(invoice.total)}</div>
                            <div className="text-sm text-muted-foreground">
                                {formatCurrency(invoice.taxAmount)} tax
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}