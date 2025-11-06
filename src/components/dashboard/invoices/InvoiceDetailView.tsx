'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Mail, RefreshCw } from 'lucide-react';
import { ViewInvoiceDialog } from './ViewInvoiceDialog';
import { RefundDialog } from './RefundDialog';
import { SendEmailDialog } from './SendEmailDialog';
import { toast } from 'sonner';

interface InvoiceDetailViewProps {
    invoiceId: string;
}

export function InvoiceDetailView({ invoiceId }: InvoiceDetailViewProps) {
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    useEffect(() => {
        fetchInvoice();
    }, [invoiceId]);

    const fetchInvoice = async () => {
        try {
            setIsLoading(true);
            // TODO: Replace with actual API call
            const response = await fetch(`/api/invoices/${invoiceId}`);
            if (!response.ok) throw new Error('Failed to fetch invoice');
            const data = await response.json();
            setInvoice(data.invoice);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('Failed to load invoice');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        toast.info('PDF download coming soon');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">Invoice not found</p>
                        <Button onClick={() => router.push('/invoices')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Invoices
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/invoices')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Invoices
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => setEmailDialogOpen(true)}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                    </Button>
                    {(invoice.status === 'paid' || invoice.status === 'partially_refunded') && (
                        <Button variant="destructive" onClick={() => setRefundDialogOpen(true)}>
                            Process Refund
                        </Button>
                    )}
                </div>
            </div>

            <ViewInvoiceDialog
                invoice={invoice}
                open={true}
                onOpenChange={(open) => !open && router.push('/invoices')}
            />

            <RefundDialog
                invoice={invoice}
                open={refundDialogOpen}
                onOpenChange={setRefundDialogOpen}
            />

            <SendEmailDialog
                invoice={invoice}
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
            />
        </div>
    );
}
