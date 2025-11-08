"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileUp,
  Loader2,
  Eye,
  Code,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ContractTemplate,
  CreateContractTemplateRequest,
} from "@/lib/services/contracts/contract.service";
import type { Plan } from "@/lib/services/plans/plan.service";

interface TemplateCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContractTemplateRequest) => Promise<void>;
  loading: boolean;
  template?: ContractTemplate | null;
  plans?: Plan[];
  plansLoading?: boolean;
}

interface TemplateVariable {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "boolean"
    | "select"
    | "textarea"
    | "email"
    | "phone"
    | "currency";
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description?: string;
  placeholder?: string;
  group?: string;
}

const TemplateCreationDialog: React.FC<TemplateCreationDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
  template,
  plans = [],
  plansLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState("basic");
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("none");

  // Form data
  const [formData, setFormData] = useState<CreateContractTemplateRequest>({
    name: template?.name || "",
    category: template?.category || "custom",
    locale: template?.locale || "en-US",
    status: template?.status || "draft", // Add status field with default to draft
    content: {
      body: template?.content.body || "",
      htmlBody: template?.content.htmlBody || "",
      variables: template?.content.variables || [],
    },
    metadata: {
      title: template?.metadata?.title || "",
      description: template?.metadata?.description || "",
      tags: template?.metadata?.tags || [],
      keywords: template?.metadata?.keywords || [],
      author: template?.metadata?.author || "",
      jurisdiction: template?.metadata?.jurisdiction || "",
      applicableLaw: template?.metadata?.applicableLaw || "",
    },
    legal: {
      requiresSignature: template?.legal?.requiresSignature ?? true,
      signatureType: template?.legal?.signatureType || "electronic",
      witnessRequired: template?.legal?.witnessRequired ?? false,
      notarizationRequired: template?.legal?.notarizationRequired ?? false,
      retentionPeriod: template?.legal?.retentionPeriod,
      complianceNotes: template?.legal?.complianceNotes || "",
    },
  });

  const [variables, setVariables] = useState<TemplateVariable[]>(
    template?.content.variables || []
  );
  const [tags, setTags] = useState<string[]>(template?.metadata?.tags || []);
  const [keywords, setKeywords] = useState<string[]>(
    template?.metadata?.keywords || []
  );
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  // Reset form data when template changes
  useEffect(() => {
    const newFormData: CreateContractTemplateRequest = {
      name: template?.name || "",
      category: template?.category || "custom",
      locale: template?.locale || "en-US",
      status: template?.status || "draft", // Add status field
      content: {
        body: template?.content.body || "",
        htmlBody: template?.content.htmlBody || "",
        variables: template?.content.variables || [],
      },
      metadata: {
        title: template?.metadata?.title || "",
        description: template?.metadata?.description || "",
        tags: template?.metadata?.tags || [],
        keywords: template?.metadata?.keywords || [],
        author: template?.metadata?.author || "",
        jurisdiction: template?.metadata?.jurisdiction || "",
        applicableLaw: template?.metadata?.applicableLaw || "",
      },
      legal: {
        requiresSignature: template?.legal?.requiresSignature ?? true,
        signatureType: template?.legal?.signatureType || "electronic",
        witnessRequired: template?.legal?.witnessRequired ?? false,
        notarizationRequired: template?.legal?.notarizationRequired ?? false,
        retentionPeriod: template?.legal?.retentionPeriod,
        complianceNotes: template?.legal?.complianceNotes || "",
      },
    };

    setFormData(newFormData);
    setVariables(template?.content.variables || []);
    setTags(template?.metadata?.tags || []);
    setKeywords(template?.metadata?.keywords || []);

    // Reset other form-related states
    setUploadedFile(null);
    setCurrentTab("basic");
  }, [template]);

  // Handle file upload and text extraction
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    setUploadedFile(file);
    setExtracting(true);

    try {
      const text = await extractTextFromFile(file);

      setFormData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          body: text,
        },
      }));

      toast.success("File content extracted successfully");
    } catch (error) {
      console.error("File extraction error:", error);
      toast.error("Failed to extract text from file");
    } finally {
      setExtracting(false);
    }
  };

  // Extract text from different file types
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result;

          if (file.type === "text/plain") {
            resolve(content as string);
          } else if (file.type === "application/pdf") {
            // For PDF, we'd typically use pdf.js or a backend service
            // For now, show a message that PDF extraction needs backend
            toast.info(
              "PDF extraction requires backend processing. Using basic extraction..."
            );
            resolve("PDF content will be extracted by the backend service.");
          } else if (
            file.type === "application/msword" ||
            file.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            // For DOC/DOCX, we'd typically use mammoth.js or a backend service
            toast.info(
              "Word document extraction requires backend processing. Using basic extraction..."
            );
            resolve(
              "Word document content will be extracted by the backend service."
            );
          } else {
            // Fallback for other types
            resolve(content as string);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));

      if (file.type === "text/plain") {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Variable management
  const addVariable = () => {
    const newVariable: TemplateVariable = {
      name: `variable_${variables.length + 1}`,
      label: "New Variable",
      type: "text",
      required: false,
      description: "",
      placeholder: "",
    };
    setVariables([...variables, newVariable]);
  };

  const updateVariable = (
    index: number,
    field: keyof TemplateVariable,
    value: any
  ) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Keyword management
  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const submitData: CreateContractTemplateRequest = {
        ...formData,
        content: {
          ...formData.content,
          variables: variables,
        },
        metadata: {
          ...formData.metadata,
          tags,
          keywords,
        },
      };

      // Log the selected plan for debugging and future backend integration
      if (selectedPlan !== "none") {
        console.log("Template will be associated with plan:", selectedPlan);
        // TODO: When backend supports plan association, include selectedPlan in the submission
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl xl:max-w-7xl h-[95vh] overflow-y-auto overflow-x-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            {template ? "Edit Contract Template" : "Create Contract Template"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {template
              ? "Update the contract template with new information"
              : "Create a new contract template for your organization"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm">
              Content
            </TabsTrigger>
            <TabsTrigger value="variables" className="text-xs sm:text-sm">
              Variables
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs sm:text-sm">
              Legal & Metadata
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 overflow-y-auto">
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 sm:space-y-6 p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Template Information
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Basic details about your contract template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm sm:text-base">
                        Template Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                        }}
                        placeholder="e.g., Standard Service Agreement"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">
                        Template ID
                      </Label>
                      <div className="bg-gray-50 border rounded-md px-3 py-2">
                        <code className="text-sm text-gray-600">
                          {template?.templateId || "Auto-generated on creation"}
                        </code>
                      </div>
                      <p className="text-xs text-gray-500">
                        Template ID will be automatically generated when you
                        create the template
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="text-sm sm:text-base"
                      >
                        Category
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="investment_agreement">
                            Investment Agreement
                          </SelectItem>
                          <SelectItem value="service_agreement">
                            Service Agreement
                          </SelectItem>
                          <SelectItem value="nda">NDA</SelectItem>
                          <SelectItem value="terms_of_service">
                            Terms of Service
                          </SelectItem>
                          <SelectItem value="privacy_policy">
                            Privacy Policy
                          </SelectItem>
                          <SelectItem value="advisory_agreement">
                            Advisory Agreement
                          </SelectItem>
                          <SelectItem value="subscription_agreement">
                            Subscription Agreement
                          </SelectItem>
                          <SelectItem value="partnership_agreement">
                            Partnership Agreement
                          </SelectItem>
                          <SelectItem value="employment_contract">
                            Employment Contract
                          </SelectItem>
                          <SelectItem value="consulting_agreement">
                            Consulting Agreement
                          </SelectItem>
                          <SelectItem value="license_agreement">
                            License Agreement
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locale" className="text-sm sm:text-base">
                        Locale
                      </Label>
                      <Input
                        id="locale"
                        value={formData.locale}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            locale: e.target.value,
                          }))
                        }
                        placeholder="e.g., en-US"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm sm:text-base">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              Draft
                            </div>
                          </SelectItem>
                          <SelectItem value="review">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                              Under Review
                            </div>
                          </SelectItem>
                          <SelectItem value="approved">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                              Approved
                            </div>
                          </SelectItem>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="deprecated">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                              Deprecated
                            </div>
                          </SelectItem>
                          <SelectItem value="archived">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                              Archived
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {formData.status === "draft" &&
                          "Template is in draft mode and can be edited freely"}
                        {formData.status === "review" &&
                          "Template is under review by administrators"}
                        {formData.status === "approved" &&
                          "Template has been approved but not yet activated"}
                        {formData.status === "active" &&
                          "Template is live and available for use"}
                        {formData.status === "deprecated" &&
                          "Template is deprecated and should not be used for new contracts"}
                        {formData.status === "archived" &&
                          "Template is archived and cannot be used"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="locale-help"
                        className="text-sm sm:text-base text-transparent"
                      >
                        Placeholder
                      </Label>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-400 mt-0.5 shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Status Guidelines
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              <strong>Draft → Active:</strong> Ready templates
                              can be set to active directly.
                              <br />
                              <strong>Review Process:</strong> Use
                              review/approved for formal approval workflow.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="associatedPlan"
                      className="text-sm sm:text-base flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Associated Plan
                    </Label>
                    <Select
                      value={selectedPlan}
                      onValueChange={setSelectedPlan}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            plansLoading
                              ? "Loading plans..."
                              : "Select a plan (optional)"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          No Plan Association
                        </SelectItem>
                        {plansLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading available plans...
                          </SelectItem>
                        ) : (
                          plans.map((plan) => (
                            <SelectItem key={plan._id} value={plan._id}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {plan.planType}
                                </Badge>
                                {plan.displayName}
                                {plan.pricing?.monthly?.price && (
                                  <span className="text-xs text-muted-foreground">
                                    (${plan.pricing.monthly.price}/mo)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedPlan !== "none" &&
                      plans.find((p) => p._id === selectedPlan) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                {
                                  plans.find((p) => p._id === selectedPlan)
                                    ?.displayName
                                }
                              </p>
                              <p className="text-xs text-blue-700 mt-1">
                                {
                                  plans.find((p) => p._id === selectedPlan)
                                    ?.description
                                }
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {
                                    plans.find((p) => p._id === selectedPlan)
                                      ?.planType
                                  }
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {
                                    plans.find((p) => p._id === selectedPlan)
                                      ?.category
                                  }
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base">
                      Metadata Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.metadata?.title || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, title: e.target.value },
                        }))
                      }
                      placeholder="Public-facing title for this template"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm sm:text-base"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.metadata?.description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Describe what this template is used for..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 sm:space-y-6 p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Template Content
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    The main body of your contract template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload Section */}
                  <div className="space-y-3">
                    <Label className="text-sm sm:text-base">
                      Import from File (Optional)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={extracting}
                        className="w-full sm:w-auto"
                      >
                        {extracting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                          </>
                        )}
                      </Button>

                      {uploadedFile && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md w-full sm:w-auto">
                          <FileUp className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {uploadedFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX, TXT. Content will be
                      automatically extracted.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body" className="text-sm sm:text-base">
                      Template Body <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="body"
                      value={formData.content.body}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          content: { ...prev.content, body: e.target.value },
                        }));
                      }}
                      placeholder="Enter your contract template content here. Use {{variable_name}} for dynamic fields..."
                      rows={15}
                      className="font-mono text-xs sm:text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use double curly braces for variables:{" "}
                      {`{{variable_name}}`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="htmlBody" className="text-sm sm:text-base">
                      HTML Body (Optional)
                    </Label>
                    <Textarea
                      id="htmlBody"
                      value={formData.content.htmlBody || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            htmlBody: e.target.value,
                          },
                        }))
                      }
                      placeholder="<p>Optional HTML version of the template...</p>"
                      rows={8}
                      className="font-mono text-xs sm:text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent
              value="variables"
              className="space-y-4 sm:space-y-6 p-1"
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        Template Variables
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Define dynamic fields that will be filled in when
                        creating contracts
                      </CardDescription>
                    </div>
                    <Button
                      onClick={addVariable}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variable
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variables.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm sm:text-base">
                        No variables defined yet
                      </p>
                      <p className="text-xs sm:text-sm">
                        Add variables to make your template dynamic
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variables.map((variable, index) => (
                        <Card key={index} className="border-2">
                          <CardContent className="pt-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  Variable {index + 1}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVariable(index)}
                                  className="h-8 w-8 p-0 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs sm:text-sm">
                                    Variable Name{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    value={variable.name}
                                    onChange={(e) => {
                                      updateVariable(
                                        index,
                                        "name",
                                        e.target.value
                                          .toLowerCase()
                                          .replace(/\s+/g, "_")
                                      );
                                    }}
                                    placeholder="e.g., client_name"
                                    className="text-sm"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs sm:text-sm">
                                    Label{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    value={variable.label}
                                    onChange={(e) => {
                                      updateVariable(
                                        index,
                                        "label",
                                        e.target.value
                                      );
                                    }}
                                    placeholder="e.g., Client Name"
                                    className="text-sm"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs sm:text-sm">
                                    Type
                                  </Label>
                                  <Select
                                    value={variable.type}
                                    onValueChange={(value: any) =>
                                      updateVariable(index, "type", value)
                                    }
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="number">
                                        Number
                                      </SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="boolean">
                                        Boolean
                                      </SelectItem>
                                      <SelectItem value="select">
                                        Select
                                      </SelectItem>
                                      <SelectItem value="textarea">
                                        Textarea
                                      </SelectItem>
                                      <SelectItem value="email">
                                        Email
                                      </SelectItem>
                                      <SelectItem value="phone">
                                        Phone
                                      </SelectItem>
                                      <SelectItem value="currency">
                                        Currency
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs sm:text-sm">
                                    Placeholder
                                  </Label>
                                  <Input
                                    value={variable.placeholder || ""}
                                    onChange={(e) =>
                                      updateVariable(
                                        index,
                                        "placeholder",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Placeholder text..."
                                    className="text-sm"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs sm:text-sm">
                                    Group (Optional)
                                  </Label>
                                  <Input
                                    value={variable.group || ""}
                                    onChange={(e) =>
                                      updateVariable(
                                        index,
                                        "group",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., Client Information"
                                    className="text-sm"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs sm:text-sm">
                                  Description
                                </Label>
                                <Textarea
                                  value={variable.description || ""}
                                  onChange={(e) =>
                                    updateVariable(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Describe this variable..."
                                  rows={2}
                                  className="text-sm resize-none"
                                />
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`required_${index}`}
                                    checked={variable.required}
                                    onChange={(e) =>
                                      updateVariable(
                                        index,
                                        "required",
                                        e.target.checked
                                      )
                                    }
                                    className="rounded"
                                  />
                                  <Label
                                    htmlFor={`required_${index}`}
                                    className="text-xs sm:text-sm cursor-pointer"
                                  >
                                    Required field
                                  </Label>
                                </div>
                              </div>

                              {variable.type === "select" && (
                                <div className="space-y-1">
                                  <Label className="text-xs sm:text-sm">
                                    Options (comma-separated)
                                  </Label>
                                  <Input
                                    value={variable.options?.join(", ") || ""}
                                    onChange={(e) =>
                                      updateVariable(
                                        index,
                                        "options",
                                        e.target.value
                                          .split(",")
                                          .map((s: string) => s.trim())
                                      )
                                    }
                                    placeholder="Option 1, Option 2, Option 3"
                                    className="text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Legal & Metadata Tab */}
            <TabsContent value="legal" className="space-y-4 sm:space-y-6 p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Legal Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">
                        Signature Type
                      </Label>
                      <Select
                        value={formData.legal?.signatureType}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            legal: { ...prev.legal, signatureType: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronic">
                            Electronic Signature
                          </SelectItem>
                          <SelectItem value="wet_signature">
                            Wet Signature
                          </SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="retentionPeriod"
                        className="text-sm sm:text-base"
                      >
                        Retention Period (years)
                      </Label>
                      <Input
                        id="retentionPeriod"
                        type="number"
                        value={formData.legal?.retentionPeriod || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            legal: {
                              ...prev.legal,
                              retentionPeriod:
                                parseInt(e.target.value) || undefined,
                            },
                          }))
                        }
                        placeholder="e.g., 7"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requiresSignature"
                        checked={formData.legal?.requiresSignature}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            legal: {
                              ...prev.legal,
                              requiresSignature: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label
                        htmlFor="requiresSignature"
                        className="text-sm sm:text-base cursor-pointer"
                      >
                        Requires Signature
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="witnessRequired"
                        checked={formData.legal?.witnessRequired}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            legal: {
                              ...prev.legal,
                              witnessRequired: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label
                        htmlFor="witnessRequired"
                        className="text-sm sm:text-base cursor-pointer"
                      >
                        Witness Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notarizationRequired"
                        checked={formData.legal?.notarizationRequired}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            legal: {
                              ...prev.legal,
                              notarizationRequired: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label
                        htmlFor="notarizationRequired"
                        className="text-sm sm:text-base cursor-pointer"
                      >
                        Notarization Required
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="complianceNotes"
                      className="text-sm sm:text-base"
                    >
                      Compliance Notes
                    </Label>
                    <Textarea
                      id="complianceNotes"
                      value={formData.legal?.complianceNotes || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          legal: {
                            ...prev.legal,
                            complianceNotes: e.target.value,
                          },
                        }))
                      }
                      placeholder="Any compliance requirements or notes..."
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Additional Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-sm sm:text-base">
                        Author
                      </Label>
                      <Input
                        id="author"
                        value={formData.metadata?.author || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              author: e.target.value,
                            },
                          }))
                        }
                        placeholder="Template author"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="jurisdiction"
                        className="text-sm sm:text-base"
                      >
                        Jurisdiction
                      </Label>
                      <Input
                        id="jurisdiction"
                        value={formData.metadata?.jurisdiction || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              jurisdiction: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g., United States"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="applicableLaw"
                      className="text-sm sm:text-base"
                    >
                      Applicable Law
                    </Label>
                    <Input
                      id="applicableLaw"
                      value={formData.metadata?.applicableLaw || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            applicableLaw: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g., California State Law"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs sm:text-sm"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTag(tag)}
                            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        placeholder="Add a tag..."
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        size="sm"
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Keywords</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="outline"
                          className="text-xs sm:text-sm"
                        >
                          {keyword}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKeyword(keyword)}
                            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addKeyword())
                        }
                        placeholder="Add a keyword..."
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        onClick={addKeyword}
                        size="sm"
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {template ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {template ? "Update Template" : "Create Template"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCreationDialog;
