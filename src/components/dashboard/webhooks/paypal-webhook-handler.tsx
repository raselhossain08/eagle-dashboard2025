'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { billingService } from '@/lib/services/billing.service';
import { Badge } from '@/components/ui/badge';
import { Loader2, Webhook } from 'lucide-react';

export function PayPalWebhookHandler() {
    const [processing, setProcessing] = useState(false);
    const [webhookData, setWebhookData] = useState('');
    const [lastResult, setLastResult] = useState<any>(null);

    const handleWebhookTest = async () => {
        try {
            setProcessing(true);
            let data;
            try {
                data = JSON.parse(webhookData);
            } catch {
                throw new Error('Invalid JSON format');
            }

            const response = await billingService.handlePayPalWebhook(data);
            setLastResult({
                success: true,
                data: response.data,
                message: 'Webhook processed successfully'
            });
        } catch (error: any) {
            setLastResult({
                success: false,
                message: error.message || 'Failed to process webhook'
            });
        } finally {
            setProcessing(false);
        }
    };

    const loadSampleData = () => {
        const sampleWebhook = {
            event_type: "PAYMENT.CAPTURE.COMPLETED",
            resource: {
                id: "PAYID-MXYZ123456789",
                status: "COMPLETED",
                amount: {
                    value: "99.99",
                    currency_code: "USD"
                }
            }
        };
        setWebhookData(JSON.stringify(sampleWebhook, null, 2));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    PayPal Webhook Tester
                </CardTitle>
                <CardDescription>
                    Test PayPal webhook payloads and see how they're processed
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="webhookData">Webhook Payload (JSON)</Label>
                    <Textarea
                        id="webhookData"
                        placeholder='Paste PayPal webhook JSON here...'
                        value={webhookData}
                        onChange={(e) => setWebhookData(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={loadSampleData} variant="outline">
                        Load Sample
                    </Button>
                    <Button onClick={handleWebhookTest} disabled={processing || !webhookData.trim()}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Test Webhook
                    </Button>
                </div>

                {lastResult && (
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={lastResult.success ? "default" : "destructive"}>
                                {lastResult.success ? "Success" : "Error"}
                            </Badge>
                            <span className="text-sm">{lastResult.message}</span>
                        </div>
                        {lastResult.data && (
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                                {JSON.stringify(lastResult.data, null, 2)}
                            </pre>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}