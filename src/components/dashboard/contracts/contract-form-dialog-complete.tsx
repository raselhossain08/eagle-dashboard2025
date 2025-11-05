
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, X, FileText, Calendar, DollarSign, User, Building } from 'lucide-react';
import { toast } from 'sonner';
import { Contract, ContractTemplate, CreateContractRequest, UpdateContractRequest } from '@/services/contracts';

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
  templates: ContractTemplate[];
  onSubmit: (data: CreateContractRequest | UpdateContractRequest) => Promise<void>;
  loading: boolean;
}

const ContractFormDialog: React.FC<ContractFormDialogProps> = ({
  open,
  onOpenChange,
  contract,
  templates,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CreateContractRequest>({
    templateId: '',
    title: '',
    parties: {
      primary: {
        type: 'company',
        name: '',
        email: '',
        phone: '',
        address: {
          line1: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      },
      secondary: {
        type: 'individual',
        name: '',
        email: '',
        phone: '',
        address: {
          line1: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      }
    },
    variableValues: {},
    terms: {
      effectiveDate: new Date().toISOString().split('T')[0],
    },
    financialTerms: {
      contractValue: {
        amount: 0,
        currency: 'USD'
      },
      paymentTerms: {
        schedule: 'monthly',
        discounts: []
      }
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize form data when dialog opens or contract changes
  useEffect(() => {
    if (open) {
      if (contract) {
        // Edit mode - convert existing contract to form data
        setFormData({
          templateId: contract.template.templateId,
          title: contract.title,
          parties: {
            primary: {
              type: contract.parties.primary.type,
              name: contract.parties.primary.name,
              email: contract.parties.primary.email || '',
              phone: contract.parties.primary.phone || '',
              address: contract.parties.primary.address || {
                line1: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
              }
            },
            secondary: {
              type: contract.parties.secondary.type,
              name: contract.parties.secondary.name,
              email: contract.parties.secondary.email || '',
              phone: contract.parties.secondary.phone || '',
              address: contract.parties.secondary.address || {
                line1: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
              }
            }
          },
          variableValues: contract.content.variables,
          terms: {
            effectiveDate: contract.terms.effectiveDate.split('T')[0],
            expirationDate: contract.terms.expirationDate?.split('T')[0]
          },
          financialTerms: contract.financialTerms
        });
        
        const template = templates.find(t => t.templateId === contract.template.templateId);
        setSelectedTemplate(template || null);
      } else {
        // Create mode - reset form
        setFormData({
          templateId: '',
          title: '',
          parties: {
            primary: {
              type: 'company',
              name: '',
              email: '',
              phone: '',
              address: {
                line1: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
              }
            },
            secondary: {
              type: 'individual',
              name: '',
              email: '',
              phone: '',
              address: {
                line1: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
              }
            }
          },
          variableValues: {},
          terms: {
            effectiveDate: new Date().toISOString().split('T')[0],
          },
          financialTerms: {
            contractValue: {
              amount: 0,
              currency: 'USD'
            },
            paymentTerms: {
              schedule: 'monthly',
              discounts: []
            }
          }
        });
        setSelectedTemplate(null);
      }
      setValidationErrors({});
      setCurrentStep(1);
    }
  }, [open, contract, templates]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.templateId === templateId);
    setSelectedTemplate(template || null);
    
    setFormData(prev => ({
      ...prev,
      templateId,
      variableValues: template?.content.variables.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultValue || '';
        return acc;
      }, {} as Record<string, any>) || {},
    }));
  };

  const handleVariableChange = (variableName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variableValues: {
        ...prev.variableValues,
        [variableName]: value,
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.templateId) errors.templateId = 'Template is required';
        if (!formData.title.trim()) errors.title = 'Title is required';
        break;

      case 2: // Parties
        if (!formData.parties.primary.name.trim()) errors['primary.name'] = 'Primary party name is required';
        if (!formData.parties.primary.email?.trim()) errors['primary.email'] = 'Primary party email is required';
        if (!formData.parties.secondary.name.trim()) errors['secondary.name'] = 'Secondary party name is required';
        if (!formData.parties.secondary.email?.trim()) errors['secondary.email'] = 'Secondary party email is required';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.parties.primary.email && !emailRegex.test(formData.parties.primary.email)) {
          errors['primary.email'] = 'Invalid email format';
        }
        if (formData.parties.secondary.email && !emailRegex.test(formData.parties.secondary.email)) {
          errors['secondary.email'] = 'Invalid email format';
        }
        break;

      case 3: // Variables
        if (selectedTemplate) {
          selectedTemplate.content.variables.forEach(variable => {
            if (variable.required && !formData.variableValues[variable.name]) {
              errors[`variable.${variable.name}`] = `${variable.label} is required`;
            }
          });
        }
        break;

      case 4: // Terms
        if (!formData.terms.effectiveDate) errors.effectiveDate = 'Effective date is required';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate all steps
    let isValid = true;
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        isValid = false;
      }
    }

    if (!isValid) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      // Convert dates to ISO strings
      const submitData = {
        ...formData,
        terms: {
          ...formData.terms,
          effectiveDate: new Date(formData.terms.effectiveDate).toISOString(),
          expirationDate: formData.terms.expirationDate 
            ? new Date(formData.terms.expirationDate).toISOString() 
            : undefined,
        }
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderVariableInput = (variable: ContractTemplate['content']['variables'][0]) => {
    const value = formData.variableValues[variable.name] || '';
    const error = validationErrors[`variable.${variable.name}`];

    const inputProps = {
      className: error ? 'border-red-500' : '',
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleVariableChange(variable.name, e.target.value)
    };

    switch (variable.type) {
      case 'textarea':
        return <Textarea {...inputProps} placeholder={variable.placeholder || variable.description} rows={3} />;
      
      case 'number':
      case 'currency':
        return (
          <Input
            type="number"
            {...inputProps}
            onChange={(e) => handleVariableChange(variable.name, parseFloat(e.target.value) || '')}
            placeholder={variable.placeholder || variable.description}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            {...inputProps}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
          />
        );
      
      case 'boolean':
        return (
          <Select
            value={value.toString()}
            onValueChange={(val) => handleVariableChange(variable.name, val === 'true')}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleVariableChange(variable.name, val)}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return <Input {...inputProps} placeholder={variable.placeholder || variable.description} />;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-medium">Basic Information</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="template">
                  Contract Template *
                  {selectedTemplate && (
                    <Badge variant="secondary" className="ml-2">
                      v{selectedTemplate.versionString}
                    </Badge>
                  )}
                </Label>
                <Select 
                  value={formData.templateId} 
                  onValueChange={handleTemplateChange}
                  disabled={!!contract} // Disable in edit mode
                >
                  <SelectTrigger className={validationErrors.templateId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter(t => t.status === 'active' && t.isActive)
                      .map((template) => (
                      <SelectItem key={template._id} value={template.templateId}>
                        <div className="flex flex-col">
                          <span>{template.name} (v{template.versionString})</span>
                          <span className="text-xs text-muted-foreground">{template.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.templateId && (
                  <p className="text-sm text-red-600">{validationErrors.templateId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter contract title"
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-600">{validationErrors.title}</p>
                )}
              </div>

              {selectedTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Template Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {selectedTemplate.category}
                      </div>
                      <div>
                        <span className="font-medium">Language:</span> {selectedTemplate.language}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Variables:</span> {selectedTemplate.content.variables.length} fields
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-medium">Contracting Parties</h3>
            </div>
            
            {/* Primary Party */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Primary Party (Your Organization)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select 
                      value={formData.parties.primary.type} 
                      onValueChange={(value: 'individual' | 'company' | 'organization') => 
                        setFormData(prev => ({ 
                          ...prev, 
                          parties: { 
                            ...prev.parties, 
                            primary: { ...prev.parties.primary, type: value }
                          }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formData.parties.primary.name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        parties: { 
                          ...prev.parties, 
                          primary: { ...prev.parties.primary, name: e.target.value }
                        }
                      }))}
                      placeholder="Full name or company name"
                      className={validationErrors['primary.name'] ? 'border-red-500' : ''}
                    />
                    {validationErrors['primary.name'] && (
                      <p className="text-sm text-red-600">{validationErrors['primary.name']}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.parties.primary.email || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        parties: { 
                          ...prev.parties, 
                          primary: { ...prev.parties.primary, email: e.target.value }
                        }
                      }))}
                      placeholder="email@company.com"
                      className={validationErrors['primary.email'] ? 'border-red-500' : ''}
                    />
                    {validationErrors['primary.email'] && (
                      <p className="text-sm text-red-600">{validationErrors['primary.email']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.parties.primary.phone || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        parties: { 
                          ...prev.parties, 
                          primary: { ...prev.parties.primary, phone: e.target.value }
                        }
                      }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Party */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Secondary Party (Client/Customer)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select 
                      value={formData.parties.secondary.type} 
                      onValueChange={(value: 'individual' | 'company' | 'organization') => 
                        setFormData(prev => ({ 
                          ...prev, 
                          parties: { 
                            ...prev.parties, 
                            secondary: { ...prev.parties.secondary, type: value }
                          }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formData.parties.secondary.name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        parties: { 
                          ...prev.parties, 
                          secondary: { ...prev.parties.secondary, name: e.target.value }
                        }
                      }))}
                      placeholder="Full name or company name"
                      className={validationErrors['secondary.name'] ? 'border-red-500' : ''}
                    />
                    {validationErrors['secondary.name'] && (
                      <p className="text-sm text-red-600">{validationErrors['secondary.name']}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.parties.secondary.email || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        parties: { 
                          ...prev.parties, 
                          secondary: { ...prev.parties.secondary, email: e.target.value }
                        }
                      }))}
                      placeholder="email@example.com"
                      className={validationErrors['secondary.email'] ? 'border-red-500' : ''}
                    />
                    {validationErrors['secondary.email'] && (
                      <p className="text-sm text-red-600">{validationErrors['secondary.email']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.parties.secondary.phone || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        parties: { 
                          ...prev.parties, 
                          secondary: { ...prev.parties.secondary, phone: e.target.value }
                        }
                      }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Template Variables</h3>
            {selectedTemplate && selectedTemplate.content.variables.length > 0 ? (
              <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                  {selectedTemplate.content.variables.map((variable) => {
                    const error = validationErrors[`variable.${variable.name}`];
                    return (
                      <div key={variable.name} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {variable.label}
                          {variable.required && <span className="text-red-500">*</span>}
                          <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                        </Label>
                        {variable.description && (
                          <p className="text-sm text-muted-foreground">{variable.description}</p>
                        )}
                        {renderVariableInput(variable)}
                        {error && (
                          <p className="text-sm text-red-600">{error}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    This template has no configurable variables.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h3 className="text-lg font-medium">Contract Terms & Financial Details</h3>
            </div>
            
            <div className="grid gap-6">
              {/* Date Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contract Duration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Effective Date *</Label>
                      <Input
                        type="date"
                        value={formData.terms.effectiveDate}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          terms: { ...prev.terms, effectiveDate: e.target.value }
                        }))}
                        className={validationErrors.effectiveDate ? 'border-red-500' : ''}
                      />
                      {validationErrors.effectiveDate && (
                        <p className="text-sm text-red-600">{validationErrors.effectiveDate}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.terms.expirationDate || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          terms: { ...prev.terms, expirationDate: e.target.value || undefined }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contract Value</Label>
                      <Input
                        type="number"
                        value={formData.financialTerms?.contractValue?.amount || 0}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          financialTerms: {
                            ...prev.financialTerms,
                            contractValue: {
                              ...prev.financialTerms?.contractValue,
                              amount: parseFloat(e.target.value) || 0,
                              currency: prev.financialTerms?.contractValue?.currency || 'USD'
                            }
                          }
                        }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={formData.financialTerms?.contractValue?.currency || 'USD'}
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          financialTerms: {
                            ...prev.financialTerms,
                            contractValue: {
                              ...prev.financialTerms?.contractValue,
                              amount: prev.financialTerms?.contractValue?.amount || 0,
                              currency: value
                            }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Schedule</Label>
                    <Select
                      value={formData.financialTerms?.paymentTerms?.schedule || 'monthly'}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        financialTerms: {
                          ...prev.financialTerms,
                          paymentTerms: {
                            ...prev.financialTerms?.paymentTerms,
                            schedule: value,
                            discounts: prev.financialTerms?.paymentTerms?.discounts || []
                          }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One-time payment</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="milestone">Milestone-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Basic Info', 'Parties', 'Variables', 'Terms'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {contract ? 'Edit Contract' : 'Create New Contract'}
          </DialogTitle>
          <DialogDescription>
            {contract 
              ? 'Update contract details and settings'
              : 'Create a new contract from a template'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between py-4 border-b">
          {stepTitles.map((title, index) => (
            <div 
              key={index} 
              className={`flex items-center ${index < stepTitles.length - 1 ? 'flex-1' : ''}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm ${currentStep === index + 1 ? 'font-medium' : 'text-gray-600'}`}>
                {title}
              </span>
              {index < stepTitles.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {renderStep()}
        </div>

        {/* Navigation */}
        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : (contract ? 'Update Contract' : 'Create Contract')}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractFormDialog;