
"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FileSignature, Clock, CheckCircle, AlertCircle, Search, Filter, Calendar, User, Shield, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ContractService from '@/lib/services/contracts';
import type { ContractSignature, SignatureVerification } from '@/lib/services/contracts/contract.service';
// import { SignatureAuditTrail } from '@/components/signature-audit-trail';

const SignatureManagement: React.FC = () => {
  const [signatures, setSignatures] = useState<ContractSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSignature, setSelectedSignature] = useState<ContractSignature | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, SignatureVerification>>({});

  // Audit trail state
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSignatureDetails, setSelectedSignatureDetails] = useState<ContractSignature | null>(null);

  // Load signatures
  const loadSignatures = async () => {
    try {
      setLoading(true);
      const response = await ContractService.getSignatures({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setSignatures(response.data);
      } else {
        throw new Error(response.error || 'Failed to load signatures');
      }
    } catch (error: any) {
      console.error('Load signatures error:', error);
      toast.error(error.message || 'Failed to load signatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, [statusFilter]);

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSignatures();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleVerifySignature = async (signature: ContractSignature) => {
    try {
      const response = await ContractService.verifySignature(signature.contractId, signature._id);
      if (response.success && response.data) {
        setVerificationResults(prev => ({
          ...prev,
          [signature._id]: response.data!
        }));
        toast.success('Signature verified successfully');
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify signature');
    }
  };

  const handleDownloadCertificate = async (signature: ContractSignature) => {
    try {
      const blob = await ContractService.getSignatureCertificate(signature.contractId, signature._id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `signature-certificate-${signature._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Certificate downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download certificate');
    }
  };

  const handleViewDetails = (signature: ContractSignature) => {
    setSelectedSignatureDetails(signature);
    setDetailsDialogOpen(true);
  };

  const handleViewAuditTrail = async (signature: ContractSignature) => {
    setSelectedSignature(signature);
    setAuditLoading(true);

    try {
      const response = await ContractService.getSignatureAuditTrail(signature.contractId);

      if (response.success && response.data) {
        setAuditTrail(response.data);
        toast.success('Audit trail loaded successfully');
      } else {
        throw new Error(response.error || 'Failed to load audit trail');
      }
    } catch (error: any) {
      console.error('Load audit trail error:', error);
      toast.error(error.message || 'Failed to load audit trail');
      setAuditTrail([]);
    } finally {
      setAuditLoading(false);
    }
  }; const getStatusBadge = (status: string) => {
    const statusConfig = {
      valid: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Valid'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pending'
      },
      invalid: {
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        label: 'Invalid'
      },
      expired: {
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
        label: 'Expired'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredSignatures = signatures.filter(signature => {
    const matchesSearch = searchTerm === '' ||
      signature.signerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signature.signerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signature.contractId.toString().includes(searchTerm);

    return matchesSearch;
  });

  const signatureStats = {
    total: signatures.length,
    valid: signatures.filter(s => s.status === 'valid').length,
    pending: signatures.filter(s => s.status === 'pending').length,
    invalid: signatures.filter(s => s.status === 'invalid').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Signature Management</h1>
          <p className="text-muted-foreground">
            Monitor and verify contract signatures with complete audit trails
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signatureStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All signature records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Signatures</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{signatureStats.valid}</div>
            <p className="text-xs text-muted-foreground">
              Verified and valid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{signatureStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{signatureStats.invalid}</div>
            <p className="text-xs text-muted-foreground">
              Verification failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="signatures" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signatures">All Signatures</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="signatures" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by signer name, email, or contract ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="invalid">Invalid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Signatures Table */}
          <Card>
            <CardHeader>
              <CardTitle>Signatures ({filteredSignatures.length})</CardTitle>
              <CardDescription>
                Complete signature records with verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading signatures...</div>
              ) : filteredSignatures.length === 0 ? (
                <div className="text-center py-8">
                  <FileSignature className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No signatures</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No signature records found matching your criteria.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signer</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Signed Date</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSignatures.map((signature) => (
                      <TableRow key={signature._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{signature.signerName}</div>
                            <div className="text-sm text-gray-500">{signature.signerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {signature.contractId}
                          </code>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(signature.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              {new Date(signature.signedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(signature.signedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{signature.ipAddress}</code>
                        </TableCell>
                        <TableCell>
                          {verificationResults[signature._id] ? (
                            <Badge
                              className={
                                verificationResults[signature._id].isValid
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {verificationResults[signature._id].isValid ? 'Verified' : 'Failed'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Verified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifySignature(signature)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadCertificate(signature)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(signature)}
                            >
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signature Audit Trail</CardTitle>
              <CardDescription>
                Complete audit trail for signature verification and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedSignature ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No signature selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click "View Audit Trail" on a signature from the Signatures tab to load its audit trail.
                  </p>
                </div>
              ) : auditLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-4 text-sm text-gray-500">Loading audit trail...</p>
                </div>
              ) : auditTrail.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No audit trail found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No audit trail entries found for contract: {selectedSignature.contractId}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Contract ID: {selectedSignature.contractId}</h4>
                      <p className="text-sm text-gray-500">Signer: {selectedSignature.signerName}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSignature(null);
                        setAuditTrail([]);
                      }}
                    >
                      Clear Selection
                    </Button>
                  </div>

                  <div className="border rounded-lg divide-y">
                    {auditTrail.map((entry: any, index: number) => (
                      <div key={entry._id || index} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                entry.action.includes('added') ? 'default' :
                                  entry.action.includes('verified') ? 'secondary' :
                                    entry.action.includes('cancelled') ? 'destructive' :
                                      'outline'
                              }>
                                {entry.action}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>

                            {entry.performedByName && (
                              <p className="mt-1 text-sm text-gray-600">
                                Performed by: {entry.performedByName}
                              </p>
                            )}

                            {entry.partyName && (
                              <p className="mt-1 text-sm text-gray-600">
                                Party: {entry.partyName} ({entry.partyType})
                              </p>
                            )}

                            {entry.details && Object.keys(entry.details).length > 0 && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                                {JSON.stringify(entry.details, null, 2)}
                              </div>
                            )}

                            {entry.ipAddress && (
                              <p className="mt-1 text-xs text-gray-500">
                                IP: {entry.ipAddress}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Signature Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Signature Details</DialogTitle>
          </DialogHeader>

          {selectedSignatureDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Signer Name</p>
                    <p className="font-medium">{selectedSignatureDetails.signerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedSignatureDetails.signerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contract ID</p>
                    <p className="font-mono text-sm">{selectedSignatureDetails.contractId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedSignatureDetails.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Signed At</p>
                    <p className="font-medium">
                      {new Date(selectedSignatureDetails.signedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-mono text-sm">{selectedSignatureDetails.ipAddress}</p>
                  </div>
                </div>
              </div>

              {/* Signature Image */}
              {selectedSignatureDetails.signatureImage && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Signature</h3>
                  <div className="border rounded p-4 bg-white">
                    <img
                      src={selectedSignatureDetails.signatureImage}
                      alt="Signature"
                      className="max-h-32 mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedSignatureDetails.metadata && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Device & Session Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">User Agent</p>
                      <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                        {selectedSignatureDetails.userAgent}
                      </p>
                    </div>
                    {selectedSignatureDetails.metadata.deviceInfo && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-gray-500">Platform</p>
                          <p className="text-sm">{selectedSignatureDetails.metadata.deviceInfo.platform || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Timezone</p>
                          <p className="text-sm">{selectedSignatureDetails.metadata.deviceInfo.timeZone || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Witness Information */}
              {selectedSignatureDetails.witness && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Witness Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedSignatureDetails.witness.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedSignatureDetails.witness.email}</p>
                    </div>
                    {selectedSignatureDetails.witness.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedSignatureDetails.witness.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notary Information */}
              {selectedSignatureDetails.notary && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notary Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedSignatureDetails.notary.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Commission</p>
                      <p className="font-medium">{selectedSignatureDetails.notary.commission}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hash & Certificate */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Verification</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Hash Value</p>
                    <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                      {selectedSignatureDetails.hashValue}
                    </p>
                  </div>
                  {verificationResults[selectedSignatureDetails._id] && (
                    <div className="mt-3 p-3 border rounded bg-green-50">
                      <p className="font-semibold text-green-800">✓ Signature Verified</p>
                      <p className="text-sm text-green-600 mt-1">
                        This signature has been cryptographically verified and is valid.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleVerifySignature(selectedSignatureDetails)}
                  className="flex-1"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Signature
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadCertificate(selectedSignatureDetails)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewAuditTrail(selectedSignatureDetails)}
                >
                  View Audit Trail
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignatureManagement;