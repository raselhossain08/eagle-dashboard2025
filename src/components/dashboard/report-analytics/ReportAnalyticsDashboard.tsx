// components/analytics/analytics-dashboard.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, TrendingUp, Zap, Search, Plug, Upload } from 'lucide-react';
import { OverviewDashboard } from './overview-dashboard';
import { FunnelDashboard } from './funnel-dashboard';
import { RealTimeDashboard } from './real-time-dashboard';
import { GrowthDashboard } from './growth-dashboard';
import { EventsDashboard } from './events-dashboard';
import { IntegrationsDashboard } from './integrations-dashboard';
import { ExportDashboard } from './export-dashboard';

const tabs = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'funnel', label: 'Funnel', icon: Target },
    { value: 'growth', label: 'Growth', icon: TrendingUp },
    { value: 'realtime', label: 'Real-time', icon: Zap },
    { value: 'events', label: 'Events', icon: Search },
    { value: 'integrations', label: 'Integrations', icon: Plug },
    { value: 'export', label: 'Export', icon: Upload },
];

export function ReportAnalyticsDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="min-h-screen ">
            <div className="flex-1 space-y-4  pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <OverviewDashboard />
                    </TabsContent>

                    <TabsContent value="funnel" className="space-y-4">
                        <FunnelDashboard />
                    </TabsContent>

                    <TabsContent value="growth" className="space-y-4">
                        <GrowthDashboard />
                    </TabsContent>

                    <TabsContent value="realtime" className="space-y-4">
                        <RealTimeDashboard />
                    </TabsContent>

                    <TabsContent value="events" className="space-y-4">
                        <EventsDashboard />
                    </TabsContent>

                    <TabsContent value="integrations" className="space-y-4">
                        <IntegrationsDashboard />
                    </TabsContent>

                    <TabsContent value="export" className="space-y-4">
                        <ExportDashboard />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}