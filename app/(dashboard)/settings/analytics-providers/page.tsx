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
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  BarChart3,
  Eye,
  Activity,
  Users,
  Globe,
  Code
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AnalyticsProvidersPage() {
  const [providers, setProviders] = useState({
    googleAnalytics: {
      enabled: true,
      configured: true,
      measurementId: "G-XXXXXXXXXX",
      trackingId: "UA-XXXXXXXXX-1",
      apiSecret: "***********",
      events: {
        pageViews: true,
        subscriptions: true,
        contracts: true,
        payments: true,
        customEvents: true,
      }
    },
    posthog: {
      enabled: false,
      configured: false,
      projectApiKey: "",
      host: "https://app.posthog.com",
      personalApiKey: "",
      events: {
        userActions: true,
        featureFlags: true,
        sessionRecordings: false,
        heatmaps: false,
      }
    },
    plausible: {
      enabled: false,
      configured: false,
      domain: "",
      apiKey: "",
      scriptSrc: "https://plausible.io/js/script.js",
      events: {
        pageViews: true,
        goals: true,
        customEvents: false,
      }
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
              <TrendingUp className="w-5 h-5" />
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
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials" className="space-y-4">
              {name === "Google Analytics 4" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ga4-measurement">Measurement ID</Label>
                      <Input
                        id="ga4-measurement"
                        value={config.measurementId}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga4-tracking">Tracking ID (Legacy)</Label>
                      <Input
                        id="ga4-tracking"
                        value={config.trackingId}
                        placeholder="UA-XXXXXXXXX-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ga4-api-secret">Measurement Protocol API Secret</Label>
                    <Input
                      id="ga4-api-secret"
                      type="password"
                      value={config.apiSecret}
                      placeholder="Server-side tracking secret"
                    />
                  </div>
                </>
              )}
              
              {name === "PostHog" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="posthog-project-key">Project API Key</Label>
                      <Input
                        id="posthog-project-key"
                        type="password"
                        value={config.projectApiKey}
                        placeholder="phc_xxxxxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="posthog-personal-key">Personal API Key</Label>
                      <Input
                        id="posthog-personal-key"
                        type="password"
                        value={config.personalApiKey}
                        placeholder="phx_xxxxxxxxxxxxx"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posthog-host">Host URL</Label>
                    <Input
                      id="posthog-host"
                      value={config.host}
                      placeholder="https://app.posthog.com"
                    />
                  </div>
                </>
              )}
              
              {name === "Plausible Analytics" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plausible-domain">Domain</Label>
                      <Input
                        id="plausible-domain"
                        value={config.domain}
                        placeholder="yourdomain.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plausible-api-key">API Key</Label>
                      <Input
                        id="plausible-api-key"
                        type="password"
                        value={config.apiKey}
                        placeholder="API key for stats access"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plausible-script">Script Source</Label>
                    <Input
                      id="plausible-script"
                      value={config.scriptSrc}
                      placeholder="https://plausible.io/js/script.js"
                    />
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Event Tracking Configuration</Label>
                <p className="text-sm text-gray-500 mb-4">
                  Configure which events to track with {name}
                </p>
              </div>
              
              <div className="space-y-3">
                {Object.entries(config.events || {}).map(([eventKey, enabled]) => (
                  <div key={eventKey} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">
                        {eventKey.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-sm text-gray-500">
                        Track {eventKey.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                      </p>
                    </div>
                    <Switch checked={enabled as boolean} />
                  </div>
                ))}
              </div>
              
              {name === "Google Analytics 4" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label>Custom Events</Label>
                    <p className="text-sm text-gray-500 mb-2">Define custom events to track</p>
                  </div>
                  <Textarea
                    placeholder={`subscription_created
contract_signed  
payment_failed
user_upgraded`}
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tracking" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enhanced Ecommerce</Label>
                    <p className="text-sm text-gray-500">Track purchase events and revenue</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>User ID Tracking</Label>
                    <p className="text-sm text-gray-500">Track logged-in users across sessions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cross-Domain Tracking</Label>
                    <p className="text-sm text-gray-500">Track users across multiple domains</p>
                  </div>
                  <Switch />
                </div>
                
                {name === "PostHog" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Recordings</Label>
                      <p className="text-sm text-gray-500">Record user sessions for analysis</p>
                    </div>
                    <Switch checked={config.events?.sessionRecordings} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Sample Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="1" max="100" defaultValue="100" className="w-20" />
                    <span className="text-sm text-gray-500">% of sessions to track</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cookie Consent</Label>
                    <p className="text-sm text-gray-500">Require consent before tracking</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Anonymization</Label>
                    <p className="text-sm text-gray-500">Anonymize user IP addresses</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Respect Do Not Track</Label>
                    <p className="text-sm text-gray-500">Honor browser DNT settings</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="14">14 months</option>
                    <option value="26">26 months</option>
                    <option value="38">38 months</option>
                    <option value="50">50 months</option>
                  </select>
                </div>
                
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    All analytics providers comply with GDPR, CCPA, and other privacy regulations. 
                    Personal data is processed according to your privacy policy.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline">
              <Code className="w-4 h-4 mr-2" />
              View Code
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics Providers</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure analytics and tracking providers for comprehensive user insights
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Analytics Settings
        </Button>
      </div>

      <div className="grid gap-6">
        <ProviderCard
          name="Google Analytics 4"
          description="Comprehensive web and app analytics with machine learning insights"
          config={providers.googleAnalytics}
          onToggle={() => toggleProvider('googleAnalytics')}
        />
        
        <ProviderCard
          name="PostHog"
          description="Product analytics with feature flags, session recordings, and A/B testing"
          config={providers.posthog}
          onToggle={() => toggleProvider('posthog')}
        />
        
        <ProviderCard
          name="Plausible Analytics"
          description="Simple, privacy-focused analytics without cookies"
          config={providers.plausible}
          onToggle={() => toggleProvider('plausible')}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Page Views</span>
                <span className="font-medium">5,678</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conversions</span>
                <span className="font-medium">89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Users</span>
                <span className="font-medium">456</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Returning Users</span>
                <span className="font-medium">778</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Session</span>
                <span className="font-medium">4m 32s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Event Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subscriptions</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Contracts</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payments</span>
                <span className="font-medium">45</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}