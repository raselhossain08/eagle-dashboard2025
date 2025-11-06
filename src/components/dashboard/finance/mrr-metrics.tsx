import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { MRRData } from '@/types/finance';

interface MRRMetricsProps {
    data: MRRData;
}

export function MRRMetrics({ data }: MRRMetricsProps) {
    const { current, byType, growth, historical } = data;

    const mrrBreakdown = Object.entries(byType).map(([name, stats]) => ({
        name,
        mrr: stats.mrr,
        subscribers: stats.subscribers,
        arpu: stats.arpu,
    }));

    return (
        <div className="space-y-6">
            {/* Current MRR Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly MRR</p>
                                <p className="text-2xl font-bold">${current.mrr.toLocaleString()}</p>
                            </div>
                            <div className={`p-2 rounded-full ${growth.mrrGrowth >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <Badge variant={growth.mrrGrowth >= 0 ? 'default' : 'destructive'}>
                                {growth.mrrGrowth >= 0 ? '+' : ''}{growth.mrrGrowth}%
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-2">growth</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Annual ARR</p>
                            <p className="text-2xl font-bold">${current.arr.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Projected annual revenue
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
                            <p className="text-2xl font-bold">{current.subscribers.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Active subscriptions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">ARPU</p>
                            <p className="text-2xl font-bold">${current.averageRevenuePerUser.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Average revenue per user
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* MRR Growth Components */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm font-medium text-green-600">New MRR</p>
                        <p className="text-lg font-bold">+${growth.newMRR.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm font-medium text-green-600">Expansion</p>
                        <p className="text-lg font-bold">+${growth.expansionMRR.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm font-medium text-red-600">Contraction</p>
                        <p className="text-lg font-bold">-${Math.abs(growth.contractionMRR).toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm font-medium text-red-600">Churned</p>
                        <p className="text-lg font-bold">-${Math.abs(growth.churnedMRR).toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm font-medium text-blue-600">Net New</p>
                        <p className="text-lg font-bold">+${growth.netNewMRR.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Historical MRR Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>MRR Trend</CardTitle>
                        <CardDescription>12-month MRR history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={historical}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'MRR']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="mrr"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                    dot={{ fill: '#0088FE' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* MRR by Subscription Type */}
                <Card>
                    <CardHeader>
                        <CardTitle>MRR by Plan</CardTitle>
                        <CardDescription>Distribution across subscription types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mrrBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'MRR']}
                                />
                                <Bar dataKey="mrr" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}