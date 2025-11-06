// components/tax/tax-calculator.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaxCalculation } from '@/hooks/useTaxCalculation';
import { Calculator, DollarSign, Percent } from 'lucide-react';

export function TaxCalculator() {
    const [formData, setFormData] = useState({
        amount: '',
        country: 'US',
        state: '',
        taxType: '',
        productType: '',
        customerType: '',
    });

    const { calculateTax, result, loading, error } = useTaxCalculation();

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        await calculateTax({
            amount: parseFloat(formData.amount),
            country: formData.country,
            state: formData.state || undefined,
            taxType: formData.taxType || undefined,
            productType: formData.productType || undefined,
            customerType: formData.customerType || undefined,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tax Calculator
                </CardTitle>
                <CardDescription>
                    Calculate tax for a specific transaction
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-9"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Select
                                value={formData.country}
                                onValueChange={(value) => setFormData({ ...formData, country: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="GB">United Kingdom</SelectItem>
                                    <SelectItem value="AU">Australia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State/Region</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="e.g., NY, CA"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taxType">Tax Type</Label>
                            <Select
                                value={formData.taxType}
                                onValueChange={(value) => setFormData({ ...formData, taxType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                                    <SelectItem value="VAT">VAT</SelectItem>
                                    <SelectItem value="GST">GST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Calculating...' : 'Calculate Tax'}
                    </Button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Tax Calculation Result</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-600">Original Amount:</div>
                            <div className="font-medium">${result.originalAmount.toFixed(2)}</div>

                            <div className="text-gray-600">Tax Rate:</div>
                            <div className="font-medium">{result.taxRate}%</div>

                            <div className="text-gray-600">Tax Amount:</div>
                            <div className="font-medium text-green-600">${result.taxAmount.toFixed(2)}</div>

                            <div className="text-gray-600 font-semibold">Total Amount:</div>
                            <div className="font-bold text-green-700">${result.totalAmount.toFixed(2)}</div>
                        </div>
                        {result.breakdown && result.breakdown.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                                <h5 className="text-sm font-medium text-green-800 mb-1">Breakdown:</h5>
                                {result.breakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between text-xs">
                                        <span>{item.name}:</span>
                                        <span>${item.amount.toFixed(2)} ({item.rate}%)</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}