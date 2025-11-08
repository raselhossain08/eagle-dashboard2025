"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Download,
  Edit,
  Trash2,
  Eye,
  Copy,
  FileText,
  Layout,
  Search,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContractService } from "@/lib/services";
import { PlanService } from "@/lib/services/plans";
import TemplateCreationDialog from "@/components/dashboard/contracts/template-creation-dialog";
import TemplateViewDialog from "@/components/dashboard/contracts/template-view-dialog";
import type {
  ContractTemplate,
  CreateContractTemplateRequest,
} from "@/lib/services/contracts/contract.service";
import type { Plan } from "@/lib/services/plans/plan.service";

const ContractTemplatesManagement: React.FC = () => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ContractTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] =
    useState<ContractTemplate | null>(null);

  // Load templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await ContractService.getContractTemplates({
        category:
          selectedCategory !== "all" ? (selectedCategory as any) : undefined,
        status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        throw new Error(response.error || "Failed to load templates");
      }
    } catch (error: any) {
      console.error("Load templates error:", error);
      toast.error(error.message || "Failed to load contract templates");
    } finally {
      setLoading(false);
    }
  };

  // Load available plans
  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await PlanService.getPlans({
        page: 1,
        limit: 50,
        sortBy: "displayName",
        sortOrder: "asc",
        isActive: true,
      });

      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        throw new Error(response.error || "Failed to load plans");
      }
    } catch (error: any) {
      console.error("Load plans error:", error);
      toast.error(error.message || "Failed to load available plans");
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, selectedStatus, selectedPlan]);

  useEffect(() => {
    loadPlans();
  }, []);

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTemplates();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleViewTemplate = async (template: ContractTemplate) => {
    try {
      setTemplateLoading(true);

      // Fetch the complete template data
      const response = await ContractService.getContractTemplateById(
        template.id || template.templateId || template._id
      );

      if (response.success && response.data) {
        setViewingTemplate(response.data);
        setViewDialogOpen(true);
      } else {
        throw new Error(response.error || "Failed to load template details");
      }
    } catch (error: any) {
      console.error("View template error:", error);
      toast.error(error.message || `Failed to load template: ${template.name}`);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleEditTemplate = async (template: ContractTemplate) => {
    try {
      setTemplateLoading(true);

      // Fetch the complete template data for editing
      const response = await ContractService.getContractTemplateById(
        template.id || template.templateId || template._id
      );

      if (response.success && response.data) {
        setEditingTemplate(response.data);
        setDialogOpen(true);

        // Close view dialog if it's open
        if (viewDialogOpen) {
          setViewDialogOpen(false);
        }
      } else {
        throw new Error(response.error || "Failed to load template details");
      }
    } catch (error: any) {
      console.error("Edit template error:", error);
      toast.error(
        error.message || `Failed to load template for editing: ${template.name}`
      );
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateSubmit = async (data: CreateContractTemplateRequest) => {
    try {
      setFormLoading(true);

      // Validate required fields before submission
      if (!data.name?.trim()) {
        throw new Error("Template name is required");
      }

      if (!data.content?.body?.trim()) {
        throw new Error("Template content is required");
      }

      if (editingTemplate) {
        const response = await ContractService.updateContractTemplate(
          editingTemplate.id ||
            editingTemplate.templateId ||
            editingTemplate._id,
          data
        );
        if (response.success) {
          toast.success("Template updated successfully");
          loadTemplates();
          setDialogOpen(false);
          setEditingTemplate(null);
        } else {
          throw new Error(response.error || "Failed to update template");
        }
      } else {
        const response = await ContractService.createContractTemplate(data);
        if (response.success) {
          toast.success("Template created successfully");
          loadTemplates();
          setDialogOpen(false);
        } else {
          throw new Error(response.error || "Failed to create template");
        }
      }
    } catch (error: any) {
      console.error("Template submit error:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to save template";

      if (
        error.message?.includes("name") &&
        error.message?.includes("required")
      ) {
        errorMessage = "Template name is required";
      } else if (error.message?.includes("validation")) {
        errorMessage = "Please check all required fields are filled correctly";
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === "all") {
      toast.success("Showing all contract templates");
    } else {
      const selectedPlanData = plans.find((p) => p._id === planId);
      if (selectedPlanData) {
        toast.success(`Filtered by plan: ${selectedPlanData.displayName}`);
      }
    }
  };

  const handleCloneTemplate = (template: ContractTemplate) => {
    toast.info(`Clone template: ${template.name}`);
  };

  const handleDeleteTemplate = (template: ContractTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      toast.info(`Delete template: ${template.name}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      draft: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
      archived: { color: "bg-gray-100 text-gray-800", label: "Archived" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      investment_agreement: {
        color: "bg-blue-100 text-blue-800",
        label: "Investment",
      },
      service_agreement: {
        color: "bg-purple-100 text-purple-800",
        label: "Service",
      },
      nda: { color: "bg-red-100 text-red-800", label: "NDA" },
      employment_contract: {
        color: "bg-orange-100 text-orange-800",
        label: "Employment",
      },
      consulting_agreement: {
        color: "bg-teal-100 text-teal-800",
        label: "Consulting",
      },
      custom: { color: "bg-gray-100 text-gray-800", label: "Custom" },
    };

    const config =
      categoryConfig[category as keyof typeof categoryConfig] ||
      categoryConfig.custom;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (planId: string) => {
    const plan = plans.find((p: Plan) => p._id === planId);
    if (!plan) return null;

    const planTypeConfig: Record<string, { color: string; label: string }> = {
      subscription: {
        color: "bg-green-100 text-green-800",
        label: plan.displayName,
      },
      mentorship: {
        color: "bg-blue-100 text-blue-800",
        label: plan.displayName,
      },
      script: {
        color: "bg-purple-100 text-purple-800",
        label: plan.displayName,
      },
      addon: {
        color: "bg-orange-100 text-orange-800",
        label: plan.displayName,
      },
    };

    const config = planTypeConfig[plan.planType] || {
      color: "bg-gray-100 text-gray-800",
      label: plan.displayName,
    };

    return (
      <Badge variant="outline" className={config.color}>
        <CreditCard className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredTemplates = templates.filter((template: ContractTemplate) => {
    const matchesSearch =
      searchTerm === "" ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.templateId.toLowerCase().includes(searchTerm.toLowerCase());

    // Note: Plan filtering could be implemented when the backend supports plan associations
    // For now, we just show all templates regardless of plan selection

    return matchesSearch;
  });
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Contract Templates
          </h1>
          <p className="text-muted-foreground">
            Manage and create contract templates for your organization
            {selectedPlan !== "all" &&
              plans.find((p) => p._id === selectedPlan) && (
                <span className="text-blue-600 ml-2">
                  • Filtered by{" "}
                  {plans.find((p) => p._id === selectedPlan)?.displayName}
                </span>
              )}
          </p>
        </div>
        <Button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Templates
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              All contract templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Templates
            </CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Templates
            </CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.status === "draft").length}
            </div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Plans
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedPlan !== "all"
                ? `Filtered by ${
                    plans.find((p) => p._id === selectedPlan)?.displayName ||
                    "Unknown"
                  }`
                : "All available plans"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(templates.map((t) => t.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different types</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="investment_agreement">
                  Investment Agreement
                </SelectItem>
                <SelectItem value="service_agreement">
                  Service Agreement
                </SelectItem>
                <SelectItem value="nda">NDA</SelectItem>
                <SelectItem value="employment_contract">Employment</SelectItem>
                <SelectItem value="consulting_agreement">Consulting</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPlan} onValueChange={handlePlanSelection}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plansLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading plans...
                  </SelectItem>
                ) : (
                  plans.map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.displayName} ({plan.planType})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
          <CardDescription>
            Manage your contract templates library
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No templates
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new contract template.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Template ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Associated Plan</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow
                    key={template.id || template.templateId || template._id}
                  >
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {template.templateId}
                      </code>
                    </TableCell>
                    <TableCell>{getCategoryBadge(template.category)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">v{template.versionString}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(template.status)}</TableCell>
                    <TableCell>{template.language}</TableCell>
                    <TableCell>
                      {selectedPlan !== "all" &&
                      plans.find((p) => p._id === selectedPlan) ? (
                        getPlanBadge(selectedPlan)
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-600"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          No Plan Associated
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCloneTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
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

      {/* Template Creation/Edit Dialog */}
      <TemplateCreationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSubmit={handleTemplateSubmit}
        loading={formLoading}
        plans={plans}
        plansLoading={plansLoading}
      />

      {/* Template View Dialog */}
      <TemplateViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        template={viewingTemplate}
      />
    </div>
  );
};

export default ContractTemplatesManagement;
