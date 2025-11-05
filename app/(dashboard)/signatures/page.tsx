
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
import ContractService, { ContractSignature, SignatureVerification } from '@/lib/services/contracts';
// import { SignatureAuditTrail } from '@/components/signature-audit-trail';

const SignatureManagement: React.FC = () => {
  const [signatures, setSignatures] = useState<ContractSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSignature, setSelectedSignature] = useState<ContractSignature | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, SignatureVerification>>({});

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

  const getStatusBadge = (status: string) => {
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
                              onClick={() => setSelectedSignature(signature)}
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
              {selectedSignature ? (
                <div className="text-center py-8">
                  <p>Audit trail for contract: {selectedSignature.contractId}</p>
                  <p className="text-sm text-gray-500 mt-2">Detailed audit trail implementation coming soon</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No signature selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a signature from the table to view its audit trail.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Signature Details Modal/Sidebar could be added here */}
    </div>
  );
};

export default SignatureManagement;