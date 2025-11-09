import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layout, MessageSquare } from 'lucide-react';
import { ContentAnalytics } from '@/types/analytics';
import { analyticsService } from '@/services/analyticsService';

interface ContentAnalyticsCardProps {
    contentAnalytics: ContentAnalytics;
}

export function ContentAnalyticsCard({ contentAnalytics }: ContentAnalyticsCardProps) {
    const contentItems = [
        {
            label: 'Posts',
            value: contentAnalytics.total_posts,
            icon: FileText,
            color: 'text-blue-600',
        },
        {
            label: 'Pages',
            value: contentAnalytics.total_pages,
            icon: Layout,
            color: 'text-green-600',
        },
        {
            label: 'Comments',
            value: analyticsService.formatNumber(contentAnalytics.total_comments),
            icon: MessageSquare,
            color: 'text-orange-600',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Content Overview</CardTitle>
                <CardDescription>Content statistics and engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {contentItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-lg font-bold">{item.value}</span>
                    </div>
                ))}

                <div className="pt-2">
                    <div className="text-xs text-muted-foreground text-center">
                        Total content items: {parseInt(contentAnalytics.total_posts) + parseInt(contentAnalytics.total_pages)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}