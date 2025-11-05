"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Globe,
  Shield,
  FileText,
  DollarSign
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TaxProvidersPage() {
  const [providers, setProviders] = useState({
    stripeTax: {
      enabled: true,
      configured: true,
      apiKey: "sk_test_***********",
      webhookUrl: "https://api.example.com/webhooks/stripe-tax",
      autoCalculate: true,
      registrations: ["US", "CA", "GB"],
    },
    taxjar: {
      enabled: false,
      configured: false,
      apiToken: "",
      webhookUrl: "https://api.example.com/webhooks/taxjar",
      environment: "sandbox",
      nexusAddresses: [],
    },
    avalara: {
      enabled: false,
      configured: false,
      accountId: "",
      licenseKey: "",
      companyCode: "",
      environment: "sandbox",
      webhookUrl: "https://api.example.com/webhooks/avalara",
    },
  });

  const toggleProvider = (provider: keyof typeof providers) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled
      }
    }));
  };

  const ProviderCard = ({ 
    name, 
    description, 
    config, 
    onToggle 
  }: { 
    name: string;
    description: string;
    config: any;
    onToggle: () => void;
  }) => (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config.configured ? (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Configured
              </Badge>
            )}
            <Switch
              checked={config.enabled}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardHeader>
      
      {config.enabled && (
        <CardContent className="space-y-4">
          <Tabs defaultValue="credentials">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials" className="space-y-4">
              {name === "Stripe Tax" && (
                <div className="space-y-2">
                  <Label htmlFor="stripe-tax-key">API Key</Label>
                  <Input
                    id="stripe-tax-key"
                    type="password"
                    value={config.apiKey}
                    placeholder="sk_test_..."
                  />
                </div>
              )}
              
              {name === "TaxJar" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="taxjar-token">API Token</Label>
                    <Input
                      id="taxjar-token"
                      type="password"
                      value={config.apiToken}
                      placeholder="your-api-token"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select value={config.environment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {name === "Avalara" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avalara-account">Account ID</Label>
                      <Input
                        id="avalara-account"
                        value={config.accountId}
                        placeholder="123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avalara-license">License Key</Label>
                      <Input
                        id="avalara-license"
                        type="password"
                        value={config.licenseKey}
                        placeholder="your-license-key"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avalara-company">Company Code</Label>
                      <Input
                        id="avalara-company"
                        value={config.companyCode}
                        placeholder="DEFAULT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Select value={config.environment}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              {name === "Stripe Tax" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Tax Calculation</Label>
                      <p className="text-sm text-gray-500">Calculate tax automatically on transactions</p>
                    </div>
                    <Switch checked={config.autoCalculate} />
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tax Inclusive Pricing</Label>
                    <p className="text-sm text-gray-500">Display prices including tax</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reverse Charge</Label>
                    <p className="text-sm text-gray-500">Apply reverse charge mechanism for B2B transactions</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label>Default Tax Code</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="txcd_99999999">Software as a Service</SelectItem>
                      <SelectItem value="txcd_10000000">Digital Products</SelectItem>
                      <SelectItem value="txcd_20000000">Physical Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="jurisdictions" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Tax Registrations</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Configure jurisdictions where your business is registered to collect tax
                  </p>
                </div>
                
                {name === "Stripe Tax" && (
                  <div className="space-y-2">
                    <Label>Registered Countries/States</Label>
                    <div className="flex flex-wrap gap-2">
                      {config.registrations?.map((reg: string) => (
                        <Badge key={reg} variant="secondary">
                          {reg}
                          <button className="ml-1 text-xs">×</button>
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm">+ Add Registration</Button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origin Address</Label>
                    <Input placeholder="123 Business St" />
                    <Input placeholder="City, State ZIP" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">Software as a Service</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={config.webhookUrl}
                  placeholder="https://your-domain.com/webhooks"
                />
              </div>
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Webhooks notify your application of tax calculation updates and compliance changes.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Event Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Tax Calculated</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Registration Updated</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Rate Changes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm">Compliance Alerts</span>
                  </label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline">Test Calculation</Button>
            <Button>Save Configuration</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Providers</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure tax calculation providers for accurate compliance across jurisdictions
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Global Tax Settings
        </Button>
      </div>

      <div className="grid gap-6">
        <ProviderCard
          name="Stripe Tax"
          description="Integrated tax calculation with automatic rate updates"
          config={providers.stripeTax}
          onToggle={() => toggleProvider('stripeTax')}
        />
        
        <ProviderCard
          name="TaxJar"
          description="Comprehensive tax compliance platform for US and international"
          config={providers.taxjar}
          onToggle={() => toggleProvider('taxjar')}
        />
        
        <ProviderCard
          name="Avalara"
          description="Enterprise-grade tax compliance and calculation engine"
          config={providers.avalara}
          onToggle={() => toggleProvider('avalara')}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compliance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">US Sales Tax</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">EU VAT</span>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Setup Required</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Canada GST/HST</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700">Active</Badge>
              </div>
            </div>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Tax rates are automatically updated to ensure compliance with current regulations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Tax Collection Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-medium">$2,457.89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Month</span>
                <span className="font-medium">$1,892.34</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">YTD</span>
                <span className="font-medium">$18,234.56</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              View Tax Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}