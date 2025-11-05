"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Webhook,
  Key,
  Globe
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentProcessorsPage() {
  const [processors, setProcessors] = useState({
    stripe: {
      enabled: true,
      configured: true,
      publishableKey: "pk_test_***********",
      secretKey: "sk_test_***********",
      webhookUrl: "https://api.example.com/webhooks/stripe",
      webhookSecret: "whsec_***********",
      idempotencyEnabled: true,
    },
    braintree: {
      enabled: false,
      configured: false,
      merchantId: "",
      publicKey: "",
      privateKey: "",
      webhookUrl: "https://api.example.com/webhooks/braintree",
      environment: "sandbox",
    },
    paddle: {
      enabled: false,
      configured: false,
      vendorId: "",
      apiKey: "",
      publicKey: "",
      webhookUrl: "https://api.example.com/webhooks/paddle",
    },
  });

  const toggleProcessor = (processor: string) => {
    setProcessors(prev => ({
      ...prev,
      [processor]: {
        ...prev[processor],
        enabled: !prev[processor].enabled
      }
    }));
  };

  const ProcessorCard = ({ 
    name, 
    logo, 
    description, 
    config, 
    onToggle 
  }: { 
    name: string;
    logo: string;
    description: string;
    config: any;
    onToggle: () => void;
  }) => (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials" className="space-y-4">
              {name === "Stripe" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-publishable">Publishable Key</Label>
                      <Input
                        id="stripe-publishable"
                        type="password"
                        value={config.publishableKey}
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-secret">Secret Key</Label>
                      <Input
                        id="stripe-secret"
                        type="password"
                        value={config.secretKey}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>
                </>
              )}
              
              {name === "Braintree" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="braintree-merchant">Merchant ID</Label>
                      <Input
                        id="braintree-merchant"
                        value={config.merchantId}
                        placeholder="your_merchant_id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="braintree-public">Public Key</Label>
                      <Input
                        id="braintree-public"
                        value={config.publicKey}
                        placeholder="your_public_key"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="braintree-private">Private Key</Label>
                    <Input
                      id="braintree-private"
                      type="password"
                      value={config.privateKey}
                      placeholder="your_private_key"
                    />
                  </div>
                </>
              )}
              
              {name === "Paddle" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paddle-vendor">Vendor ID</Label>
                      <Input
                        id="paddle-vendor"
                        value={config.vendorId}
                        placeholder="12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paddle-api">API Key</Label>
                      <Input
                        id="paddle-api"
                        type="password"
                        value={config.apiKey}
                        placeholder="your_api_key"
                      />
                    </div>
                  </div>
                </>
              )}
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
              
              {config.webhookSecret && (
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <Input
                    id="webhook-secret"
                    type="password"
                    value={config.webhookSecret}
                    placeholder="whsec_..."
                  />
                </div>
              )}
              
              <Alert>
                <Webhook className="h-4 w-4" />
                <AlertDescription>
                  Webhooks ensure secure and reliable communication between {name} and your application.
                  Make sure your endpoint can handle POST requests and verify the webhook signature.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              {name === "Stripe" && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Idempotency Keys</Label>
                    <p className="text-sm text-gray-500">Prevent duplicate charges with idempotency keys</p>
                  </div>
                  <Switch checked={config.idempotencyEnabled} />
                </div>
              )}
              
              {name === "Braintree" && (
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Test Mode</Label>
                  <p className="text-sm text-gray-500">Process test transactions</p>
                </div>
                <Switch />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline">Test Connection</Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Payment Processors</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure payment processing adapters with webhooks and idempotency support
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Global Settings
        </Button>
      </div>

      <div className="grid gap-6">
        <ProcessorCard
          name="Stripe"
          logo="/logos/stripe.svg"
          description="Industry-leading payment processing with advanced features"
          config={processors.stripe}
          onToggle={() => toggleProcessor('stripe')}
        />
        
        <ProcessorCard
          name="Braintree"
          logo="/logos/braintree.svg"
          description="PayPal's full-stack payment platform"
          config={processors.braintree}
          onToggle={() => toggleProcessor('braintree')}
        />
        
        <ProcessorCard
          name="Paddle"
          logo="/logos/paddle.svg"
          description="Merchant of record for SaaS and digital products"
          config={processors.paddle}
          onToggle={() => toggleProcessor('paddle')}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              All API keys and secrets are encrypted at rest and in transit. 
              Webhook endpoints use signature verification for security.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">PCI Compliance</h4>
              <p className="text-gray-500">All processors maintain PCI DSS Level 1 compliance</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Protection</h4>
              <p className="text-gray-500">Payment data is tokenized and never stored locally</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}