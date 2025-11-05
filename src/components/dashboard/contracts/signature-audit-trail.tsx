
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Clock, 
  User, 
  MapPin, 
  Monitor, 
  FileText, 
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  RefreshCw,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';
import ContractService, { 
  Contract, 
  SignatureAuditEntry, 
  SignatureVerification
} from '@/services/contracts';

interface SignatureAuditTrailProps {
  contract: Contract;
  className?: string;
}

const SignatureAuditTrail: React.FC<SignatureAuditTrailProps> = ({
  contract,
  className = '',
}) => {
  const [auditTrail, setAuditTrail] = useState<SignatureAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<Record<string, SignatureVerification>>({});

  // Load audit trail
  useEffect(() => {
    loadAuditTrail();
  }, [contract._id]);

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      const response = await ContractService.getSignatureAuditTrail(contract._id);
      
      if (response.success && response.data) {
        setAuditTrail(response.data);
      } else {
        throw new Error(response.error || 'Failed to load audit trail');
      }
    } catch (error: any) {
      console.error('Load audit trail error:', error);
      toast.error(error.message || 'Failed to load signature audit trail');
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async (signatureId: string) => {
    try {
      const response = await ContractService.verifySignature(contract._id, signatureId);
      
      if (response.success && response.data) {
        setVerifications(prev => ({
          ...prev,
          [signatureId]: response.data!
        }));
        
        if (response.data.isValid) {
          toast.success('Signature verified successfully');
        } else {
          toast.warning('Signature verification failed');
        }
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Signature verification error:', error);
      toast.error(error.message || 'Failed to verify signature');
    }
  };

  const downloadCertificate = async (signatureId: string) => {
    try {
      const blob = await ContractService.getSignatureCertificate(contract._id, signatureId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signature-certificate-${signatureId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully');
    } catch (error: any) {
      console.error('Download certificate error:', error);
      toast.error(error.message || 'Failed to download certificate');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'signature_added':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'signature_verified':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'signature_sent':
        return <Mail className="h-4 w-4 text-purple-600" />;
      case 'reminder_sent':
        return <RefreshCw className="h-4 w-4 text-orange-600" />;
      case 'signature_cancelled':
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'signature_added':
        return 'bg-green-50 border-green-200';
      case 'signature_verified':
        return 'bg-blue-50 border-blue-200';
      case 'signature_sent':
        return 'bg-purple-50 border-purple-200';
      case 'reminder_sent':
        return 'bg-orange-50 border-orange-200';
      case 'signature_cancelled':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderSignatureDetails = (signature: Contract['signatures'][0]) => {
    const verification = verifications[signature.signedBy?.toString() || ''];
    
    return (
      <Card className="mt-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Signature Details</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => verifySignature(signature.signedBy?.toString() || '')}
                className="flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Verify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCertificate(signature.signedBy?.toString() || '')}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Certificate
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Signer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Signer</div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span className="text-sm">{signature.signedByName}</span>
              </div>
              {signature.signedByEmail && (
                <div className="text-xs text-gray-600 mt-1">{signature.signedByEmail}</div>
              )}
            </div>
            
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Method</div>
              <Badge variant="secondary">{signature.signatureMethod}</Badge>
            </div>
          </div>

          {/* Technical Details */}
          {signature.signatureData && (
            <div className="space-y-3">
              <Separator />
              <div className="text-xs font-medium text-gray-500">Technical Details</div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Timestamp
                  </div>
                  <div className="text-sm text-gray-600">
                    {signature.signatureData?.timestamp ? 
                      new Date(signature.signatureData.timestamp).toLocaleString() : 
                      signature.signedAt ? 
                        new Date(signature.signedAt).toLocaleString() : 
                        'No timestamp available'
                    }
                  </div>
                </div>
                
                <div>
                  <div className="font-medium mb-1 flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    IP Address
                  </div>
                  <div className="text-gray-600 font-mono">
                    {signature.signatureData.ipAddress}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-1 text-xs flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  User Agent
                </div>
                <div className="text-xs text-gray-600 break-all">
                  {signature.signatureData.userAgent}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          {signature.signatureData?.externalData && (
            <div className="space-y-2">
              <Separator />
              <div className="text-xs font-medium text-gray-500">Additional Information</div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium mb-1">External ID</div>
                  <div className="text-gray-600">{signature.signatureData.externalId || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">External Status</div>
                  <div className="text-gray-600">{signature.signatureData.externalStatus || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}



          {/* Verification Results */}
          {verification && (
            <div className="space-y-2">
              <Separator />
              <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Verification Status
              </div>
              
              <div className={`p-3 rounded-md border ${
                verification.isValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {verification.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium text-sm">
                    {verification.isValid ? 'Signature Valid' : 'Signature Invalid'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Hash: <span className="font-mono">{verification.hash}</span></div>
                  <div>Verified at: {new Date(verification.signedAt).toLocaleString()}</div>
                </div>
                
                {verification.errors && verification.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-red-700 mb-1">Errors:</div>
                    {verification.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-600">• {error}</div>
                    ))}
                  </div>
                )}
                
                {verification.warnings && verification.warnings.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-orange-700 mb-1">Warnings:</div>
                    {verification.warnings.map((warning, index) => (
                      <div key={index} className="text-xs text-orange-600">• {warning}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Signature Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading audit trail...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Signature Audit Trail
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAuditTrail}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Complete audit trail of all signature-related activities for this contract
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {auditTrail.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No signature activities recorded yet.
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {auditTrail.map((entry, index) => (
                <div key={entry._id} className="relative">
                  {index < auditTrail.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-full bg-gray-200" />
                  )}
                  
                  <div className={`border rounded-lg p-4 ${getActionColor(entry.action)}`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 bg-white rounded-full border-2 border-current flex items-center justify-center">
                        {getActionIcon(entry.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            {formatAction(entry.action)}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-600">
                          {entry.performedByName && (
                            <span>by {entry.performedByName}</span>
                          )}
                          {entry.partyName && (
                            <span> for {entry.partyName} ({entry.partyType})</span>
                          )}
                        </div>
                        
                        {/* Technical Details */}
                        {(entry.ipAddress || entry.userAgent) && (
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            {entry.ipAddress && (
                              <div className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                IP: {entry.ipAddress}
                              </div>
                            )}
                            {entry.userAgent && (
                              <div className="break-all">
                                UA: {entry.userAgent.substring(0, 80)}...
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Additional Details */}
                        {entry.details && Object.keys(entry.details).length > 0 && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                            <div className="font-medium mb-1">Details:</div>
                            {Object.entries(entry.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-gray-600">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Show signature details for signature_added actions */}
                        {entry.action === 'signature_added' && entry.details.signatureId && (
                          (() => {
                            const signature = contract.signatures.find(s => 
                              s.signedBy?.toString() === entry.details.signatureId ||
                              s.signedByName === entry.performedByName
                            );
                            return signature ? renderSignatureDetails(signature) : null;
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SignatureAuditTrail;