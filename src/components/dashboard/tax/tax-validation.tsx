// components/tax/tax-validation.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaxValidation } from '@/hooks/useTaxValidation';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export function TaxValidation() {
    const [formData, setFormData] = useState({
        taxId: '',
        country: 'US',
        state: '',
    });

    const { validateTaxId, result, loading, error } = useTaxValidation();

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await validateTaxId({
                taxId: formData.taxId,
                country: formData.country,
                state: formData.state || undefined,
            });
            toast.success('Tax ID validated');
        } catch (err) {
            toast.error('Failed to validate tax ID');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Tax ID Validation
                </CardTitle>
                <CardDescription>
                    Validate tax identification numbers
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleValidate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="taxId">Tax Identification Number *</Label>
                        <Input
                            id="taxId"
                            value={formData.taxId}
                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                            placeholder="Enter tax ID"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="val-country">Country *</Label>
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
                            <Label htmlFor="val-state">State/Region</Label>
                            <Input
                                id="val-state"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="e.g., NY, CA"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Validating...' : 'Validate Tax ID'}
                    </Button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {result && (
                    <div className={`mt-6 p-4 rounded-lg border ${result.valid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {result.valid ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-green-800">Valid Tax ID</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-red-800">Invalid Tax ID</span>
                                </>
                            )}
                        </div>

                        {result.formattedTaxId && (
                            <div className="text-sm text-gray-600">
                                Formatted: {result.formattedTaxId}
                            </div>
                        )}

                        {result.jurisdiction && (
                            <div className="text-sm text-gray-600">
                                Jurisdiction: {result.jurisdiction}
                            </div>
                        )}

                        {result.type && (
                            <div className="text-sm text-gray-600">
                                Type: {result.type}
                            </div>
                        )}

                        {result.message && (
                            <div className={`text-sm mt-2 ${result.valid ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {result.message}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}