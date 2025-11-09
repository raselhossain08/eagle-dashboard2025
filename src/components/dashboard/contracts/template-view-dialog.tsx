"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Edit,
  Copy,
  Eye,
  Info,
  Settings,
  Scale,
  Tag,
} from "lucide-react";
import type { ContractTemplate } from "@/lib/services/contracts/contract.service";

interface TemplateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContractTemplate | null;
  onEdit?: (template: ContractTemplate) => void;
  onClone?: (template: ContractTemplate) => void;
}

const TemplateViewDialog: React.FC<TemplateViewDialogProps> = ({
  open,
  onOpenChange,
  template,
  onEdit,
  onClone,
}) => {
  if (!template) return null;

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
        label: "Investment Agreement",
      },
      service_agreement: {
        color: "bg-purple-100 text-purple-800",
        label: "Service Agreement",
      },
      nda: { color: "bg-red-100 text-red-800", label: "NDA" },
      employment_contract: {
        color: "bg-orange-100 text-orange-800",
        label: "Employment Contract",
      },
      consulting_agreement: {
        color: "bg-teal-100 text-teal-800",
        label: "Consulting Agreement",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl xl:max-w-7xl h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
            View Contract Template
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Review the details and content of this contract template
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          {onEdit && (
            <Button
              onClick={() => onEdit(template)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Template
            </Button>
          )}
          {onClone && (
            <Button
              variant="outline"
              onClick={() => onClone(template)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Clone Template
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Template Name
                      </label>
                      <p className="text-lg font-semibold">{template.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Template ID
                      </label>
                      <code className="block text-sm bg-gray-100 px-2 py-1 rounded">
                        {template.templateId}
                      </code>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <div className="mt-1">
                        {getCategoryBadge(template.category)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(template.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Version & Language
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Version
                      </label>
                      <Badge variant="outline" className="mt-1">
                        v{template.versionString}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <p>{template.language}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Locale
                      </label>
                      <p>{template.locale}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Last Updated
                      </label>
                      <p>{new Date(template.updatedAt).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metadata Section */}
              {template.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {template.metadata.title && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <p>{template.metadata.title}</p>
                      </div>
                    )}
                    {template.metadata.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <p className="text-gray-600">
                          {template.metadata.description}
                        </p>
                      </div>
                    )}
                    {template.metadata.tags &&
                      template.metadata.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Tags
                          </label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {template.metadata.tags.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Template Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {template.content?.body ? (
                    <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {template.content.body}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-amber-400 mb-3" />
                      <h3 className="text-sm font-medium text-amber-900 mb-1">
                        No Content Available
                      </h3>
                      <p className="text-xs text-amber-700">
                        This template doesn't have any content yet. Please edit
                        the template to add content.
                      </p>
                    </div>
                  )}

                  {/* HTML Content Preview (if exists) */}
                  {template.content?.htmlBody && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">HTML Version</h3>
                      <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: template.content.htmlBody,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Content Statistics */}
                  {template.content?.body && (
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-700">
                          {template.content.body.length}
                        </div>
                        <div className="text-xs text-blue-600">Characters</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-700">
                          {
                            template.content.body.split(/\s+/).filter(Boolean)
                              .length
                          }
                        </div>
                        <div className="text-xs text-green-600">Words</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-purple-700">
                          {template.content.body.split(/\n/).length}
                        </div>
                        <div className="text-xs text-purple-600">Lines</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent value="variables" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  {template.content.variables &&
                  template.content.variables.length > 0 ? (
                    <div className="space-y-4">
                      {template.content.variables.map((variable, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Variable Name
                              </label>
                              <code className="block text-sm bg-white px-2 py-1 rounded border">
                                {variable.name}
                              </code>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Label
                              </label>
                              <p>{variable.label}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Type
                              </label>
                              <Badge variant="outline">{variable.type}</Badge>
                            </div>
                          </div>
                          {variable.description && (
                            <div className="mt-2">
                              <label className="text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <p className="text-sm text-gray-600">
                                {variable.description}
                              </p>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant={
                                variable.required ? "default" : "secondary"
                              }
                            >
                              {variable.required ? "Required" : "Optional"}
                            </Badge>
                            {variable.defaultValue && (
                              <span className="text-sm text-gray-600">
                                Default: {variable.defaultValue}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No variables defined for this template.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Legal Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {template.legal ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Requires Signature
                        </label>
                        <Badge
                          variant={
                            template.legal.requiresSignature
                              ? "default"
                              : "secondary"
                          }
                        >
                          {template.legal.requiresSignature ? "Yes" : "No"}
                        </Badge>
                      </div>
                      {template.legal.signatureType && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Signature Type
                          </label>
                          <p className="capitalize">
                            {template.legal.signatureType}
                          </p>
                        </div>
                      )}
                      {template.legal.complianceNotes && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Compliance Notes
                          </label>
                          <p className="text-gray-600">
                            {template.legal.complianceNotes}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No legal settings configured.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateViewDialog;
