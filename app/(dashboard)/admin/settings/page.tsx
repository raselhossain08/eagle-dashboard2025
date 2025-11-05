// app/admin/settings/page.tsx
'use client'

import { useState } from 'react'
import { Save, Bell, Shield, Database, Users, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Admin Dashboard',
    siteDescription: 'RBAC Administration System',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enable2FA: true,
    enableAuditLog: true
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    securityAlerts: true,
    userActivities: false,
    systemUpdates: true
  })

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Settings Saved',
        description: `${section} settings have been updated successfully`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateGeneralSetting = (field: string, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
  }

  const updateSecuritySetting = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
  }

  const updateNotificationSetting = (field: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure system preferences and security settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => updateGeneralSetting('siteName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => updateGeneralSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => updateGeneralSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => updateGeneralSetting('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <div className="text-sm text-gray-500">
                    Put the system in maintenance mode
                  </div>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => updateGeneralSetting('maintenanceMode', checked)}
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings('General')}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordRequireSpecial">Require Special Characters</Label>
                    <div className="text-sm text-gray-500">
                      Passwords must contain special characters
                    </div>
                  </div>
                  <Switch
                    id="passwordRequireSpecial"
                    checked={securitySettings.passwordRequireSpecial}
                    onCheckedChange={(checked) => updateSecuritySetting('passwordRequireSpecial', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                    <div className="text-sm text-gray-500">
                      Passwords must contain numbers
                    </div>
                  </div>
                  <Switch
                    id="passwordRequireNumbers"
                    checked={securitySettings.passwordRequireNumbers}
                    onCheckedChange={(checked) => updateSecuritySetting('passwordRequireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable2FA">Enable Two-Factor Authentication</Label>
                    <div className="text-sm text-gray-500">
                      Require 2FA for all users
                    </div>
                  </div>
                  <Switch
                    id="enable2FA"
                    checked={securitySettings.enable2FA}
                    onCheckedChange={(checked) => updateSecuritySetting('enable2FA', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                    <div className="text-sm text-gray-500">
                      Log all system activities
                    </div>
                  </div>
                  <Switch
                    id="enableAuditLog"
                    checked={securitySettings.enableAuditLog}
                    onCheckedChange={(checked) => updateSecuritySetting('enableAuditLog', checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('Security')}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <div className="text-sm text-gray-500">
                      Receive email notifications for important events
                    </div>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="securityAlerts">Security Alerts</Label>
                    <div className="text-sm text-gray-500">
                      Receive alerts for security-related events
                    </div>
                  </div>
                  <Switch
                    id="securityAlerts"
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(checked) => updateNotificationSetting('securityAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="userActivities">User Activity Reports</Label>
                    <div className="text-sm text-gray-500">
                      Receive reports on user activities
                    </div>
                  </div>
                  <Switch
                    id="userActivities"
                    checked={notificationSettings.userActivities}
                    onCheckedChange={(checked) => updateNotificationSetting('userActivities', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="systemUpdates">System Update Notifications</Label>
                    <div className="text-sm text-gray-500">
                      Notify about available system updates
                    </div>
                  </div>
                  <Switch
                    id="systemUpdates"
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) => updateNotificationSetting('systemUpdates', checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('Notification')}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Settings */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management Settings</CardTitle>
              <CardDescription>
                Configure user registration and management policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  User management settings configuration coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}