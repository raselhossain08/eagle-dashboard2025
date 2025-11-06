// app/dashboard/transactions/page.tsx
import { TransactionDashboard } from '@/components/dashboard/transactions/TransactionDashboard';

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-6">
      <TransactionDashboard />
    </div>
  );
}