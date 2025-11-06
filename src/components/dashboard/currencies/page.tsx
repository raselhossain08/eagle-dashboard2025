'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { billingService } from '@/lib/services/billing.service';
import { Currency } from '@/lib/types/billing';

export default function CurrenciesPage() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCurrencies();
    }, []);

    const loadCurrencies = async () => {
        try {
            setLoading(true);
            const response = await billingService.getCurrencies();
            setCurrencies(response.data || []);
        } catch (error) {
            console.error('Failed to load currencies:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Currencies</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Supported Currencies</CardTitle>
                    <CardDescription>
                        All currencies supported by the billing system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Decimal Places</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currencies.map((currency) => (
                                <TableRow key={currency.code}>
                                    <TableCell className="font-mono font-medium">
                                        {currency.code}
                                    </TableCell>
                                    <TableCell>{currency.name}</TableCell>
                                    <TableCell className="text-lg">{currency.symbol}</TableCell>
                                    <TableCell>2</TableCell>
                                    <TableCell>
                                        <Badge variant="default">{currency.enabled ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}