
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  Download, 
  Edit, 
  Trash2, 
  Send, 
  X,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Pen,
  Shield,
  History,
  Bell,
  Users,
  User
} from 'lucide-react';
import { Contract } from '@/services/contracts';

interface ContractsTableProps {
  contracts: Contract[];
  loading: boolean;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDownload: (contract: Contract) => void;
  onSendForSignature: (contract: Contract) => void;
  onCancel: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onSignContract?: (contract: Contract, partyType: 'primary' | 'secondary' | 'additional', partyIndex?: number) => void;
  onViewAuditTrail?: (contract: Contract) => void;
  onSendReminder?: (contract: Contract, partyType: string, partyIndex?: number) => void;
}

const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  loading,
  onView,
  onEdit,
  onDownload,
  onSendForSignature,
  onCancel,
  onDelete,
  onSignContract,
  onViewAuditTrail,
  onSendReminder,
}) => {
  const getStatusBadge = (status: Contract['status']) => {
    const statusConfig: Record<Contract['status'], { color: string; icon: any }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      pending_approval: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      sent_for_signature: { color: 'bg-purple-100 text-purple-800', icon: Clock },
      partially_signed: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      fully_signed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      executed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
      terminated: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      disputed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getSignatureStatus = (signatures: Contract['signatures']) => {
    const primarySigned = signatures.find(s => s.partyType === 'primary' && s.signedAt);
    const secondarySigned = signatures.find(s => s.partyType === 'secondary' && s.signedAt);
    const totalSignatures = signatures.filter(s => s.signedAt).length;
    const totalRequired = signatures.length;

    if (primarySigned && secondarySigned) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Fully Signed ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    } else if (primarySigned || secondarySigned) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <User className="h-3 w-3" />
            Partially Signed ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <Users className="h-3 w-3" />
            Pending ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    }
  };

  const canEdit = (contract: Contract) => {
    return contract.status === 'draft';
  };

  const canSendForSignature = (contract: Contract) => {
    return ['draft', 'approved'].includes(contract.status);
  };

  const canCancel = (contract: Contract) => {
    return ['sent_for_signature', 'partially_signed', 'pending_approval'].includes(contract.status);
  };

  const canDelete = (contract: Contract) => {
    return ['draft', 'cancelled', 'terminated'].includes(contract.status);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Contracts Found</CardTitle>
          <CardDescription>
            No contracts match your current filters. Try adjusting your search criteria.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Contracts</CardTitle>
        <CardDescription>
          {contracts.length} contract{contracts.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signatures</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract._id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{contract.title}</span>
                    <span className="text-xs text-muted-foreground">#{contract.contractNumber}</span>
                    {contract.terms.expirationDate && (
                      <span className="text-xs text-muted-foreground">
                        Expires: {new Date(contract.terms.expirationDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{contract.template.templateId}</span>
                    <span className="text-xs text-muted-foreground">
                      v{contract.template.templateVersion}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{contract.parties.primary.name}</span>
                    <span className="text-muted-foreground text-xs">{contract.parties.primary.email}</span>
                    <span className="font-medium mt-1">{contract.parties.secondary.name}</span>
                    <span className="text-muted-foreground text-xs">{contract.parties.secondary.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(contract.status)}
                </TableCell>
                <TableCell>
                  {getSignatureStatus(contract.signatures)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(contract.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(contract)}
                      title="View Contract"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {(contract.files?.generatedContract || contract.files?.signedContract) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDownload(contract)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canEdit(contract) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(contract)}
                        title="Edit Contract"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canSendForSignature(contract) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onSendForSignature(contract)}
                        title="Send for Signature"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Signature Management Actions */}
                    {contract.status === 'active' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onSignContract?.(contract, 'primary')}
                          title="Sign Contract (Primary)"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onViewAuditTrail?.(contract)}
                          title="View Signature Audit Trail"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        
                        {contract.signatures.some(s => !s.signedAt) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const unsignedSignature = contract.signatures.find(s => !s.signedAt);
                              if (unsignedSignature) {
                                onSendReminder?.(contract, unsignedSignature.partyType);
                              }
                            }}
                            title="Send Signature Reminder"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    
                    {canCancel(contract) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onCancel(contract)}
                        title="Cancel Contract"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canDelete(contract) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(contract)}
                        title="Delete Contract"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ContractsTable;