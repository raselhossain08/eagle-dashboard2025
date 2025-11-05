"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Send,
  Phone,
  Globe
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CommunicationProvidersPage() {
  const [providers, setProviders] = useState({
    sendgrid: {
      enabled: true,
      configured: true,
      apiKey: "SG.***********",
      fromEmail: "noreply@example.com",
      fromName: "Eagle Platform",
      webhookUrl: "https://api.example.com/webhooks/sendgrid",
      templates: {
        welcome: "d-123456789",
        invoice: "d-987654321",
        contract: "d-456789123",
      }
    },
    postmark: {
      enabled: false,
      configured: false,
      apiKey: "",
      fromEmail: "",
      fromName: "",
      webhookUrl: "https://api.example.com/webhooks/postmark",
    },
    twilio: {
      enabled: true,
      configured: true,
      accountSid: "AC***********",
      authToken: "***********",
      fromNumber: "+1234567890",
      webhookUrl: "https://api.example.com/webhooks/twilio",
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
    type,
    description, 
    config, 
    onToggle 
  }: { 
    name: string;
    type: 'email' | 'sms';
    description: string;
    config: any;
    onToggle: () => void;
  }) => (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              {type === 'email' ? (
                <Mail className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {type.toUpperCase()}
                </Badge>
              </div>
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
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials" className="space-y-4">
              {name === "SendGrid" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sendgrid-api-key">API Key</Label>
                    <Input
                      id="sendgrid-api-key"
                      type="password"
                      value={config.apiKey}
                      placeholder="SG...."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sendgrid-from-email">From Email</Label>
                      <Input
                        id="sendgrid-from-email"
                        type="email"
                        value={config.fromEmail}
                        placeholder="noreply@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sendgrid-from-name">From Name</Label>
                      <Input
                        id="sendgrid-from-name"
                        value={config.fromName}
                        placeholder="Your Company"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {name === "Postmark" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="postmark-api-key">Server API Token</Label>
                    <Input
                      id="postmark-api-key"
                      type="password"
                      value={config.apiKey}
                      placeholder="your-server-api-token"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postmark-from-email">From Email</Label>
                      <Input
                        id="postmark-from-email"
                        type="email"
                        value={config.fromEmail}
                        placeholder="noreply@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postmark-from-name">From Name</Label>
                      <Input
                        id="postmark-from-name"
                        value={config.fromName}
                        placeholder="Your Company"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {name === "Twilio" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twilio-sid">Account SID</Label>
                      <Input
                        id="twilio-sid"
                        type="password"
                        value={config.accountSid}
                        placeholder="AC..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilio-token">Auth Token</Label>
                      <Input
                        id="twilio-token"
                        type="password"
                        value={config.authToken}
                        placeholder="your-auth-token"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-from">From Phone Number</Label>
                    <Input
                      id="twilio-from"
                      value={config.fromNumber}
                      placeholder="+1234567890"
                    />
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              {type === 'email' && config.templates && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Welcome Email Template</Label>
                      <Input
                        value={config.templates.welcome || ''}
                        placeholder="Template ID or content"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Email Template</Label>
                      <Input
                        value={config.templates.invoice || ''}
                        placeholder="Template ID or content"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contract Email Template</Label>
                      <Input
                        value={config.templates.contract || ''}
                        placeholder="Template ID or content"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {type === 'sms' && (
                <>
                  <div className="space-y-2">
                    <Label>Default SMS Template</Label>
                    <Textarea
                      placeholder="Hello {{name}}, your {{event}} has been {{status}}."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Available variables: {`{{name}}, {{event}}, {{status}}, {{date}}, {{amount}}`}</p>
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
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Configure webhooks to receive delivery notifications, bounces, and other events from {name}.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Event Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Delivered</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Bounced</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Opened</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Clicked</span>
                  </label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Email & SMS Providers</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure communication providers for transactional emails and SMS notifications
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Global Settings
        </Button>
      </div>

      <div className="grid gap-6">
        <ProviderCard
          name="SendGrid"
          type="email"
          description="Reliable email delivery with advanced analytics"
          config={providers.sendgrid}
          onToggle={() => toggleProvider('sendgrid')}
        />
        
        <ProviderCard
          name="Postmark"
          type="email"
          description="Fast transactional email service with detailed tracking"
          config={providers.postmark}
          onToggle={() => toggleProvider('postmark')}
        />
        
        <ProviderCard
          name="Twilio"
          type="sms"
          description="Programmable SMS and voice communications platform"
          config={providers.twilio}
          onToggle={() => toggleProvider('twilio')}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Communication Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Email Delivery</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Enable Email Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Track Email Opens</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Track Link Clicks</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">SMS Delivery</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Enable SMS Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Delivery Receipts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>International SMS</Label>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              All communication providers use secure API connections with rate limiting and retry logic.
              Failed deliveries are automatically queued for retry with exponential backoff.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}