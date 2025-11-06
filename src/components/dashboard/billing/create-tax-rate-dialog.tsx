import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { billingService } from '@/lib/services/billing.service';
import { TaxRate } from '@/lib/types/billing';
import { Loader2 } from 'lucide-react';

interface CreateTaxRateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaxRateCreated: () => void;
}

export function CreateTaxRateDialog({
    open,
    onOpenChange,
    onTaxRateCreated,
}: CreateTaxRateDialogProps) {
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        country: '',
        state: '',
        taxType: '',
        rate: '',
        applicableToProducts: [] as string[],
        customerTypes: [] as string[],
        effectiveFrom: '',
        effectiveTo: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            await billingService.createTaxRate({
                ...formData,
                taxType: formData.taxType as TaxRate['taxType'],
                rate: parseFloat(formData.rate),
                active: true,
            });
            onTaxRateCreated();
            onOpenChange(false);
            setFormData({
                name: '',
                description: '',
                country: '',
                state: '',
                taxType: '',
                rate: '',
                applicableToProducts: [],
                customerTypes: [],
                effectiveFrom: '',
                effectiveTo: '',
            });
        } catch (error) {
            console.error('Failed to create tax rate:', error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Tax Rate</DialogTitle>
                    <DialogDescription>
                        Add a new tax rate for a specific jurisdiction
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tax Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., New York State Sales Tax"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taxType">Tax Type *</Label>
                            <Select
                                value={formData.taxType}
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    taxType: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select tax type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                                    <SelectItem value="VAT">VAT</SelectItem>
                                    <SelectItem value="GST">GST</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the tax rate and its applicability..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country Code *</Label>
                            <Input
                                id="country"
                                placeholder="US"
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    country: e.target.value.toUpperCase()
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                                id="state"
                                placeholder="NY"
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    state: e.target.value.toUpperCase()
                                }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rate">Tax Rate (%) *</Label>
                            <Input
                                id="rate"
                                type="number"
                                step="0.01"
                                placeholder="8.25"
                                value={formData.rate}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    rate: e.target.value
                                }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="effectiveFrom">Effective From</Label>
                            <Input
                                id="effectiveFrom"
                                type="date"
                                value={formData.effectiveFrom}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    effectiveFrom: e.target.value
                                }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="effectiveTo">Effective To</Label>
                            <Input
                                id="effectiveTo"
                                type="date"
                                value={formData.effectiveTo}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    effectiveTo: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={creating}>
                            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Tax Rate
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}