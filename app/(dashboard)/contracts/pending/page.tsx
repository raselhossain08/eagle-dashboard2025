
"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock, FileX, Mail, Calendar, User, AlertTriangle, Eye, Send, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractService, { Contract } from '@/lib/services/contracts';

const PendingContracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Load pending contracts
  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await ContractService.getContracts({
        status: 'sent_for_signature',
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setContracts(response.data);
      } else {
        throw new Error(response.error || 'Failed to load pending contracts');
      }
    } catch (error: any) {
      console.error('Load contracts error:', error);
      toast.error(error.message || 'Failed to load pending contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContracts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSendReminder = async (contractId: string) => {
    try {
      const response = await ContractService.sendSignatureReminder(contractId, 'signature_reminder');
      if (response.success) {
        toast.success('Reminder sent successfully');
      } else {
        throw new Error(response.error || 'Failed to send reminder');
      }
    } catch (error: any) {
      console.error('Send reminder error:', error);
      toast.error(error.message || 'Failed to send reminder');
    }
  };

  const handleViewContract = (contract: Contract) => {
    toast.info(`View contract: ${contract.contractNumber}`);
  };

  const handleCancelContract = (contract: Contract) => {
    if (confirm(`Are you sure you want to cancel contract ${contract.contractNumber}?`)) {
      toast.info(`Cancel contract: ${contract.contractNumber}`);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800', label: 'High' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      low: { color: 'bg-green-100 text-green-800', label: 'Low' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      investment_agreement: { color: 'bg-blue-100 text-blue-800', label: 'Investment' },
      service_agreement: { color: 'bg-purple-100 text-purple-800', label: 'Service' },
      nda: { color: 'bg-red-100 text-red-800', label: 'NDA' },
      employment_contract: { color: 'bg-orange-100 text-orange-800', label: 'Employment' },
      consulting_agreement: { color: 'bg-teal-100 text-teal-800', label: 'Consulting' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { color: 'bg-gray-100 text-gray-800', label: 'Other' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getDaysOverdue = (dueDate: Date): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOverdueBadge = (dueDate: Date) => {
    const daysOverdue = getDaysOverdue(dueDate);
    
    if (daysOverdue > 0) {
      return (
        <Badge className="bg-red-100 text-red-800">
          {daysOverdue} days overdue
        </Badge>
      );
    } else if (daysOverdue > -3) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Due soon
        </Badge>
      );
    }
    return null;
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === '' || 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.parties.primary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.parties.primary.email && contract.parties.primary.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Group contracts by urgency (using expirationDate from terms)
  const overdueContracts = filteredContracts.filter(c => {
    if (!c.terms.expirationDate) return false;
    return getDaysOverdue(new Date(c.terms.expirationDate)) > 0;
  });
  
  const dueSoonContracts = filteredContracts.filter(c => {
    if (!c.terms.expirationDate) return false;
    const days = getDaysOverdue(new Date(c.terms.expirationDate));
    return days <= 0 && days > -3;
  });
  
  const allPendingContracts = filteredContracts;

  const contractStats = {
    total: contracts.length,
    overdue: overdueContracts.length,
    dueSoon: dueSoonContracts.length,
    high: 0, // Priority not available in Contract interface
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pending Contracts</h1>
          <p className="text-muted-foreground">
            Monitor contracts awaiting signatures and take action on overdue items
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting signatures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{contractStats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{contractStats.dueSoon}</div>
            <p className="text-xs text-muted-foreground">
              Due within 3 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <User className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{contractStats.high}</div>
            <p className="text-xs text-muted-foreground">
              Urgent attention needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Pending ({allPendingContracts.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueContracts.length})</TabsTrigger>
          <TabsTrigger value="due-soon">Due Soon ({dueSoonContracts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by contract number, client name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button variant="outline" className="w-[150px]">
                  All Priorities
                </Button>

                <Button variant="outline" className="w-[180px]">
                  All Types
                </Button>
              </div>
            </CardContent>
          </Card>

          <PendingContractsTable 
            contracts={allPendingContracts}
            loading={loading}
            onSendReminder={handleSendReminder}
            onViewContract={handleViewContract}
            onCancelContract={handleCancelContract}
            getPriorityBadge={getPriorityBadge}
            getTypeBadge={getTypeBadge}
            getOverdueBadge={getOverdueBadge}
          />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <PendingContractsTable 
            contracts={overdueContracts}
            loading={loading}
            onSendReminder={handleSendReminder}
            onViewContract={handleViewContract}
            onCancelContract={handleCancelContract}
            getPriorityBadge={getPriorityBadge}
            getTypeBadge={getTypeBadge}
            getOverdueBadge={getOverdueBadge}
            showUrgent={true}
          />
        </TabsContent>

        <TabsContent value="due-soon" className="space-y-4">
          <PendingContractsTable 
            contracts={dueSoonContracts}
            loading={loading}
            onSendReminder={handleSendReminder}
            onViewContract={handleViewContract}
            onCancelContract={handleCancelContract}
            getPriorityBadge={getPriorityBadge}
            getTypeBadge={getTypeBadge}
            getOverdueBadge={getOverdueBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Separate component for the table to reduce duplication
interface PendingContractsTableProps {
  contracts: Contract[];
  loading: boolean;
  onSendReminder: (contractId: string) => void;
  onViewContract: (contract: Contract) => void;
  onCancelContract: (contract: Contract) => void;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTypeBadge: (type: string) => React.ReactNode;
  getOverdueBadge: (dueDate: Date) => React.ReactNode;
  showUrgent?: boolean;
}

const PendingContractsTable: React.FC<PendingContractsTableProps> = ({
  contracts,
  loading,
  onSendReminder,
  onViewContract,
  onCancelContract,
  getPriorityBadge,
  getTypeBadge,
  getOverdueBadge,
  showUrgent = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showUrgent ? 'Urgent Action Required' : 'Pending Contracts'} ({contracts.length})
        </CardTitle>
        <CardDescription>
          {showUrgent 
            ? 'These contracts are overdue and need immediate attention'
            : 'Contracts awaiting client signatures'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading pending contracts...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending contracts</h3>
            <p className="mt-1 text-sm text-gray-500">
              {showUrgent 
                ? 'No overdue contracts requiring urgent attention.'
                : 'All contracts have been signed or there are no contracts awaiting signatures.'
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract._id} className={showUrgent ? 'bg-red-50' : ''}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.contractNumber}</div>
                      <div className="text-sm text-gray-500">{contract.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.parties.primary.name}</div>
                      <div className="text-sm text-gray-500">{contract.parties.primary.email || 'No email'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Contract
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Medium
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {contract.terms.expirationDate 
                          ? new Date(contract.terms.expirationDate).toLocaleDateString()
                          : 'No expiration'
                        }
                      </div>
                      {contract.terms.expirationDate && getOverdueBadge(new Date(contract.terms.expirationDate))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending Signature
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewContract(contract)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSendReminder(contract._id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelContract(contract)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
};

export default PendingContracts;