import React from 'react';
import { Search, Plus, Filter, Download, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContractsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedTemplate: string;
  onTemplateChange: (value: string) => void;
  selectedLocale: string;
  onLocaleChange: (value: string) => void;
  onCreateClick: () => void;
  onExportClick: () => void;
  totalCount: number;
}

const ContractsHeader: React.FC<ContractsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedTemplate,
  onTemplateChange,
  selectedLocale,
  onLocaleChange,
  onCreateClick,
  onExportClick,
  totalCount,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts Management</h1>
          <p className="text-muted-foreground">
            Manage contracts, track signatures, and monitor contract lifecycle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onExportClick}>
            <Download className="mr-2 h-4 w-4" />
            Export Contracts
          </Button>
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Contract
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Contract Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_signature">Pending Signature</SelectItem>
              <SelectItem value="partially_signed">Partially Signed</SelectItem>
              <SelectItem value="fully_signed">Fully Signed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTemplate} onValueChange={onTemplateChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {/* Template options will be populated dynamically */}
            </SelectContent>
          </Select>

          <Select value={selectedLocale} onValueChange={onLocaleChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {totalCount} contract{totalCount !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
};

export default ContractsHeader;