"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import settingsService, {
    NotificationSettings,
    PrivacySettings,
    SecuritySettings,
} from "@/lib/services/settings.service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Settings as SettingsIcon,
    Bell,
    Lock,
    Globe,
    Eye,
    Shield,
    Smartphone,
    Mail,
    Moon,
    Sun,
    Monitor,
    Save,
    AlertTriangle,
    CheckCircle,
    Key,
    Trash2,
    Download,
    Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [savedSection, setSavedSection] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Notification Settings
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        weeklyReport: true,
        monthlyReport: false,
        securityAlerts: true,
        productUpdates: false,
        newsletter: true,
    });

    // Privacy Settings
    const [privacy, setPrivacy] = useState<PrivacySettings>({
        profileVisibility: "public",
        showEmail: false,
        showActivity: true,
        allowMessages: true,
    });

    // Security Settings
    const [security, setSecurity] = useState<SecuritySettings>({
        twoFactorEnabled: false,
        sessionTimeout: "30",
        loginAlerts: true,
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await settingsService.getSettings();
            setNotifications(data.notifications);
            setPrivacy(data.privacy);
            setSecurity(data.security);
        } catch (error) {
            console.error('Error loading settings:', error);
            toast({
                title: "Error",
                description: "Failed to load settings",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (section: string) => {
        setIsSaving(true);
        setSavedSection(null);
        try {
            switch (section) {
                case 'notifications':
                    await settingsService.updateNotificationSettings(notifications);
                    break;
                case 'privacy':
                    await settingsService.updatePrivacySettings(privacy);
                    break;
                case 'security':
                    await settingsService.updateSecuritySettings(security);
                    break;
            }
            setSavedSection(section);
            toast({
                title: "Success",
                description: "Settings updated successfully",
            });
            setTimeout(() => setSavedSection(null), 3000);
        } catch (error: any) {
            console.error(`Error saving ${section} settings:`, error);
            toast({
                title: "Error",
                description: error.message || "Failed to save settings",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords don't match!",
            });
            return;
        }

        setIsSaving(true);
        try {
            await settingsService.changePassword(
                passwords.currentPassword,
                passwords.newPassword
            );
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setSavedSection("password");
            toast({
                title: "Success",
                description: "Password changed successfully",
            });
            setTimeout(() => setSavedSection(null), 3000);
        } catch (error: any) {
            console.error('Error changing password:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to change password",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            const data = await settingsService.exportData();
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `eagle-data-export-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Success",
                description: "Data exported successfully",
            });
        } catch (error: any) {
            console.error('Error exporting data:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to export data",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                                <SettingsIcon className="w-6 h-6 text-white" />
                            </div>
                            Settings
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage your account settings and preferences
                        </p>
                    </div>
                </div>

                {/* Appearance Settings */}
                <Card className="border-2 border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                {theme === 'dark' ? (
                                    <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize how the dashboard looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Theme</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "p-4 rounded-lg border-2 transition-all hover:scale-105",
                                        theme === 'light'
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-800"
                                    )}
                                >
                                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                                    <p className="text-sm font-medium">Light</p>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "p-4 rounded-lg border-2 transition-all hover:scale-105",
                                        theme === 'dark'
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-800"
                                    )}
                                >
                                    <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                    <p className="text-sm font-medium">Dark</p>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={cn(
                                        "p-4 rounded-lg border-2 transition-all hover:scale-105",
                                        theme === 'system'
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-800"
                                    )}
                                >
                                    <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                                    <p className="text-sm font-medium">System</p>
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="border-2 border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {/* Email Notifications */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={notifications.emailNotifications}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, emailNotifications: checked })
                                    }
                                />
                            </div>

                            {/* Push Notifications */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-sm text-gray-500">Receive push notifications</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={notifications.pushNotifications}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, pushNotifications: checked })
                                    }
                                />
                            </div>

                            {/* Security Alerts */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Security Alerts</p>
                                        <p className="text-sm text-gray-500">Critical security notifications</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={notifications.securityAlerts}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, securityAlerts: checked })
                                    }
                                />
                            </div>

                            {/* Weekly Report */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Weekly Report</p>
                                        <p className="text-sm text-gray-500">Receive weekly activity summaries</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={notifications.weeklyReport}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, weeklyReport: checked })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() => handleSave('notifications')}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                {savedSection === 'notifications' ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Saved!
                                    </>
                                ) : isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card className="border-2 border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            Privacy
                        </CardTitle>
                        <CardDescription>Control your privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {/* Profile Visibility */}
                            <div className="space-y-2">
                                <Label>Profile Visibility</Label>
                                <Select
                                    value={privacy.profileVisibility}
                                    onValueChange={(value) =>
                                        setPrivacy({ ...privacy, profileVisibility: value as 'public' | 'private' | 'friends' })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="friends">Friends Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Show Email */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div>
                                    <p className="font-medium">Show Email</p>
                                    <p className="text-sm text-gray-500">Display email on your profile</p>
                                </div>
                                <Switch
                                    checked={privacy.showEmail}
                                    onCheckedChange={(checked) =>
                                        setPrivacy({ ...privacy, showEmail: checked })
                                    }
                                />
                            </div>

                            {/* Show Activity */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div>
                                    <p className="font-medium">Show Activity</p>
                                    <p className="text-sm text-gray-500">Show your activity status</p>
                                </div>
                                <Switch
                                    checked={privacy.showActivity}
                                    onCheckedChange={(checked) =>
                                        setPrivacy({ ...privacy, showActivity: checked })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() => handleSave('privacy')}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {savedSection === 'privacy' ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="border-2 border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            Security
                        </CardTitle>
                        <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Change Password */}
                        <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Key className="w-4 h-4" />
                                Change Password
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) =>
                                            setPasswords({ ...passwords, currentPassword: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) =>
                                            setPasswords({ ...passwords, newPassword: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) =>
                                            setPasswords({ ...passwords, confirmPassword: e.target.value })
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={isSaving || !passwords.currentPassword || !passwords.newPassword}
                                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                >
                                    {savedSection === 'password' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Password Updated!
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Add an extra layer of security
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={security.twoFactorEnabled}
                                    onCheckedChange={(checked) =>
                                        setSecurity({ ...security, twoFactorEnabled: checked })
                                    }
                                />
                            </div>

                            {/* Login Alerts */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div>
                                    <p className="font-medium">Login Alerts</p>
                                    <p className="text-sm text-gray-500">Get notified of new logins</p>
                                </div>
                                <Switch
                                    checked={security.loginAlerts}
                                    onCheckedChange={(checked) =>
                                        setSecurity({ ...security, loginAlerts: checked })
                                    }
                                />
                            </div>

                            {/* Session Timeout */}
                            <div className="space-y-2">
                                <Label>Session Timeout</Label>
                                <Select
                                    value={security.sessionTimeout}
                                    onValueChange={(value) =>
                                        setSecurity({ ...security, sessionTimeout: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">1 hour</SelectItem>
                                        <SelectItem value="120">2 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() => handleSave('security')}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                            >
                                {savedSection === 'security' ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-2 border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            Data Management
                        </CardTitle>
                        <CardDescription>Export or delete your data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100">Export Your Data</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Download all your data in JSON format
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleExportData}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div>
                                <p className="font-medium text-red-900 dark:text-red-100">Delete Account</p>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Permanently delete your account and data
                                </p>
                            </div>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
