"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Settings, 
  Flag, 
  FileText, 
  Link, 
  Wrench,
  RefreshCw,
  Eye,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Download,
  Shield,
  Globe,
  Zap,
  BarChart3,
  Clock,
  Users
} from 'lucide-react';
import {
  systemSettingsService,
  SystemSettings,
  SystemAnalytics,
  FeatureFlag,
  LegalText,
  PolicyUrl,
  SystemConfiguration,
  CreateFeatureFlagData,
  CreateLegalTextData,
  CreatePolicyUrlData
} from '@/src/lib/services/admin/system-settings.service';

export default function SystemSettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dialog states
  const [showFeatureFlagDialog, setShowFeatureFlagDialog] = useState(false);
  const [showLegalTextDialog, setShowLegalTextDialog] = useState(false);
  const [showPolicyUrlDialog, setShowPolicyUrlDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  
  // Selected items for editing
  const [selectedFeatureFlag, setSelectedFeatureFlag] = useState<FeatureFlag | null>(null);
  const [selectedLegalText, setSelectedLegalText] = useState<LegalText | null>(null);
  const [selectedPolicyUrl, setSelectedPolicyUrl] = useState<PolicyUrl | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfiguration | null>(null);

  // Form states
  const [featureFlagForm, setFeatureFlagForm] = useState<CreateFeatureFlagData>({
    name: '',
    enabled: false,
    environment: 'all',
    rolloutPercentage: 100,
    targetRoles: [],
    targetUsers: []
  });

  const [legalTextForm, setLegalTextForm] = useState<CreateLegalTextData>({
    type: 'privacy_policy',
    version: '1.0',
    title: '',
    content: '',
    contentFormat: 'html',
    language: 'en',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [policyUrlForm, setPolicyUrlForm] = useState<CreatePolicyUrlData>({
    name: '',
    url: '',
    category: 'other',
    isActive: true,
    isPublic: true,
    displayOrder: 0,
    openInNewTab: true
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    message: 'System is currently under maintenance. Please try again later.'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSettings(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await systemSettingsService.getSystemSettings();
      if (response.success) {
        setSettings(response.data);
        setMaintenanceForm({
          enabled: response.data.maintenanceMode,
          message: response.data.maintenanceMessage
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await systemSettingsService.getSystemAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Don't throw here as analytics is not critical
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  // Feature Flag Management
  const handleCreateFeatureFlag = async () => {
    try {
      if (!featureFlagForm.name) {
        toast.error('Feature flag name is required');
        return;
      }

      const key = featureFlagForm.name.toLowerCase().replace(/\s+/g, '_');
      await systemSettingsService.updateFeatureFlag(key, featureFlagForm);
      
      toast.success('Feature flag created successfully');
      setShowFeatureFlagDialog(false);
      resetFeatureFlagForm();
      loadSettings();
    } catch (error) {
      console.error('Error creating feature flag:', error);
      toast.error('Failed to create feature flag');
    }
  };

  const handleUpdateFeatureFlag = async () => {
    if (!selectedFeatureFlag) return;

    try {
      await systemSettingsService.updateFeatureFlag(selectedFeatureFlag.key, featureFlagForm);
      
      toast.success('Feature flag updated successfully');
      setShowFeatureFlagDialog(false);
      resetFeatureFlagForm();
      setSelectedFeatureFlag(null);
      loadSettings();
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast.error('Failed to update feature flag');
    }
  };

  const handleDeleteFeatureFlag = async (key: string) => {
    try {
      await systemSettingsService.deleteFeatureFlag(key);
      toast.success('Feature flag deleted successfully');
      loadSettings();
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      toast.error('Failed to delete feature flag');
    }
  };

  // Legal Text Management
  const handleCreateLegalText = async () => {
    try {
      if (!legalTextForm.title || !legalTextForm.content) {
        toast.error('Title and content are required');
        return;
      }

      await systemSettingsService.addLegalText(legalTextForm);
      
      toast.success('Legal text created successfully');
      setShowLegalTextDialog(false);
      resetLegalTextForm();
      loadSettings();
    } catch (error) {
      console.error('Error creating legal text:', error);
      toast.error('Failed to create legal text');
    }
  };

  const handleApproveLegalText = async (id: string) => {
    try {
      await systemSettingsService.approveLegalText(id);
      toast.success('Legal text approved successfully');
      loadSettings();
    } catch (error) {
      console.error('Error approving legal text:', error);
      toast.error('Failed to approve legal text');
    }
  };

  // Policy URL Management
  const handleCreatePolicyUrl = async () => {
    try {
      if (!policyUrlForm.name || !policyUrlForm.url) {
        toast.error('Name and URL are required');
        return;
      }

      const key = policyUrlForm.name.toLowerCase().replace(/\s+/g, '_');
      await systemSettingsService.updatePolicyUrl(key, policyUrlForm);
      
      toast.success('Policy URL created successfully');
      setShowPolicyUrlDialog(false);
      resetPolicyUrlForm();
      loadSettings();
    } catch (error) {
      console.error('Error creating policy URL:', error);
      toast.error('Failed to create policy URL');
    }
  };

  const handleDeletePolicyUrl = async (key: string) => {
    try {
      await systemSettingsService.deletePolicyUrl(key);
      toast.success('Policy URL deleted successfully');
      loadSettings();
    } catch (error) {
      console.error('Error deleting policy URL:', error);
      toast.error('Failed to delete policy URL');
    }
  };

  // Maintenance Mode
  const handleToggleMaintenanceMode = async () => {
    try {
      await systemSettingsService.toggleMaintenanceMode(
        maintenanceForm.enabled,
        maintenanceForm.message
      );
      
      toast.success(`Maintenance mode ${maintenanceForm.enabled ? 'enabled' : 'disabled'}`);
      setShowMaintenanceDialog(false);
      loadSettings();
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Failed to toggle maintenance mode');
    }
  };

  // Export Settings
  const handleExportSettings = async () => {
    try {
      const blob = await systemSettingsService.exportSettings();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Settings exported successfully');
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Failed to export settings');
    }
  };

  // Form reset functions
  const resetFeatureFlagForm = () => {
    setFeatureFlagForm({
      name: '',
      enabled: false,
      environment: 'all',
      rolloutPercentage: 100,
      targetRoles: [],
      targetUsers: []
    });
  };

  const resetLegalTextForm = () => {
    setLegalTextForm({
      type: 'privacy_policy',
      version: '1.0',
      title: '',
      content: '',
      contentFormat: 'html',
      language: 'en',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetPolicyUrlForm = () => {
    setPolicyUrlForm({
      name: '',
      url: '',
      category: 'other',
      isActive: true,
      isPublic: true,
      displayOrder: 0,
      openInNewTab: true
    });
  };

  // Edit handlers
  const handleEditFeatureFlag = (flag: FeatureFlag) => {
    setSelectedFeatureFlag(flag);
    setFeatureFlagForm({
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      environment: flag.environment,
      rolloutPercentage: flag.rolloutPercentage,
      targetRoles: flag.targetRoles,
      targetUsers: flag.targetUsers
    });
    setShowFeatureFlagDialog(true);
  };

  const handleEditPolicyUrl = (url: PolicyUrl) => {
    setSelectedPolicyUrl(url);
    setPolicyUrlForm({
      name: url.name,
      description: url.description,
      url: url.url,
      category: url.category,
      isActive: url.isActive,
      isPublic: url.isPublic,
      displayOrder: url.displayOrder,
      openInNewTab: url.openInNewTab
    });
    setShowPolicyUrlDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage feature flags, legal texts, and system configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
            <DialogTrigger asChild>
              <Button variant={settings?.maintenanceMode ? "destructive" : "default"}>
                <Shield className="mr-2 h-4 w-4" />
                {settings?.maintenanceMode ? 'Maintenance ON' : 'Maintenance Mode'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Maintenance Mode</DialogTitle>
                <DialogDescription>
                  Toggle maintenance mode for the entire system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={maintenanceForm.enabled}
                    onCheckedChange={(checked) => 
                      setMaintenanceForm({...maintenanceForm, enabled: checked})
                    }
                  />
                  <Label>Enable maintenance mode</Label>
                </div>
                <div>
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={maintenanceForm.message}
                    onChange={(e) => 
                      setMaintenanceForm({...maintenanceForm, message: e.target.value})
                    }
                    placeholder="Enter maintenance message..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleToggleMaintenanceMode}>
                  {maintenanceForm.enabled ? 'Enable' : 'Disable'} Maintenance
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.featureFlags.total}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.featureFlags.enabled} enabled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Texts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.legalTexts.total}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.legalTexts.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Policy URLs</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.policyUrls.total}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.policyUrls.public} public
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configurations</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.configurations.total}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.configurations.secret} secret
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="feature-flags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="legal-texts">Legal Texts</TabsTrigger>
          <TabsTrigger value="policy-urls">Policy URLs</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
        </TabsList>

        {/* Feature Flags Tab */}
        <TabsContent value="feature-flags">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Manage feature toggles and rollout controls
                  </CardDescription>
                </div>
                <Dialog open={showFeatureFlagDialog} onOpenChange={setShowFeatureFlagDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setSelectedFeatureFlag(null); resetFeatureFlagForm(); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Feature Flag
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedFeatureFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure feature flag settings and targeting rules.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="flagName">Name</Label>
                        <Input
                          id="flagName"
                          value={featureFlagForm.name}
                          onChange={(e) => setFeatureFlagForm({...featureFlagForm, name: e.target.value})}
                          placeholder="Enter feature flag name"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="flagDescription">Description</Label>
                        <Textarea
                          id="flagDescription"
                          value={featureFlagForm.description || ''}
                          onChange={(e) => setFeatureFlagForm({...featureFlagForm, description: e.target.value})}
                          placeholder="Enter description..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="flagEnvironment">Environment</Label>
                        <Select
                          value={featureFlagForm.environment}
                          onValueChange={(value) => setFeatureFlagForm({...featureFlagForm, environment: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Environments</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="rolloutPercentage">Rollout Percentage</Label>
                        <Input
                          id="rolloutPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={featureFlagForm.rolloutPercentage}
                          onChange={(e) => setFeatureFlagForm({...featureFlagForm, rolloutPercentage: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Switch
                          checked={featureFlagForm.enabled}
                          onCheckedChange={(checked) => setFeatureFlagForm({...featureFlagForm, enabled: checked})}
                        />
                        <Label>Enable feature flag</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowFeatureFlagDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={selectedFeatureFlag ? handleUpdateFeatureFlag : handleCreateFeatureFlag}>
                        {selectedFeatureFlag ? 'Update' : 'Create'} Feature Flag
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Rollout</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings?.featureFlags?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No feature flags found
                        </TableCell>
                      </TableRow>
                    ) : (
                      settings?.featureFlags?.map((flag) => (
                        <TableRow key={flag._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{flag.name}</div>
                              <div className="text-sm text-muted-foreground">{flag.key}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {flag.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={systemSettingsService.getEnvironmentColor(flag.environment)}>
                              {flag.environment}
                            </Badge>
                          </TableCell>
                          <TableCell>{flag.rolloutPercentage}%</TableCell>
                          <TableCell>
                            {flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditFeatureFlag(flag)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteFeatureFlag(flag.key)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Texts Tab */}
        <TabsContent value="legal-texts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Legal Texts</CardTitle>
                  <CardDescription>
                    Manage privacy policies, terms of service, and legal documents
                  </CardDescription>
                </div>
                <Dialog open={showLegalTextDialog} onOpenChange={setShowLegalTextDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setSelectedLegalText(null); resetLegalTextForm(); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Legal Text
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Create Legal Text</DialogTitle>
                      <DialogDescription>
                        Add a new legal document or policy text.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="textType">Type</Label>
                        <Select
                          value={legalTextForm.type}
                          onValueChange={(value) => setLegalTextForm({...legalTextForm, type: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
                            <SelectItem value="terms_of_service">Terms of Service</SelectItem>
                            <SelectItem value="cookie_policy">Cookie Policy</SelectItem>
                            <SelectItem value="data_protection">Data Protection</SelectItem>
                            <SelectItem value="gdpr_notice">GDPR Notice</SelectItem>
                            <SelectItem value="ccpa_notice">CCPA Notice</SelectItem>
                            <SelectItem value="disclaimer">Disclaimer</SelectItem>
                            <SelectItem value="acceptable_use">Acceptable Use</SelectItem>
                            <SelectItem value="refund_policy">Refund Policy</SelectItem>
                            <SelectItem value="subscription_terms">Subscription Terms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="textVersion">Version</Label>
                        <Input
                          id="textVersion"
                          value={legalTextForm.version}
                          onChange={(e) => setLegalTextForm({...legalTextForm, version: e.target.value})}
                          placeholder="1.0"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="textTitle">Title</Label>
                        <Input
                          id="textTitle"
                          value={legalTextForm.title}
                          onChange={(e) => setLegalTextForm({...legalTextForm, title: e.target.value})}
                          placeholder="Enter document title"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="textContent">Content</Label>
                        <Textarea
                          id="textContent"
                          value={legalTextForm.content}
                          onChange={(e) => setLegalTextForm({...legalTextForm, content: e.target.value})}
                          placeholder="Enter legal text content..."
                          rows={8}
                        />
                      </div>
                      <div>
                        <Label htmlFor="effectiveDate">Effective Date</Label>
                        <Input
                          id="effectiveDate"
                          type="date"
                          value={legalTextForm.effectiveDate}
                          onChange={(e) => setLegalTextForm({...legalTextForm, effectiveDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Input
                          id="language"
                          value={legalTextForm.language}
                          onChange={(e) => setLegalTextForm({...legalTextForm, language: e.target.value})}
                          placeholder="en"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowLegalTextDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateLegalText}>
                        Create Legal Text
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings?.legalTexts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No legal texts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      settings?.legalTexts?.map((text) => (
                        <TableRow key={text._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{text.title}</div>
                              <div className="text-sm text-muted-foreground">{text.language}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {systemSettingsService.formatLegalTextType(text.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>v{text.version}</TableCell>
                          <TableCell>
                            <Badge className={systemSettingsService.getStatusColor(text.approvalStatus)}>
                              {text.approvalStatus.replace('_', ' ')}
                            </Badge>
                            {text.isActive && (
                              <Badge className="ml-1 bg-green-100 text-green-800">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(text.effectiveDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {text.approvalStatus === 'pending_review' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => text._id && handleApproveLegalText(text._id)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy URLs Tab */}
        <TabsContent value="policy-urls">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy URLs</CardTitle>
                  <CardDescription>
                    Manage external policy links and important URLs
                  </CardDescription>
                </div>
                <Dialog open={showPolicyUrlDialog} onOpenChange={setShowPolicyUrlDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setSelectedPolicyUrl(null); resetPolicyUrlForm(); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Policy URL
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedPolicyUrl ? 'Edit Policy URL' : 'Create Policy URL'}
                      </DialogTitle>
                      <DialogDescription>
                        Add or edit a policy URL or important link.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="urlName">Name</Label>
                        <Input
                          id="urlName"
                          value={policyUrlForm.name}
                          onChange={(e) => setPolicyUrlForm({...policyUrlForm, name: e.target.value})}
                          placeholder="Enter URL name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          value={policyUrlForm.url}
                          onChange={(e) => setPolicyUrlForm({...policyUrlForm, url: e.target.value})}
                          placeholder="https://example.com/policy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="urlCategory">Category</Label>
                        <Select
                          value={policyUrlForm.category}
                          onValueChange={(value) => setPolicyUrlForm({...policyUrlForm, category: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="privacy">Privacy</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="external_service">External Service</SelectItem>
                            <SelectItem value="documentation">Documentation</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="displayOrder">Display Order</Label>
                        <Input
                          id="displayOrder"
                          type="number"
                          value={policyUrlForm.displayOrder}
                          onChange={(e) => setPolicyUrlForm({...policyUrlForm, displayOrder: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={policyUrlForm.isActive}
                          onCheckedChange={(checked) => setPolicyUrlForm({...policyUrlForm, isActive: checked})}
                        />
                        <Label>Active</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={policyUrlForm.isPublic}
                          onCheckedChange={(checked) => setPolicyUrlForm({...policyUrlForm, isPublic: checked})}
                        />
                        <Label>Public</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowPolicyUrlDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePolicyUrl}>
                        {selectedPolicyUrl ? 'Update' : 'Create'} Policy URL
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings?.policyUrls?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No policy URLs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      settings?.policyUrls?.map((url) => (
                        <TableRow key={url._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{url.name}</div>
                              <div className="text-sm text-muted-foreground">{url.key}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a 
                              href={url.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate max-w-64 block"
                            >
                              {url.url}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge className={systemSettingsService.getCategoryColor(url.category)}>
                              {systemSettingsService.formatPolicyCategory(url.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Badge className={url.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {url.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {url.isPublic && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{url.displayOrder}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPolicyUrl(url)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePolicyUrl(url.key)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configurations">
          <Card>
            <CardHeader>
              <CardTitle>System Configurations</CardTitle>
              <CardDescription>
                View and manage system configuration values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings?.configurations?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No configurations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      settings?.configurations?.map((config) => (
                        <TableRow key={config._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-sm text-muted-foreground font-mono">{config.key}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {config.category.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm max-w-32 truncate">
                              {config.isSecret ? '••••••••' : String(config.value)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{config.dataType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={systemSettingsService.getEnvironmentColor(config.environment)}>
                              {config.environment}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!config.isReadOnly && (
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}