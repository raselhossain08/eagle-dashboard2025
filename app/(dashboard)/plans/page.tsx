
"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Download } from 'lucide-react';
import PlansHeader from '@/components/dashboard/plans/plans-header';
import PlansTable from '@/components/dashboard/plans/plans-table';
import PlanFormDialog from '@/components/dashboard/plans/plan-form-dialog';
import { QuickEditDialog } from '@/components/dashboard/plans/quick-edit-dialog';
import { PlanService } from '@/lib/services';
import type { 
  Plan, 
  CreatePlanRequest, 
  UpdatePlanRequest, 
  GetPlansParams 
} from '@/lib/services/plans/plan.service';

const PlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Quick edit state
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [quickEditPlan, setQuickEditPlan] = useState<Plan | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<GetPlansParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Load plans
  const loadPlans = async () => {
    try {
      setLoading(true);
      
      const queryParams: GetPlansParams = {
        ...filters,
        ...(selectedType !== 'all' && { planType: selectedType as any }),
        ...(selectedCategory !== 'all' && { category: selectedCategory as any }),
        ...(selectedStatus === 'active' && { isActive: true }),
        ...(selectedStatus === 'inactive' && { isActive: false }),
        ...(selectedStatus === 'featured' && { isFeatured: true }),
        ...(selectedStatus === 'popular' && { isPopular: true }),
      };

      const response = await PlanService.getPlans(queryParams);
      
      if (response.success && response.data) {
        setPlans(response.data);
        setTotalCount(response.pagination?.total || response.data.length);
      } else {
        throw new Error(response.error || 'Failed to load plans');
      }
    } catch (error: any) {
      console.error('Load plans error:', error);
      toast.error(error.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPlans();
  }, [filters, selectedType, selectedCategory, selectedStatus]);

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        // Implement client-side search for now
        const filtered = plans.filter(plan =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPlans(filtered);
        setTotalCount(filtered.length);
      } else {
        loadPlans();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handlers
  const handleCreatePlan = async (data: CreatePlanRequest) => {
    try {
      setFormLoading(true);
      const response = await PlanService.createPlan(data);
      
      if (response.success) {
        toast.success('Plan created successfully');
        loadPlans();
        setFormOpen(false);
      } else {
        throw new Error(response.error || 'Failed to create plan');
      }
    } catch (error: any) {
      console.error('Create plan error:', error);
      toast.error(error.message || 'Failed to create plan');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePlan = async (data: UpdatePlanRequest) => {
    if (!editingPlan) return;
    
    try {
      setFormLoading(true);
      const response = await PlanService.updatePlan(editingPlan._id, data);
      
      if (response.success) {
        toast.success('Plan updated successfully');
        loadPlans();
        setFormOpen(false);
        setEditingPlan(null);
      } else {
        throw new Error(response.error || 'Failed to update plan');
      }
    } catch (error: any) {
      console.error('Update plan error:', error);
      toast.error(error.message || 'Failed to update plan');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleView = (plan: Plan) => {
    // Implement view functionality (maybe a read-only modal)
    console.log('View plan:', plan);
    toast.info('View functionality coming soon');
  };

  const handleQuickEdit = (plan: Plan) => {
    setQuickEditPlan(plan);
    setQuickEditOpen(true);
  };

  const handleDuplicate = async (plan: Plan) => {
    try {
      const response = await PlanService.duplicatePlan(plan._id, {
        name: `${plan.name}-copy`,
        displayName: `${plan.displayName} (Copy)`,
      });
      
      if (response.success) {
        toast.success('Plan duplicated successfully');
        loadPlans();
      } else {
        throw new Error(response.error || 'Failed to duplicate plan');
      }
    } catch (error: any) {
      console.error('Duplicate plan error:', error);
      toast.error(error.message || 'Failed to duplicate plan');
    }
  };

  const handleToggleFeatured = async (plan: Plan) => {
    try {
      const response = await PlanService.toggleFeaturedPlan(plan._id);
      
      if (response.success) {
        toast.success(`Plan ${plan.isFeatured ? 'removed from' : 'added to'} featured`);
        loadPlans();
      } else {
        throw new Error(response.error || 'Failed to toggle featured status');
      }
    } catch (error: any) {
      console.error('Toggle featured error:', error);
      toast.error(error.message || 'Failed to toggle featured status');
    }
  };

  const handleTogglePopular = async (plan: Plan) => {
    try {
      const response = await PlanService.togglePopularPlan(plan._id);
      
      if (response.success) {
        toast.success(`Plan ${plan.isPopular ? 'removed from' : 'added to'} popular`);
        loadPlans();
      } else {
        throw new Error(response.error || 'Failed to toggle popular status');
      }
    } catch (error: any) {
      console.error('Toggle popular error:', error);
      toast.error(error.message || 'Failed to toggle popular status');
    }
  };

  const handleToggleArchive = async (plan: Plan) => {
    try {
      const response = await PlanService.toggleArchivePlan(plan._id);
      
      if (response.success) {
        toast.success(`Plan ${plan.isActive ? 'archived' : 'restored'}`);
        loadPlans();
      } else {
        throw new Error(response.error || 'Failed to toggle archive status');
      }
    } catch (error: any) {
      console.error('Toggle archive error:', error);
      toast.error(error.message || 'Failed to toggle archive status');
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete "${plan.displayName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await PlanService.deletePlan(plan._id, true); // Permanent delete
      
      if (response.success) {
        toast.success('Plan deleted successfully');
        loadPlans();
      } else {
        throw new Error(response.error || 'Failed to delete plan');
      }
    } catch (error: any) {
      console.error('Delete plan error:', error);
      toast.error(error.message || 'Failed to delete plan');
    }
  };

  const handleExport = async () => {
    try {
      // Export functionality - for now just download as JSON
      const dataStr = JSON.stringify(plans, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `plans-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Plans exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export plans');
    }
  };

  const handleFormSubmit = async (data: CreatePlanRequest | UpdatePlanRequest) => {
    if (editingPlan) {
      return handleUpdatePlan(data as UpdatePlanRequest);
    } else {
      return handleCreatePlan(data as CreatePlanRequest);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <PlansHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onCreateClick={() => setFormOpen(true)}
        onExportClick={handleExport}
        totalCount={totalCount}
      />

      <PlansTable
        plans={plans}
        loading={loading}
        onEdit={handleEdit}
        onQuickEdit={handleQuickEdit}
        onView={handleView}
        onDuplicate={handleDuplicate}
        onToggleFeatured={handleToggleFeatured}
        onTogglePopular={handleTogglePopular}
        onToggleArchive={handleToggleArchive}
        onDelete={handleDelete}
      />

      <PlanFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        plan={editingPlan}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      <QuickEditDialog
        open={quickEditOpen}
        onOpenChange={setQuickEditOpen}
        plan={quickEditPlan}
        onSuccess={() => {
          loadPlans();
          toast.success('Plan updated successfully');
        }}
      />
    </div>
  );
};

export default PlansManagement;