import { Metadata } from 'next';
import { InvoiceDashboard } from '@/components/dashboard/invoices/InvoiceDashboard';

export const metadata: Metadata = {
  title: 'Invoice Management - Eagle Platform',
  description: 'Manage customer invoices, process payments, and handle refunds',
  keywords: ['invoices', 'billing', 'payments', 'customers', 'financial'],
};

export default function InvoicesPage() {
  return (
    <div className="container mx-auto py-6">
      <InvoiceDashboard />
    </div>
  );
}