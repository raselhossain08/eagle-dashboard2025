"use client";

import { useState, useEffect } from "react";
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
  Key,
  Loader2,
  Save,
  TestTube,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PaymentSettings {
  paypal: {
    enabled: boolean;
    mode: 'sandbox' | 'live';
    clientId: string;
    clientSecret: string;
    apiUrl?: string;
    configured: boolean;
  };
  stripe: {
    enabled: boolean;
    mode: 'test' | 'live';
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    configured: boolean;
  };
  lastUpdated?: string;
}

export default function PaymentProcessorsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    paypal?: { success: boolean; message?: string };
    stripe?: { success: boolean; message?: string };
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [settings, setSettings] = useState<PaymentSettings>({
    paypal: {
      enabled: false,
      mode: 'sandbox',
      clientId: '',
      clientSecret: '',
      configured: false
    },
    stripe: {
      enabled: false,
      mode: 'test',
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      configured: false
    }
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/payment-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        toast({
          title: "✅ Settings Saved Successfully!",
          description: "Payment gateway configurations have been updated and applied to the backend."
        });
        fetchSettings(); // Refresh settings

        // Hide success message after 3 seconds
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

  const testConnection = async (provider: 'paypal' | 'stripe') => {
    try {
      setTesting(provider);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/payment-settings/test/${provider}`, {
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
          description: `${provider.toUpperCase()} connection test passed. Your credentials are working correctly.`,
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
        description: error.message || `Failed to connect to ${provider}`
      });
    } finally {
      setTesting(null);
    }
  };

  const updatePayPalSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      paypal: {
        ...prev.paypal,
        [field]: value
      }
    }));
  };

  const updateStripeSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      stripe: {
        ...prev.stripe,
        [field]: value
      }
    }));
  };

  // Check if PayPal is properly configured
  const isPayPalConfigured = () => {
    return settings.paypal.clientId && settings.paypal.clientSecret && settings.paypal.clientId.length > 10;
  };

  // Check if Stripe is properly configured
  const isStripeConfigured = () => {
    return settings.stripe.publishableKey && settings.stripe.secretKey &&
      settings.stripe.publishableKey.length > 10 && settings.stripe.secretKey.length > 10;
  };

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
            Payment settings have been saved and applied successfully! Your payment gateways are now configured.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Processors</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure PayPal and Stripe payment gateways with live/sandbox modes
          </p>
        </div>
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

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">PayPal Status</p>
                <p className="text-2xl font-bold mt-1">
                  {settings.paypal.enabled && isPayPalConfigured() ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings.paypal.enabled && isPayPalConfigured() ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                {settings.paypal.enabled && isPayPalConfigured() ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
            {settings.paypal.enabled && (
              <p className="text-xs text-muted-foreground mt-2">
                Mode: {settings.paypal.mode === 'sandbox' ? '🧪 Sandbox' : '🚀 Live'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stripe Status</p>
                <p className="text-2xl font-bold mt-1">
                  {settings.stripe.enabled && isStripeConfigured() ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings.stripe.enabled && isStripeConfigured() ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                {settings.stripe.enabled && isStripeConfigured() ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
            {settings.stripe.enabled && (
              <p className="text-xs text-muted-foreground mt-2">
                Mode: {settings.stripe.mode === 'test' ? '🧪 Test' : '🚀 Live'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold mt-1">
                  {[
                    settings.paypal.enabled && isPayPalConfigured(),
                    settings.stripe.enabled && isStripeConfigured()
                  ].filter(Boolean).length} / 2
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Payment Processors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PayPal Configuration */}
      <Card className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">PayPal</CardTitle>
                <CardDescription>Accept payments through PayPal</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPayPalConfigured() ? (
                <Badge className="bg-green-50 text-green-700 border-green-200">
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
                checked={settings.paypal.enabled}
                onCheckedChange={(checked) => updatePayPalSettings('enabled', checked)}
              />
            </div>
          </div>
        </CardHeader>

        {settings.paypal.enabled && (
          <CardContent className="space-y-4">
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Environment Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={settings.paypal.mode === 'sandbox' ? 'default' : 'outline'}
                  onClick={() => updatePayPalSettings('mode', 'sandbox')}
                  className="flex-1"
                >
                  Sandbox (Test)
                </Button>
                <Button
                  variant={settings.paypal.mode === 'live' ? 'default' : 'outline'}
                  onClick={() => updatePayPalSettings('mode', 'live')}
                  className="flex-1"
                >
                  Live (Production)
                </Button>
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paypal-client-id">Client ID</Label>
                <Input
                  id="paypal-client-id"
                  type="text"
                  value={settings.paypal.clientId}
                  onChange={(e) => updatePayPalSettings('clientId', e.target.value)}
                  placeholder="AeA1QIZXiflr..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paypal-client-secret">Client Secret</Label>
                <Input
                  id="paypal-client-secret"
                  type="password"
                  value={settings.paypal.clientSecret}
                  onChange={(e) => updatePayPalSettings('clientSecret', e.target.value)}
                  placeholder="EL-RyYPKPh5u..."
                />
              </div>
            </div>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Get your PayPal credentials from your <a href="https://developer.paypal.com/dashboard/" target="_blank" className="underline">PayPal Developer Dashboard</a>.
                Use sandbox credentials for testing and live credentials for production.
              </AlertDescription>
            </Alert>

            {/* Test Results */}
            {testResults.paypal && (
              <Alert className={testResults.paypal.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {testResults.paypal.success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Connection successful! PayPal {settings.paypal.mode} credentials are working correctly.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      ❌ Connection failed: {testResults.paypal.message || "Please check your credentials"}
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => testConnection('paypal')}
                disabled={!settings.paypal.clientId || !settings.paypal.clientSecret || testing === 'paypal'}
              >
                {testing === 'paypal' ? (
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

      {/* Stripe Configuration */}
      <Card className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Stripe</CardTitle>
                <CardDescription>Accept cards and other payment methods</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isStripeConfigured() ? (
                <Badge className="bg-green-50 text-green-700 border-green-200">
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
                checked={settings.stripe.enabled}
                onCheckedChange={(checked) => updateStripeSettings('enabled', checked)}
              />
            </div>
          </div>
        </CardHeader>

        {settings.stripe.enabled && (
          <CardContent className="space-y-4">
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Environment Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={settings.stripe.mode === 'test' ? 'default' : 'outline'}
                  onClick={() => updateStripeSettings('mode', 'test')}
                  className="flex-1"
                >
                  Test Mode
                </Button>
                <Button
                  variant={settings.stripe.mode === 'live' ? 'default' : 'outline'}
                  onClick={() => updateStripeSettings('mode', 'live')}
                  className="flex-1"
                >
                  Live Mode
                </Button>
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-publishable">Publishable Key</Label>
                <Input
                  id="stripe-publishable"
                  type="text"
                  value={settings.stripe.publishableKey}
                  onChange={(e) => updateStripeSettings('publishableKey', e.target.value)}
                  placeholder="pk_test_... or pk_live_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  value={settings.stripe.secretKey}
                  onChange={(e) => updateStripeSettings('secretKey', e.target.value)}
                  placeholder="sk_test_... or sk_live_..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe-webhook">Webhook Secret (Optional)</Label>
              <Input
                id="stripe-webhook"
                type="password"
                value={settings.stripe.webhookSecret}
                onChange={(e) => updateStripeSettings('webhookSecret', e.target.value)}
                placeholder="whsec_..."
              />
            </div>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Get your Stripe API keys from your <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="underline">Stripe Dashboard</a>.
                Use test keys (pk_test, sk_test) for testing and live keys (pk_live, sk_live) for production.
              </AlertDescription>
            </Alert>

            {/* Test Results */}
            {testResults.stripe && (
              <Alert className={testResults.stripe.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {testResults.stripe.success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Connection successful! Stripe {settings.stripe.mode} credentials are working correctly.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      ❌ Connection failed: {testResults.stripe.message || "Please check your credentials"}
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => testConnection('stripe')}
                disabled={!settings.stripe.secretKey || testing === 'stripe'}
              >
                {testing === 'stripe' ? (
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

      {/* Security Notice */}
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
              All API keys and secrets are encrypted and stored securely in the database.
              Settings are applied immediately to the backend payment configuration.
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

          {settings.lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}