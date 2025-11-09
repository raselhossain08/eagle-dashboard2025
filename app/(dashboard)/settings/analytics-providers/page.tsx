"use client";

import { useState, useEffect } from "react";
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
  Code,
  Loader2,
  Save,
  TestTube,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ProviderSettings {
  enabled: boolean;
  configured?: boolean;
  measurementId?: string;
  trackingId?: string;
  apiSecret?: string;
  projectApiKey?: string;
  personalApiKey?: string;
  host?: string;
  domain?: string;
  apiKey?: string;
  scriptSrc?: string;
  events: Record<string, boolean>;
  tracking?: {
    enhancedEcommerce: boolean;
    userIdTracking: boolean;
    crossDomainTracking: boolean;
    sampleRate: number;
  };
  privacy?: {
    cookieConsent: boolean;
    ipAnonymization: boolean;
    respectDNT: boolean;
    dataRetention: number;
  };
  customEventsList?: string;
}

interface AnalyticsSettings {
  googleAnalytics: ProviderSettings;
  posthog: ProviderSettings;
  plausible: ProviderSettings;
  lastUpdated?: string;
}

interface AnalyticsStats {
  overview: {
    activeUsers: number;
    pageViews: number;
    conversions: number;
  };
  userInsights: {
    newUsers: number;
    returningUsers: number;
    avgSession: string;
  };
  eventTracking: {
    subscriptions: number;
    contracts: number;
    payments: number;
  };
  activeProviders: number;
}

