'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Shield,
  Settings,
  Send,
  RefreshCw,
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';
import {
  verificationService,
  type VerificationSettings,
  type VerificationStatus,
  type VerificationAttempt
} from '@/lib/services/verification.service';

export default function VerifySettingsPage() {
  const [settings, setSettings] = useState<VerificationSettings | null>(null);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [attempts, setAttempts] = useState<VerificationAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const [settingsRes, statusRes, attemptsRes] = await Promise.all([
        verificationService.getVerificationSettings(),
        verificationService.getVerificationStatus(),
        verificationService.getRecentAttempts(20, 'all')
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }

      if (statusRes.success && statusRes.data) {
        setStatus(statusRes.data);
      }

      if (attemptsRes.success && attemptsRes.data) {
        setAttempts(attemptsRes.data);
      }
    } catch (error) {
      console.error('Failed to load verification data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setSending(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await verificationService.sendVerificationEmail();

      if (response.success) {
        setSuccessMessage('Verification email sent successfully! Check your inbox.');
        if (settings?.emailVerification.resendCooldown) {
          setCountdown(settings.emailVerification.resendCooldown * 60);
        }
        await loadData();
      } else {
        setErrorMessage(response.message || 'Failed to send verification email');
      }
    } catch (error: any) {
      console.error('Send verification error:', error);
      setErrorMessage(error.message || 'Failed to send verification email');
      if (error.message.includes('wait')) {
        const match = error.message.match(/(\d+) seconds/);
        if (match) {
          setCountdown(parseInt(match[1]));
        }
      }
    } finally {
      setSending(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setSending(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await verificationService.resendVerificationEmail();

      if (response.success) {
        setSuccessMessage('Verification email resent successfully!');
        if (settings?.emailVerification.resendCooldown) {
          setCountdown(settings.emailVerification.resendCooldown * 60);
        }
        await loadData();
      } else {
        setErrorMessage(response.message || 'Failed to resend verification email');
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setErrorMessage(error.message || 'Failed to resend verification email');
      if (error.message.includes('wait')) {
        const match = error.message.match(/(\d+) seconds/);
        if (match) {
          setCountdown(parseInt(match[1]));
        }
      }
    } finally {
      setSending(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await verificationService.updateVerificationSettings(settings);

      if (response.success) {
        setSuccessMessage('Settings updated successfully!');
        if (response.data) {
          setSettings(response.data);
        }
      } else {
        setErrorMessage(response.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Update settings error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...(settings[section as keyof VerificationSettings] as any),
        [key]: value
      }
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage email verification and account security settings
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Email Template
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Current email verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {status?.verified ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{status?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {status?.verified ? 'Email Verified' : 'Email Not Verified'}
                    </p>
                  </div>
                </div>
                <Badge variant={status?.verified ? 'default' : 'secondary'}>
                  {status?.verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              {/* Verification Details */}
              {status?.verified && status.verifiedAt && (
                <div className="space-y-2">
                  <Label>Verified At</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(status.verifiedAt)}
                  </p>
                </div>
              )}

              {/* Pending Verification */}
              {status?.pendingVerification && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-medium">Pending Verification</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Sent At</Label>
                      <p className="text-muted-foreground">
                        {formatDate(status.pendingVerification.sentAt)}
                      </p>
                    </div>
                    <div>
                      <Label>Expires At</Label>
                      <p className="text-muted-foreground">
                        {formatDate(status.pendingVerification.expiresAt)}
                      </p>
                    </div>
                    <div>
                      <Label>Attempts</Label>
                      <p className="text-muted-foreground">
                        {status.pendingVerification.attempts}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!status?.verified && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendVerification}
                    disabled={sending || countdown > 0}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {countdown > 0 ? `Wait ${formatCountdown(countdown)}` : 'Send Verification Email'}
                  </Button>
                  {status?.pendingVerification && (
                    <Button
                      onClick={handleResendVerification}
                      disabled={sending || countdown > 0}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Verification Attempts</CardTitle>
              <CardDescription>History of verification emails</CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No verification attempts found
                </p>
              ) : (
                <div className="space-y-2">
                  {attempts.slice(0, 10).map((attempt) => (
                    <div
                      key={attempt._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {attempt.verifiedAt ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : new Date(attempt.expiresAt) < new Date() ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{attempt.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(attempt.createdAt)} • {attempt.attempts} attempts
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          attempt.verifiedAt
                            ? 'default'
                            : new Date(attempt.expiresAt) < new Date()
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {attempt.verifiedAt
                          ? 'Verified'
                          : new Date(attempt.expiresAt) < new Date()
                            ? 'Expired'
                            : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Verification Settings</CardTitle>
              <CardDescription>Configure email verification behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to verify their email addresses
                  </p>
                </div>
                <Switch
                  checked={settings?.emailVerification.enabled}
                  onCheckedChange={(checked) =>
                    updateSetting('emailVerification', 'enabled', checked)
                  }
                />
              </div>

              <Separator />

              {/* Required */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  checked={settings?.emailVerification.required}
                  onCheckedChange={(checked) =>
                    updateSetting('emailVerification', 'required', checked)
                  }
                />
              </div>

              <Separator />

              {/* Auto Send */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Send on Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send verification email when users register
                  </p>
                </div>
                <Switch
                  checked={settings?.emailVerification.autoSendOnRegister}
                  onCheckedChange={(checked) =>
                    updateSetting('emailVerification', 'autoSendOnRegister', checked)
                  }
                />
              </div>

              <Separator />

              {/* Token Expiry */}
              <div className="space-y-2">
                <Label htmlFor="tokenExpiry">Token Expiry (hours)</Label>
                <Input
                  id="tokenExpiry"
                  type="number"
                  min={1}
                  max={168}
                  value={settings?.emailVerification.tokenExpiry}
                  onChange={(e) =>
                    updateSetting('emailVerification', 'tokenExpiry', parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  How long verification tokens remain valid (1-168 hours)
                </p>
              </div>

              {/* Resend Cooldown */}
              <div className="space-y-2">
                <Label htmlFor="resendCooldown">Resend Cooldown (minutes)</Label>
                <Input
                  id="resendCooldown"
                  type="number"
                  min={1}
                  max={60}
                  value={settings?.emailVerification.resendCooldown}
                  onChange={(e) =>
                    updateSetting('emailVerification', 'resendCooldown', parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Minimum time between resend requests (1-60 minutes)
                </p>
              </div>

              {/* Max Attempts */}
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min={1}
                  max={20}
                  value={settings?.emailVerification.maxAttempts}
                  onChange={(e) =>
                    updateSetting('emailVerification', 'maxAttempts', parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Maximum verification attempts before locking
                </p>
              </div>

              {/* Save Button */}
              <Button onClick={handleUpdateSettings} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Template Tab */}
        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Template</CardTitle>
              <CardDescription>Customize verification email appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={settings?.emailTemplate.subject}
                  onChange={(e) => updateSetting('emailTemplate', 'subject', e.target.value)}
                />
              </div>

              {/* From Name */}
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={settings?.emailTemplate.fromName}
                  onChange={(e) => updateSetting('emailTemplate', 'fromName', e.target.value)}
                />
              </div>

              {/* From Email */}
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings?.emailTemplate.fromEmail}
                  onChange={(e) => updateSetting('emailTemplate', 'fromEmail', e.target.value)}
                />
              </div>

              <Separator />

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={settings?.emailTemplate.logoUrl}
                  onChange={(e) => updateSetting('emailTemplate', 'logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              {/* Button Text */}
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={settings?.emailTemplate.buttonText}
                  onChange={(e) => updateSetting('emailTemplate', 'buttonText', e.target.value)}
                />
              </div>

              {/* Button Color */}
              <div className="space-y-2">
                <Label htmlFor="buttonColor">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="buttonColor"
                    type="color"
                    value={settings?.emailTemplate.buttonColor}
                    onChange={(e) => updateSetting('emailTemplate', 'buttonColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={settings?.emailTemplate.buttonColor}
                    onChange={(e) => updateSetting('emailTemplate', 'buttonColor', e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Footer Text */}
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  value={settings?.emailTemplate.footerText}
                  onChange={(e) => updateSetting('emailTemplate', 'footerText', e.target.value)}
                />
              </div>

              {/* Save Button */}
              <Button onClick={handleUpdateSettings} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Additional security and protection options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Block Disposable Emails */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Block Disposable Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent registration with temporary email addresses
                  </p>
                </div>
                <Switch
                  checked={settings?.security.blockDisposableEmails}
                  onCheckedChange={(checked) =>
                    updateSetting('security', 'blockDisposableEmails', checked)
                  }
                />
              </div>

              <Separator />

              {/* CAPTCHA on Resend */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>CAPTCHA on Resend</Label>
                  <p className="text-sm text-muted-foreground">
                    Require CAPTCHA when resending verification emails
                  </p>
                </div>
                <Switch
                  checked={settings?.security.captchaOnResend}
                  onCheckedChange={(checked) =>
                    updateSetting('security', 'captchaOnResend', checked)
                  }
                />
              </div>

              <Separator />

              {/* IP Rate Limiting */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit verification requests per IP address
                  </p>
                </div>
                <Switch
                  checked={settings?.security.ipRateLimit.enabled}
                  onCheckedChange={(checked) => {
                    if (!settings) return;
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        ipRateLimit: {
                          ...settings.security.ipRateLimit,
                          enabled: checked
                        }
                      }
                    });
                  }}
                />
              </div>

              {/* Max Requests per IP */}
              {settings?.security.ipRateLimit.enabled && (
                <div className="space-y-2 pl-4">
                  <Label htmlFor="maxRequests">Maximum Requests per IP (per hour)</Label>
                  <Input
                    id="maxRequests"
                    type="number"
                    min={1}
                    max={100}
                    value={settings?.security.ipRateLimit.maxRequests}
                    onChange={(e) => {
                      if (!settings) return;
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          ipRateLimit: {
                            ...settings.security.ipRateLimit,
                            maxRequests: parseInt(e.target.value)
                          }
                        }
                      });
                    }}
                  />
                </div>
              )}

              {/* Save Button */}
              <Button onClick={handleUpdateSettings} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}