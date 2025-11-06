
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye,
  Download,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';


interface ContractsTableProps {
  contracts: any[];
  loading: boolean;
  onView: (contract: any) => void;
  onEdit?: (contract: any) => void;
  onDownload: (contract: any) => void;
  onSendForSignature?: (contract: any) => void;
  onCancel?: (contract: any) => void;
  onDelete: (contract: any) => void;
  onSignContract?: (contract: any, partyType: 'primary' | 'secondary' | 'additional', partyIndex?: number) => void;
  onViewAuditTrail?: (contract: any) => void;
  onSendReminder?: (contract: any, partyType: string, partyIndex?: number) => void;
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
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
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
      payment_pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    // Provide a default config for unknown status values
    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800',
      icon: AlertCircle
    };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status ? status.replace(/_/g, ' ') : 'Unknown'}
      </Badge>
    );
  };

  const getSignatureStatus = (signatures: any[]) => {
    const primarySigned = signatures.find((s: any) => s.partyType === 'primary' && s.signedAt);
    const secondarySigned = signatures.find((s: any) => s.partyType === 'secondary' && s.signedAt);
    const totalSignatures = signatures.filter((s: any) => s.signedAt).length;
    const totalRequired = signatures.length;

    if (primarySigned && secondarySigned) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Fully Signed ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    } else if (primarySigned || secondarySigned) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Partially Signed ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    }
  };

  const canEdit = (contract: any) => {
    return contract.status === 'draft';
  };

  const canSendForSignature = (contract: any) => {
    return ['draft', 'approved'].includes(contract.status);
  };

  const canCancel = (contract: any) => {
    return ['sent_for_signature', 'partially_signed', 'pending_approval'].includes(contract.status);
  };

  const canDelete = (contract: any) => {
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
            {contracts.map((contract: any) => (
              <TableRow key={contract._id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{contract.contractTitle || contract.title || 'Untitled'}</span>
                    <span className="text-xs text-muted-foreground">#{contract._id?.slice(-8) || contract.contractNumber || 'N/A'}</span>
                    {contract.subscriptionEndDate && (
                      <span className="text-xs text-muted-foreground">
                        Expires: {new Date(contract.subscriptionEndDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{contract.productType || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">
                      {contract.subscriptionType || ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{contract.name || 'N/A'}</span>
                    <span className="text-muted-foreground text-xs">{contract.email || ''}</span>
                    {contract.phone && (
                      <span className="text-muted-foreground text-xs mt-1">{contract.phone}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(contract.status)}
                </TableCell>
                <TableCell>
                  {contract.signature ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Unsigned
                    </Badge>
                  )}
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

                    {contract.signature && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(contract)}
                        title="Download Contract"
                      >
                        <Download className="h-4 w-4" />
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