export default function AnalyticsProvidersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message?: string }>>({});

  const [stats, setStats] = useState<AnalyticsStats>({
    overview: { activeUsers: 0, pageViews: 0, conversions: 0 },
    userInsights: { newUsers: 0, returningUsers: 0, avgSession: '0m 0s' },
    eventTracking: { subscriptions: 0, contracts: 0, payments: 0 },
    activeProviders: 0
  });

  const [providers, setProviders] = useState<AnalyticsSettings>({
    googleAnalytics: {
      enabled: false,
      configured: false,
      measurementId: "",
      trackingId: "",
      apiSecret: "",
      customEventsList: "",
      events: {
        pageViews: true,
        subscriptions: true,
        contracts: true,
        payments: true,
        customEvents: true,
      },
      tracking: {
        enhancedEcommerce: true,
        userIdTracking: true,
        crossDomainTracking: false,
        sampleRate: 100
      },
      privacy: {
        cookieConsent: true,
        ipAnonymization: true,
        respectDNT: false,
        dataRetention: 14
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
      },
      tracking: {
        enhancedEcommerce: true,
        userIdTracking: true,
        crossDomainTracking: false,
        sampleRate: 100
      },
      privacy: {
        cookieConsent: true,
        ipAnonymization: true,
        respectDNT: false,
        dataRetention: 14
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
      },
      tracking: {
        enhancedEcommerce: true,
        userIdTracking: true,
        crossDomainTracking: false,
        sampleRate: 100
      },
      privacy: {
        cookieConsent: true,
        ipAnonymization: true,
        respectDNT: false,
        dataRetention: 14
      }
    },
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/analytics-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProviders(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/analytics-settings/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/analytics-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(providers)
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        toast({
          title: "✅ Settings Saved Successfully!",
          description: "Analytics provider configurations have been updated."
        });
        fetchSettings();
        fetchStats();

        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings"
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (provider: 'googleAnalytics' | 'posthog' | 'plausible') => {
    try {
      setTesting(provider);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/analytics-settings/test/${provider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTestResults(prev => ({
          ...prev,
          [provider]: { success: true, message: data.message }
        }));
        toast({
          title: "✅ Connection Successful!",
          description: data.message
        });
      } else {
        setTestResults(prev => ({
          ...prev,
          [provider]: { success: false, message: data.message }
        }));
        throw new Error(data.message);
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, message: error.message }
      }));
      toast({
        title: "❌ Connection Failed",
        description: error.message
      });
    } finally {
      setTesting(null);
    }
  };

  const toggleProvider = (provider: 'googleAnalytics' | 'posthog' | 'plausible') => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled
      }
    }));
  };

  const updateProviderField = (
    provider: 'googleAnalytics' | 'posthog' | 'plausible',
    field: string,
    value: any
  ) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const updateNestedField = (
    provider: 'googleAnalytics' | 'posthog' | 'plausible',
    section: 'events' | 'tracking' | 'privacy',
    field: string,
    value: any
  ) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [section]: {
          ...prev[provider][section],
          [field]: value
        }
      }
    }));
  };

  const ProviderCard = ({
    name,
    description,
    providerKey,
    config,
    onToggle
  }: {
    name: string;
    description: string;
    providerKey: 'googleAnalytics' | 'posthog' | 'plausible';
    config: ProviderSettings;
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
                        onChange={(e) => updateProviderField(providerKey, 'measurementId', e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga4-tracking">Tracking ID (Legacy)</Label>
                      <Input
                        id="ga4-tracking"
                        value={config.trackingId}
                        onChange={(e) => updateProviderField(providerKey, 'trackingId', e.target.value)}
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
                      onChange={(e) => updateProviderField(providerKey, 'apiSecret', e.target.value)}
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
                        onChange={(e) => updateProviderField(providerKey, 'projectApiKey', e.target.value)}
                        placeholder="phc_xxxxxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="posthog-personal-key">Personal API Key</Label>
                      <Input
                        id="posthog-personal-key"
                        type="password"
                        value={config.personalApiKey}
                        onChange={(e) => updateProviderField(providerKey, 'personalApiKey', e.target.value)}
                        placeholder="phx_xxxxxxxxxxxxx"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posthog-host">Host URL</Label>
                    <Input
                      id="posthog-host"
                      value={config.host}
                      onChange={(e) => updateProviderField(providerKey, 'host', e.target.value)}
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
                        onChange={(e) => updateProviderField(providerKey, 'domain', e.target.value)}
                        placeholder="yourdomain.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plausible-api-key">API Key</Label>
                      <Input
                        id="plausible-api-key"
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => updateProviderField(providerKey, 'apiKey', e.target.value)}
                        placeholder="API key for stats access"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plausible-script">Script Source</Label>
                    <Input
                      id="plausible-script"
                      value={config.scriptSrc}
                      onChange={(e) => updateProviderField(providerKey, 'scriptSrc', e.target.value)}
                      placeholder="https://plausible.io/js/script.js"
                    />
                  </div>
                </>
              )}

              {/* Test Results */}
              {testResults[providerKey] && (
                <Alert className={testResults[providerKey].success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                  {testResults[providerKey].success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ✅ {testResults[providerKey].message}
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        ❌ {testResults[providerKey].message}
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              )}
            </TabsContent>            <TabsContent value="events" className="space-y-4">
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
                    <Switch
                      checked={enabled as boolean}
                      onCheckedChange={(checked) => updateNestedField(providerKey, 'events', eventKey, checked)}
                    />
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
                    value={config.customEventsList || ''}
                    onChange={(e) => updateProviderField(providerKey, 'customEventsList', e.target.value)}
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
                  <Switch
                    checked={config.tracking?.enhancedEcommerce}
                    onCheckedChange={(checked) => updateNestedField(providerKey, 'tracking', 'enhancedEcommerce', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>User ID Tracking</Label>
                    <p className="text-sm text-gray-500">Track logged-in users across sessions</p>
                  </div>
                  <Switch
                    checked={config.tracking?.userIdTracking}
                    onCheckedChange={(checked) => updateNestedField(providerKey, 'tracking', 'userIdTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cross-Domain Tracking</Label>
                    <p className="text-sm text-gray-500">Track users across multiple domains</p>
                  </div>
                  <Switch
                    checked={config.tracking?.crossDomainTracking}
                    onCheckedChange={(checked) => updateNestedField(providerKey, 'tracking', 'crossDomainTracking', checked)}
                  />
                </div>

                {name === "PostHog" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Recordings</Label>
                      <p className="text-sm text-gray-500">Record user sessions for analysis</p>
                    </div>
                    <Switch
                      checked={config.events?.sessionRecordings}
                      onCheckedChange={(checked) => updateNestedField(providerKey, 'events', 'sessionRecordings', checked)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Sample Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={config.tracking?.sampleRate || 100}
                      onChange={(e) => updateNestedField(providerKey, 'tracking', 'sampleRate', parseInt(e.target.value))}
                      className="w-20"
                    />
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
                  <Switch
                    checked={config.privacy?.cookieConsent}
                    onCheckedChange={(checked) => updateNestedField(providerKey, 'privacy', 'cookieConsent', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Anonymization</Label>
                    <p className="text-sm text-gray-500">Anonymize user IP addresses</p>
                  </div>
                  <Switch
                    checked={config.privacy?.ipAnonymization}
                    onCheckedChange={(checked) => updateNestedField(providerKey, 'privacy', 'ipAnonymization', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Respect Do Not Track</Label>
                    <p className="text-sm text-gray-500">Honor browser DNT settings</p>
                  </div>
                  <Switch
                    checked={config.privacy?.respectDNT}
                    onCheckedChange={(checked) => updateNestedField(providerKey, 'privacy', 'respectDNT', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={config.privacy?.dataRetention || 14}
                    onChange={(e) => updateNestedField(providerKey, 'privacy', 'dataRetention', parseInt(e.target.value))}
                  >
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
            <Button
              variant="outline"
              onClick={() => testConnection(providerKey)}
              disabled={testing === providerKey}
            >
              {testing === providerKey ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Analytics settings have been saved successfully! Your providers are now configured.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Providers</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure analytics and tracking providers for comprehensive user insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStats} disabled={loadingStats}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold mt-1">{stats.activeProviders} / 3</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Users</span>
              <span className="font-medium">{stats.overview.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Page Views</span>
              <span className="font-medium">{stats.overview.pageViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversions</span>
              <span className="font-medium">{stats.overview.conversions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New Users</span>
              <span className="font-medium">{stats.userInsights.newUsers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Returning</span>
              <span className="font-medium">{stats.userInsights.returningUsers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg. Session</span>
              <span className="font-medium">{stats.userInsights.avgSession}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Event Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subscriptions</span>
              <span className="font-medium">{stats.eventTracking.subscriptions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contracts</span>
              <span className="font-medium">{stats.eventTracking.contracts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payments</span>
              <span className="font-medium">{stats.eventTracking.payments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <ProviderCard
          name="Google Analytics 4"
          description="Comprehensive web and app analytics with machine learning insights"
          providerKey="googleAnalytics"
          config={providers.googleAnalytics}
          onToggle={() => toggleProvider('googleAnalytics')}
        />

        <ProviderCard
          name="PostHog"
          description="Product analytics with feature flags, session recordings, and A/B testing"
          providerKey="posthog"
          config={providers.posthog}
          onToggle={() => toggleProvider('posthog')}
        />

        <ProviderCard
          name="Plausible Analytics"
          description="Simple, privacy-focused analytics without cookies"
          providerKey="plausible"
          config={providers.plausible}
          onToggle={() => toggleProvider('plausible')}
        />
      </div>
    </div>
  );
}