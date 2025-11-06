import { Metadata } from 'next';
import { InvoiceDetailView } from '@/components/dashboard/invoices/InvoiceDetailView';

interface InvoiceDetailPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: InvoiceDetailPageProps): Promise<Metadata> {
    return {
        title: `Invoice ${params.id} - Eagle Platform`,
        description: `View and manage invoice ${params.id}`,
    };
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
    return (
        <div className="container mx-auto py-6">
            <InvoiceDetailView invoiceId={params.id} />
        </div>
    );
}