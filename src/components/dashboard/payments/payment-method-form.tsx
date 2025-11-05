
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/lib/hooks';
import { paymentMethodService, CreatePaymentMethodData, PaymentProvider } from '@/lib/services/payments';
import { Loader2, CreditCard, Shield, AlertTriangle } from 'lucide-react';

interface PaymentMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  provider: PaymentProvider;
  paymentData: {
    payment_method_id?: string;
    source_id?: string;
    vault_id?: string;
    setup_token?: string;
    verification_token?: string;
  };
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

export function PaymentMethodForm({ onSuccess, onCancel }: PaymentMethodFormProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    provider: 'stripe',
    paymentData: {},
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    },
    setAsDefault: false
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentData.payment_method_id && !formData.paymentData.source_id && 
        !formData.paymentData.vault_id && !formData.paymentData.setup_token) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a valid payment method identifier'
      });
      return;
    }

    try {
      setLoading(true);
      
      const createData: CreatePaymentMethodData = {
        provider: formData.provider,
        paymentData: formData.paymentData,
        billingAddress: formData.billingAddress,
        setAsDefault: formData.setAsDefault
      };

      const response = await paymentMethodService.createPaymentMethod(createData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment method added successfully'
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add payment method'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.replace('billingAddress.', '');
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else if (field.startsWith('paymentData.')) {
      const paymentField = field.replace('paymentData.', '');
      setFormData(prev => ({
        ...prev,
        paymentData: {
          ...prev.paymentData,
          [paymentField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  /**
   * Get payment method field label and placeholder based on provider
   */
  const getPaymentMethodField = () => {
    switch (formData.provider) {
      case 'stripe':
        return {
          field: 'payment_method_id',
          label: 'Stripe Payment Method ID',
          placeholder: 'pm_1234567890abcdef',
          description: 'The payment method ID from Stripe Elements or Setup Intent'
        };
      case 'paypal':
        return {
          field: 'vault_id',
          label: 'PayPal Vault ID',
          placeholder: '1A2B3C4D5E6F',
          description: 'The vaulted payment method ID from PayPal'
        };
      case 'square':
        return {
          field: 'source_id',
          label: 'Square Source ID',
          placeholder: 'cnon:card-nonce-ok',
          description: 'The card nonce from Square Web Payments SDK'
        };
      default:
        return {
          field: 'payment_method_id',
          label: 'Payment Method ID',
          placeholder: 'Enter payment method identifier',
          description: 'The tokenized payment method identifier'
        };
    }
  };

  const paymentMethodField = getPaymentMethodField();

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            All payment information is securely tokenized. Raw payment data is never transmitted or stored.
          </AlertDescription>
        </Alert>

        {/* Payment Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Provider
            </CardTitle>
            <CardDescription>
              Select your payment service provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select 
                value={formData.provider} 
                onValueChange={(value: PaymentProvider) => handleInputChange('provider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentMethodId">{paymentMethodField.label}</Label>
              <Input
                id="paymentMethodId"
                type="text"
                placeholder={paymentMethodField.placeholder}
                value={formData.paymentData[paymentMethodField.field as keyof typeof formData.paymentData] || ''}
                onChange={(e) => handleInputChange(`paymentData.${paymentMethodField.field}`, e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {paymentMethodField.description}
              </p>
            </div>

            {formData.provider === 'square' && (
              <div>
                <Label htmlFor="verificationToken">Verification Token (Optional)</Label>
                <Input
                  id="verificationToken"
                  type="text"
                  placeholder="verification-token-123"
                  value={formData.paymentData.verification_token || ''}
                  onChange={(e) => handleInputChange('paymentData.verification_token', e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional verification token for enhanced security
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
            <CardDescription>
              Enter the billing address associated with the payment method
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
                onCheckedChange={(checked) => handleInputChange('setAsDefault', checked ? 'true' : 'false')}
              />
              <Label htmlFor="setAsDefault">Set as default payment method</Label>
            </div>
          </CardContent>
        </Card>

        {/* Integration Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Integration Required:</strong> This form requires frontend integration with {formData.provider} SDK 
            to generate secure payment tokens. In a production environment, the payment method ID would be 
            generated through the provider's secure tokenization process.
          </AlertDescription>
        </Alert>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Payment Method
          </Button>
        </div>
      </form>
    </div>
  );
}