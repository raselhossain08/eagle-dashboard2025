
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/lib/hooks';
import { paymentMethodService, PaymentMethod } from '@/lib/services/payments';
import { Loader2, Shield, CreditCard, AlertTriangle } from 'lucide-react';

interface PaymentMethodVerifyFormProps {
  paymentMethod: PaymentMethod;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  verificationCode: string;
  verificationMethod: string;
}

export function PaymentMethodVerifyForm({ paymentMethod, onSuccess, onCancel }: PaymentMethodVerifyFormProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    verificationCode: '',
    verificationMethod: 'microdeposits'
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.verificationCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter the verification code'
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await paymentMethodService.verifyPaymentMethod(
        paymentMethod._id, 
        formData.verificationCode, 
        formData.verificationMethod
      );
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment method verified successfully'
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error verifying payment method:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Failed to verify payment method'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Get verification instructions based on method and provider
   */
  const getVerificationInstructions = () => {
    const { provider, type } = paymentMethod;
    
    switch (provider) {
      case 'stripe':
        if (type === 'bank_account') {
          return formData.verificationMethod === 'microdeposits' 
            ? 'Enter the two small deposit amounts (in cents) separated by a comma. For example: 32,45'
            : 'Enter the descriptor code from your bank statement.';
        }
        return 'Follow the verification process provided by Stripe.';
        
      case 'paypal':
        return 'PayPal payment methods are automatically verified during setup.';
        
      case 'square':
        return 'Square payment methods are verified during the tokenization process.';
        
      default:
        return 'Follow the verification process provided by your payment provider.';
    }
  };

  /**
   * Check if verification is supported
   */
  const isVerificationSupported = () => {
    return paymentMethod.provider === 'stripe' && paymentMethod.type === 'bank_account';
  };

  if (!isVerificationSupported()) {
    return (
      <div className="max-w-lg mx-auto">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Verification is not required or supported for this payment method type.
            {paymentMethod.provider === 'paypal' && ' PayPal payment methods are automatically verified.'}
            {paymentMethod.provider === 'square' && ' Square payment methods are verified during setup.'}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end mt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verify Payment Method
            </CardTitle>
            <CardDescription>
              {paymentMethodService.formatDisplayName(paymentMethod)} • {paymentMethod.provider}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{paymentMethod.verification?.status || 'Pending'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Verification Method */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Method</CardTitle>
            <CardDescription>
              Select how you want to verify this payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verificationMethod">Method</Label>
              <Select 
                value={formData.verificationMethod} 
                onValueChange={(value) => handleInputChange('verificationMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="microdeposits">Micro-deposits</SelectItem>
                  <SelectItem value="instant">Instant verification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {getVerificationInstructions()}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Verification Code */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Code</CardTitle>
            <CardDescription>
              Enter the verification code based on your selected method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="verificationCode">
                {formData.verificationMethod === 'microdeposits' 
                  ? 'Deposit Amounts (in cents)'
                  : 'Verification Code'
                }
              </Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder={
                  formData.verificationMethod === 'microdeposits' 
                    ? 'e.g., 32,45' 
                    : 'Enter verification code'
                }
                value={formData.verificationCode}
                onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.verificationMethod === 'microdeposits' 
                  ? 'Check your bank statement for two small deposits and enter the amounts.'
                  : 'Enter the verification code provided by your bank or payment provider.'
                }
              </p>
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
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify Payment Method
          </Button>
        </div>
      </form>
    </div>
  );
}