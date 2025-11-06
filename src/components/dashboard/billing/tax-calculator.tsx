import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { billingService } from '@/lib/services/billing.service';
import { TaxCalculationResponse } from '@/lib/types/billing';
import { formatCurrency } from '@/lib/utils';
import { Calculator } from 'lucide-react';

export function TaxCalculator() {
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<TaxCalculationResponse | null>(null);
    const [formData, setFormData] = useState({
        country: 'US',
        state: 'NY',
        productType: 'SUBSCRIPTIONS',
        amount: '99.99',
        currency: 'USD',
    });

    const calculateTax = async () => {
        try {
            setCalculating(true);
            const response = await billingService.calculateTax({
                amount: parseFloat(formData.amount),
                country: formData.country,
                state: formData.state,
                productType: formData.productType,
            });
            setResult(response.data || null);
        } catch (error) {
            console.error('Failed to calculate tax:', error);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tax Calculator
                </CardTitle>
                <CardDescription>
                    Calculate taxes for different jurisdictions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    country: e.target.value
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    state: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="productType">Product Type</Label>
                            <Select
                                value={formData.productType}
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    productType: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBSCRIPTIONS">Subscriptions</SelectItem>
                                    <SelectItem value="DIGITAL_SERVICES">Digital Services</SelectItem>
                                    <SelectItem value="PHYSICAL_GOODS">Physical Goods</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    amount: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    <Button onClick={calculateTax} disabled={calculating} className="w-full">
                        Calculate Tax
                    </Button>

                    {result && (
                        <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(result.subtotal, result.currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>{formatCurrency(result.taxAmount, result.currency)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(result.total, result.currency)}</span>
                            </div>
                            {result.taxBreakdown.map((tax: any, index: number) => (
                                <div key={index} className="text-sm text-muted-foreground">
                                    {tax.taxType} ({tax.rate}%) - {tax.jurisdiction}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}