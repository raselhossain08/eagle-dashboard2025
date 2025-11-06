// components/payment-processors.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { paymentService, PaymentProcessor } from '@/lib/services/payment.service';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PaymentProcessors() {
    const [processors, setProcessors] = useState<PaymentProcessor[]>([]);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState<string | null>(null);

    useEffect(() => {
        fetchProcessors();
    }, []);

    const fetchProcessors = async () => {
        try {
            const response = await paymentService.getPaymentProcessors();
            setProcessors(response.data);
        } catch (error) {
            console.error('Failed to fetch payment processors:', error);
            toast.error('Failed to load payment processors');
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async (provider: string) => {
        setTesting(provider);
        try {
            const result = await paymentService.testPaymentProcessor(provider);
            toast.success(`${provider} test successful (${result.responseTime}ms)`);
            fetchProcessors();
        } catch (error) {
            toast.error(`${provider} test failed`);
        } finally {
            setTesting(null);
        }
    };

    const getHealthIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'degraded':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'unhealthy':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getHealthBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return <Badge variant="default">Healthy</Badge>;
            case 'degraded':
                return <Badge variant="secondary">Degraded</Badge>;
            case 'unhealthy':
                return <Badge variant="destructive">Unhealthy</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (loading) return <div>Loading payment processors...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Processors</CardTitle>
                <CardDescription>
                    Monitor and test payment processor configurations
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Provider</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Health</TableHead>
                            <TableHead>Environment</TableHead>
                            <TableHead>Last Check</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No payment processors configured
                                </TableCell>
                            </TableRow>
                        ) : (
                            processors.map((processor) => (
                                <TableRow key={processor.provider}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {getHealthIcon(processor.healthStatus)}
                                            <span className="font-medium capitalize">
                                                {processor.provider}
                                            </span>
                                            {processor.isPrimary && (
                                                <Badge variant="outline">Primary</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={processor.isEnabled ? 'default' : 'secondary'}>
                                            {processor.isEnabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getHealthBadge(processor.healthStatus)}
                                        {processor.responseTime && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {processor.responseTime}ms avg
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {processor.environment}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(processor.lastHealthCheck).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleTest(processor.provider)}
                                            disabled={testing === processor.provider || !processor.isEnabled}
                                        >
                                            <RefreshCw
                                                className={`h-4 w-4 mr-2 ${testing === processor.provider ? 'animate-spin' : ''
                                                    }`}
                                            />
                                            {testing === processor.provider ? 'Testing...' : 'Test'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
