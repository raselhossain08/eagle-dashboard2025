
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pen, 
  FileText, 
  Shield, 
  Clock, 
  MapPin, 
  Monitor, 
  User, 
  Mail, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import SignaturePad, { SignaturePadRef } from './signature-pad';
import { 
  Contract, 
  SignatureSubmission, 
  SignatureMetadata, 
  SignatureWitness, 
  SignatureNotary 
} from '@/services/contracts';

interface SignatureWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  partyType: 'primary' | 'secondary' | 'additional';
  partyIndex?: number;
  onSignatureSubmit: (signatureData: SignatureSubmission) => Promise<void>;
  loading: boolean;
}

const SignatureWorkflowDialog: React.FC<SignatureWorkflowDialogProps> = ({
  open,
  onOpenChange,
  contract,
  partyType,
  partyIndex,
  onSignatureSubmit,
  loading,
}) => {
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [signatureMethod, setSignatureMethod] = useState<'electronic' | 'wet_signature'>('electronic');
  const [signatureData, setSignatureData] = useState<string>('');
  const [isSignatureValid, setIsSignatureValid] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Witness information
  const [requiresWitness, setRequiresWitness] = useState(false);
  const [witnessData, setWitnessData] = useState<SignatureWitness>({
    name: '',
    email: '',
    phone: '',
  });
  
  // Notary information
  const [requiresNotary, setRequiresNotary] = useState(false);
  const [notaryData, setNotaryData] = useState<SignatureNotary>({
    name: '',
    commission: '',
  });
  
  // Legal acknowledgment
  const [legalAcknowledged, setLegalAcknowledged] = useState(false);
  const [termsAcknowledged, setTermsAcknowledged] = useState(false);

  // Get current party information
  const getCurrentParty = () => {
    if (!contract) return null;
    
    switch (partyType) {
      case 'primary':
        return contract.parties.primary;
      case 'secondary':
        return contract.parties.secondary;
      case 'additional':
        return partyIndex !== undefined ? contract.parties.additional[partyIndex] : null;
      default:
        return null;
    }
  };

  const currentParty = getCurrentParty();

  // Collect device and location information
  useEffect(() => {
    if (!open) return;

    // Collect device information
    const collectDeviceInfo = () => {
      const info = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
      };
      setDeviceInfo(info);
    };

    // Get user location (with permission)
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation(position);
          },
          (error) => {
            console.warn('Location access denied:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      }
    };

    collectDeviceInfo();
    getLocation();
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setSignatureData('');
      setIsSignatureValid(false);
      setLegalAcknowledged(false);
      setTermsAcknowledged(false);
      setValidationErrors({});
      signaturePadRef.current?.clear();
    }
  }, [open]);

  const handleSignatureChange = (isEmpty: boolean, signature?: string) => {
    setIsSignatureValid(!isEmpty && !!signature);
    setSignatureData(signature || '');
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Identity verification
        if (!currentParty) {
          errors.party = 'Invalid party information';
        }
        break;

      case 2: // Signature capture
        if (!isSignatureValid) {
          errors.signature = 'Signature is required';
        }
        if (requiresWitness) {
          if (!witnessData.name.trim()) errors.witnessName = 'Witness name is required';
          if (!witnessData.email.trim()) errors.witnessEmail = 'Witness email is required';
        }
        if (requiresNotary) {
          if (!notaryData.name.trim()) errors.notaryName = 'Notary name is required';
          if (!notaryData.commission.trim()) errors.notaryCommission = 'Notary commission is required';
        }
        break;

      case 3: // Legal acknowledgment
        if (!legalAcknowledged) {
          errors.legal = 'Legal acknowledgment is required';
        }
        if (!termsAcknowledged) {
          errors.terms = 'Terms acknowledgment is required';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Final validation
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        toast.error('Please complete all required fields');
        return;
      }
    }

    try {
      // Prepare signature metadata
      const metadata: SignatureMetadata = {
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        geolocation: userLocation ? {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          accuracy: userLocation.coords.accuracy,
        } : undefined,
        deviceInfo,
      };

      // Prepare signature submission
      const submission: SignatureSubmission = {
        partyType,
        partyIndex,
        signatureMethod,
        signatureImage: signatureData,
        metadata,
        witness: requiresWitness ? witnessData : undefined,
        notary: requiresNotary ? notaryData : undefined,
      };

      await onSignatureSubmit(submission);
    } catch (error) {
      console.error('Signature submission error:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      // In production, you might want to use a proper IP detection service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-medium">Identity Verification</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Signer Information</CardTitle>
                <CardDescription>
                  Please verify your identity before proceeding with the signature.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentParty && (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <div className="text-sm font-medium">{currentParty.name}</div>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Badge variant="secondary">{currentParty.type}</Badge>
                      </div>
                    </div>
                    
                    {currentParty.email && (
                      <div>
                        <Label>Email Address</Label>
                        <div className="text-sm flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {currentParty.email}
                        </div>
                      </div>
                    )}
                    
                    {currentParty.phone && (
                      <div>
                        <Label>Phone Number</Label>
                        <div className="text-sm flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {currentParty.phone}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract Information</CardTitle>
              </CardHeader>
              <CardContent>
                {contract && (
                  <div className="grid gap-3">
                    <div>
                      <Label>Contract Title</Label>
                      <div className="text-sm font-medium">{contract.title}</div>
                    </div>
                    <div>
                      <Label>Contract Number</Label>
                      <div className="text-sm">{contract.contractNumber}</div>
                    </div>
                    <div>
                      <Label>Effective Date</Label>
                      <div className="text-sm">{new Date(contract.terms.effectiveDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Timestamp</Label>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  {userLocation && (
                    <div>
                      <Label>Location</Label>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Detected
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Device</Label>
                    <div>{deviceInfo?.platform || 'Unknown'}</div>
                  </div>
                  <div>
                    <Label>Security</Label>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-600" />
                      Secure Session
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Pen className="h-5 w-5" />
              <h3 className="text-lg font-medium">Electronic Signature</h3>
            </div>

            <SignaturePad
              ref={signaturePadRef}
              height={200}
              label="Your Signature"
              description="Please sign in the box below using your mouse, touchpad, or finger."
              required={true}
              onSignatureChange={handleSignatureChange}
              className={validationErrors.signature ? 'border-red-500' : ''}
            />
            
            {validationErrors.signature && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.signature}</AlertDescription>
              </Alert>
            )}

            {/* Witness Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Witness Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireWitness"
                    checked={requiresWitness}
                    onChange={(e) => setRequiresWitness(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="requireWitness">This signature requires a witness</Label>
                </div>

                {requiresWitness && (
                  <div className="grid gap-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Witness Name *</Label>
                        <Input
                          value={witnessData.name}
                          onChange={(e) => setWitnessData(prev => ({ ...prev, name: e.target.value }))}
                          className={validationErrors.witnessName ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Witness Email *</Label>
                        <Input
                          type="email"
                          value={witnessData.email}
                          onChange={(e) => setWitnessData(prev => ({ ...prev, email: e.target.value }))}
                          className={validationErrors.witnessEmail ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Witness Phone</Label>
                      <Input
                        value={witnessData.phone}
                        onChange={(e) => setWitnessData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notary Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notary Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireNotary"
                    checked={requiresNotary}
                    onChange={(e) => setRequiresNotary(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="requireNotary">This signature requires notarization</Label>
                </div>

                {requiresNotary && (
                  <div className="grid gap-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Notary Name *</Label>
                        <Input
                          value={notaryData.name}
                          onChange={(e) => setNotaryData(prev => ({ ...prev, name: e.target.value }))}
                          className={validationErrors.notaryName ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Commission Number *</Label>
                        <Input
                          value={notaryData.commission}
                          onChange={(e) => setNotaryData(prev => ({ ...prev, commission: e.target.value }))}
                          className={validationErrors.notaryCommission ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h3 className="text-lg font-medium">Legal Acknowledgment</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Electronic Signature Consent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="legalAcknowledge"
                      checked={legalAcknowledged}
                      onChange={(e) => setLegalAcknowledged(e.target.checked)}
                      className="rounded border-gray-300 mt-1"
                    />
                    <Label htmlFor="legalAcknowledge" className="text-sm leading-relaxed">
                      I acknowledge and agree that my electronic signature has the same legal force and effect as a handwritten signature. I understand that this document is legally binding and that I have the right to receive a paper copy of this contract.
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="termsAcknowledge"
                      checked={termsAcknowledged}
                      onChange={(e) => setTermsAcknowledged(e.target.checked)}
                      className="rounded border-gray-300 mt-1"
                    />
                    <Label htmlFor="termsAcknowledge" className="text-sm leading-relaxed">
                      I have read and understand the terms and conditions of this contract. I am authorized to execute this agreement on behalf of the party I represent, if applicable.
                    </Label>
                  </div>
                </div>

                {(validationErrors.legal || validationErrors.terms) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You must acknowledge the legal terms to proceed.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Signature Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Signature Method</Label>
                    <Badge variant="secondary">Electronic Signature</Badge>
                  </div>
                  <div>
                    <Label>Timestamp</Label>
                    <div>{new Date().toLocaleString()}</div>
                  </div>
                  <div>
                    <Label>Witness Required</Label>
                    <div>{requiresWitness ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <Label>Notary Required</Label>
                    <div>{requiresNotary ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                
                {isSignatureValid && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Signature captured successfully</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Identity', 'Signature', 'Legal'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Electronic Signature
          </DialogTitle>
          <DialogDescription>
            Complete the electronic signature process for {contract?.title}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between py-4 border-b">
          {stepTitles.map((title, index) => (
            <div 
              key={index} 
              className={`flex items-center ${index < stepTitles.length - 1 ? 'flex-1' : ''}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm ${currentStep === index + 1 ? 'font-medium' : 'text-gray-600'}`}>
                {title}
              </span>
              {index < stepTitles.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <ScrollArea className="flex-1 py-4">
          {renderStep()}
        </ScrollArea>

        {/* Navigation */}
        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !isSignatureValid || !legalAcknowledged || !termsAcknowledged}
                >
                  {loading ? 'Submitting...' : 'Submit Signature'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureWorkflowDialog;