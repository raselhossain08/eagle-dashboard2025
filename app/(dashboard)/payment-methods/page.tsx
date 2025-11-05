import { PaymentMethodManagement } from '@/components/dashboard/payments/payment-method-management';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Methods | Eagle Dashboard',
  description: 'Manage secure payment methods with PSP tokenization',
};

export default function PaymentMethodsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PaymentMethodManagement />
    </div>
  );
}