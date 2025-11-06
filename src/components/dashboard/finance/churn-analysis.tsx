'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface ChurnAnalysisProps {
    data: any;
}

export function ChurnAnalysis({ data }: ChurnAnalysisProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Churn Analysis</CardTitle>
                <CardDescription>Customer retention and churn metrics</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Churn Rate</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">{data?.churnRate || '0'}%</p>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Retention Rate</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">{data?.retentionRate || '0'}%</p>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Churn Analysis Chart
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
