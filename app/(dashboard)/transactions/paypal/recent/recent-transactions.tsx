import { Badge } from '@/components/ui/badge';

interface RecentTransaction {
    _id: string;
    amount: number;
    status: string;
    transactionId: string;
    userId: {
        email: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

interface RecentTransactionsProps {
    transactions: RecentTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <div className="space-y-4">
            {transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {transaction.userId.firstName} {transaction.userId.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {transaction.userId.email}
                        </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                        <div className="font-medium">${transaction.amount}</div>
                        <Badge
                            variant={getStatusVariant(transaction.status)}
                            className="text-xs mt-1"
                        >
                            {transaction.status}
                        </Badge>
                    </div>
                </div>
            ))}
        </div>
    );
}