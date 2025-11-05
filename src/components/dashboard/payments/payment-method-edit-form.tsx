
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks';
import { paymentMethodService, PaymentMethod, UpdatePaymentMethodData } from '@/lib/services/payments';
import { Loader2, CreditCard } from 'lucide-react';

interface PaymentMethodEditFormProps {
  paymentMethod: PaymentMethod;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  billingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  setAsDefault: boolean;
}

export function PaymentMethodEditForm({ paymentMethod, onSuccess, onCancel }: PaymentMethodEditFormProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    billingAddress: {
      line1: paymentMethod.billingAddress?.line1 || '',
      line2: paymentMethod.billingAddress?.line2 || '',
      city: paymentMethod.billingAddress?.city || '',
      state: paymentMethod.billingAddress?.state || '',
      postalCode: paymentMethod.billingAddress?.postalCode || '',
      country: paymentMethod.billingAddress?.country || 'US'
    },
    setAsDefault: paymentMethod.isDefault
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const updateData: UpdatePaymentMethodData = {
        billingAddress: formData.billingAddress,
        setAsDefault: formData.setAsDefault
      };

      const response = await paymentMethodService.updatePaymentMethod(paymentMethod._id, updateData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment method updated successfully'
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update payment method'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.replace('billingAddress.', '');
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method Details
            </CardTitle>
            <CardDescription>
              {paymentMethodService.formatDisplayName(paymentMethod)} • {paymentMethod.provider}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              This payment method cannot be modified as it's securely tokenized. 
              You can only update billing address and default status.
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
            <CardDescription>
              Update the billing address associated with this payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="line1">Address Line 1</Label>
                <Input
                  id="line1"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.billingAddress.line1}
                  onChange={(e) => handleInputChange('billingAddress.line1', e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                <Input
                  id="line2"
                  type="text"
                  placeholder="Apartment, suite, etc."
                  value={formData.billingAddress.line2}
                  onChange={(e) => handleInputChange('billingAddress.line2', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="NY"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="10001"
                  value={formData.billingAddress.postalCode}
                  onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={formData.billingAddress.country} 
                  onValueChange={(value) => handleInputChange('billingAddress.country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="NL">Netherlands</SelectItem>
                    <SelectItem value="BE">Belgium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setAsDefault"
                checked={formData.setAsDefault}
                onCheckedChange={(checked) => handleInputChange('setAsDefault', checked as boolean)}
              />
              <Label htmlFor="setAsDefault">Set as default payment method</Label>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Payment Method
          </Button>
        </div>
      </form>
    </div>
  );
}