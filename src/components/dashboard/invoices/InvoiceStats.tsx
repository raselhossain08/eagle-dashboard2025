'use client';

import { Invoice } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface InvoiceStatsProps {
    data?: Invoice[];
}

export function InvoiceStats({ data = [] }: InvoiceStatsProps) {
    const stats = {
        total: data.length,
        paid: data.filter(invoice => invoice.status === 'paid').length,
        pending: data.filter(invoice => invoice.status === 'pending').length,
        overdue: data.filter(invoice => invoice.status === 'overdue').length,
        totalRevenue: data
            .filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + invoice.total, 0),
        pendingRevenue: data
            .filter(invoice => invoice.status === 'pending')
            .reduce((sum, invoice) => sum + invoice.total, 0),
    };

    const statCards = [
        {
            title: 'Total Invoices',
            value: stats.total,
            icon: FileText,
            description: 'All invoices',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Paid',
            value: stats.paid,
            icon: CheckCircle,
            description: 'Completed payments',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: Clock,
            description: 'Awaiting payment',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'Overdue',
            value: stats.overdue,
            icon: XCircle,
            description: 'Past due date',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            title: 'Revenue',
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            description: 'Total collected',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Pending Revenue',
            value: `$${stats.pendingRevenue.toFixed(2)}`,
            icon: Clock,
            description: 'Outstanding amount',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}