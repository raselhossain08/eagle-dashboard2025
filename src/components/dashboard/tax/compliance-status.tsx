// components/tax/compliance-status.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export function ComplianceStatus() {
    const { compliance, loading, error } = useTaxCompliance();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLIANT':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'PENDING':
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'OVERDUE':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLIANT':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'OVERDUE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading compliance status...</div>;
    if (error) return <div>Error loading compliance status: {error}</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>
                    Tax filing compliance across jurisdictions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {compliance.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                {getStatusIcon(item.status)}
                                <div>
                                    <div className="font-medium">
                                        {item.country} - {item.state}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {item.filingFrequency.toLowerCase()} filing
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <Badge variant="secondary" className={getStatusColor(item.status)}>
                                    {item.status.toLowerCase()}
                                </Badge>
                                <div className="text-sm text-gray-500 mt-1">
                                    Due: {new Date(item.nextDue).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}

                    {compliance.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No compliance data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}