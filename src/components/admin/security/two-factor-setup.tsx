// components/admin/security/two-factor-setup.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ShieldCheck,
  Smartphone,
  Download,
  Key,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  twoFactorService,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
} from "@/lib/services/admin/two-factor.service";
import { useToast } from "@/hooks/use-toast";

export function TwoFactorSetup() {
  const [status, setStatus] = useState<TwoFactorStatusResponse | null>(null);
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(
    null
  );
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const { toast } = useToast();

  // Load 2FA status on component mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const statusData = await twoFactorService.getStatus();
      setStatus(statusData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load 2FA status",
      });
    }
  };

  const startSetup = async () => {
    setIsLoading(true);
    try {
      const data = await twoFactorService.setup();
      setSetupData(data);
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to start 2FA setup",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!verificationToken.trim()) {
      toast({
        title: "Verification Required",
        description:
          "Please enter the verification code from your authenticator app",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await twoFactorService.enable(verificationToken);
      setSetupData((prev) =>
        prev ? { ...prev, backupCodes: result.backupCodes } : null
      );
      setShowBackupCodes(true);
      await loadStatus();
      toast({
        title: "Success",
        description: "2FA has been enabled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!password.trim() || !verificationToken.trim()) {
      toast({
        title: "Authentication Required",
        description: "Please enter your password and a verification code",
      });
      return;
    }

    setIsLoading(true);
    try {
      await twoFactorService.disable(password, verificationToken);
      setPassword("");
      setVerificationToken("");
      await loadStatus();
      toast({
        title: "Success",
        description: "2FA has been disabled",
      });
    } catch (error: any) {
      toast({
        title: "Disable Failed",
        description: error.message || "Failed to disable 2FA",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
      setCopiedBackupCodes(true);
      setTimeout(() => setCopiedBackupCodes(false), 2000);
      toast({
        title: "Copied",
        description: "Backup codes copied to clipboard",
      });
    }
  };

  const downloadBackupCodes = async () => {
    try {
      const blob = await twoFactorService.downloadBackupCodes();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-codes-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Downloaded",
        description: "Backup codes downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download backup codes",
      });
    }
  };

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Loading 2FA Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.isEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-500" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {status.isEnabled
              ? "Your account is protected with two-factor authentication"
              : "Add an extra layer of security to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={status.isEnabled ? "default" : "secondary"}>
                  {status.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
                {status.hasBackupCodes && (
                  <Badge variant="outline">
                    {status.backupCodesCount} backup codes
                  </Badge>
                )}
              </div>
              {status.lastUsed && (
                <p className="text-sm text-muted-foreground">
                  Last used: {new Date(status.lastUsed).toLocaleString()}
                </p>
              )}
            </div>

            {!status.isEnabled ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={startSetup} disabled={isLoading}>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Set Up 2FA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      Follow these steps to secure your account with 2FA
                    </DialogDescription>
                  </DialogHeader>

                  {setupData && (
                    <Tabs defaultValue="qr" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="qr">QR Code</TabsTrigger>
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                      </TabsList>

                      <TabsContent value="qr" className="space-y-4">
                        <div className="text-center">
                          <img
                            src={setupData.qrCode}
                            alt="2FA QR Code"
                            className="mx-auto border rounded-lg p-2"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Scan this QR code with your authenticator app
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="manual" className="space-y-4">
                        <div>
                          <Label>Manual Entry Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={setupData.manualEntryKey}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  setupData.manualEntryKey
                                )
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <Separator />

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="verification-token">
                            Verification Code
                          </Label>
                          <Input
                            id="verification-token"
                            placeholder="Enter 6-digit code"
                            value={verificationToken}
                            onChange={(e) =>
                              setVerificationToken(e.target.value)
                            }
                            maxLength={6}
                            className="text-center font-mono"
                          />
                        </div>

                        <Button
                          onClick={enableTwoFactor}
                          disabled={isLoading || !verificationToken.trim()}
                          className="w-full"
                        >
                          {isLoading ? "Verifying..." : "Enable 2FA"}
                        </Button>
                      </div>
                    </Tabs>
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Disable 2FA</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      This will remove 2FA protection from your account. Are you
                      sure?
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Disabling 2FA will reduce your account security. Make
                        sure you understand the risks.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="disable-password">Current Password</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="disable-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="disable-token">2FA Code</Label>
                      <Input
                        id="disable-token"
                        placeholder="Enter 6-digit code"
                        value={verificationToken}
                        onChange={(e) => setVerificationToken(e.target.value)}
                        maxLength={6}
                        className="text-center font-mono"
                      />
                    </div>

                    <Button
                      variant="destructive"
                      onClick={disableTwoFactor}
                      disabled={
                        isLoading ||
                        !password.trim() ||
                        !verificationToken.trim()
                      }
                      className="w-full"
                    >
                      {isLoading ? "Disabling..." : "Disable 2FA"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Codes Display */}
      {showBackupCodes && setupData?.backupCodes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Save these backup codes in a safe place. You can use them to
              access your account if you lose your phone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> These codes can only be used once.
                Save them securely and don't share them with anyone.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="py-1">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={copyBackupCodes} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                {copiedBackupCodes ? "Copied!" : "Copy Codes"}
              </Button>
              <Button onClick={downloadBackupCodes} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
