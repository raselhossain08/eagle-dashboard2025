// components/analytics/funnel-dashboard.tsx
'use client';

import { useFunnel } from '@/lib/hooks/useReportAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function FunnelDashboard() {
    const { data, loading, error } = useFunnel();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Conversion Funnel</h2>
                <div className="text-sm text-muted-foreground">
                    Overall Conversion Rate: {data.funnel.overallConversionRate}%
                </div>
            </div>

            {/* Funnel Steps */}
            <Card>
                <CardHeader>
                    <CardTitle>{data.funnel.name}</CardTitle>
                    <CardDescription>
                        {data.funnel.totalEntered.toLocaleString()} entered • {data.funnel.totalCompleted.toLocaleString()} completed
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {data.funnel.steps.map((step: any) => (
                            <div key={step.step} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{step.name}</h4>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{step.count.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">{step.percentage}%</div>
                                    </div>
                                </div>

                                <Progress value={step.percentage} className="h-2" />

                                {step.step < data.funnel.steps.length && (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>
                                            Drop-off: {step.dropOff.toLocaleString()} ({step.dropOffRate}%)
                                        </span>
                                        <span>
                                            To next: {step.conversionFromPrevious}% • Avg: {step.avgTimeToNext}s
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Biggest Drop-off */}
            {data.funnel.biggestDropOff && (
                <Card>
                    <CardHeader>
                        <CardTitle>Biggest Drop-off Point</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{data.funnel.biggestDropOff.step}</span>
                                <span className="text-red-600">
                                    {data.funnel.biggestDropOff.dropOffRate}% drop-off
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {data.funnel.biggestDropOff.dropOffCount.toLocaleString()} users dropped off here
                            </p>
                            <div>
                                <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                                <ul className="text-sm space-y-1 list-disc list-inside">
                                    {data.funnel.biggestDropOff.recommendations.map((rec: string, index: number) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Time Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold">{Math.round(data.timeAnalysis.avgTimeToConvert / 60)}m</div>
                            <div className="text-sm text-muted-foreground">Avg Time</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{Math.round(data.timeAnalysis.medianTimeToConvert / 60)}m</div>
                            <div className="text-sm text-muted-foreground">Median Time</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{Math.round(data.timeAnalysis.fastestConversion / 60)}m</div>
                            <div className="text-sm text-muted-foreground">Fastest</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}