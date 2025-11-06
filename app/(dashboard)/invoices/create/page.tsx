import { Metadata } from 'next';
import { CreateInvoiceForm } from '@/components/dashboard/invoices/CreateInvoiceForm';

export const metadata: Metadata = {
    title: 'Create Invoice - Eagle Platform',
    description: 'Create a new invoice for your customer',
};

export default function CreateInvoicePage() {
    return (
        <div className="container mx-auto py-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Create New Invoice</h1>
                    <p className="text-muted-foreground">
                        Create and send a new invoice to your customer
                    </p>
                </div>
                <CreateInvoiceForm />
            </div>
        </div>
    );
}