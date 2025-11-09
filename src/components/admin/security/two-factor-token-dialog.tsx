// components/admin/security/two-factor-token-dialog.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { twoFactorService } from "@/lib/services/admin/two-factor.service";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (token: string) => void;
  title?: string;
  description?: string;
  action?: string;
}

export function TwoFactorTokenDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "Two-Factor Authentication Required",
  description = "Please enter your 2FA code to continue with this action",
  action = "Verify",
}: TwoFactorTokenDialogProps) {
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!token.trim()) {
      setError("Please enter your 2FA code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await twoFactorService.verify(token);

      if (result.valid) {
        onSuccess(token);
        setToken("");
        onOpenChange(false);
        toast({
          title: "Verified",
          description: "Two-factor authentication successful",
        });
      } else {
        setError(
          `Invalid code${
            result.remainingAttempts
              ? `. ${result.remainingAttempts} attempts remaining`
              : ""
          }`
        );
      }
    } catch (error: any) {
      setError(error.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setToken("");
      setError("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="twofa-token">Authentication Code</Label>
            <Input
              id="twofa-token"
              type="text"
              placeholder="000000"
              value={token}
              onChange={(e) => {
                setToken(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              maxLength={6}
              className="text-center font-mono text-lg tracking-widest"
              autoComplete="one-time-code"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying || token.length !== 6}
            >
              {isVerifying ? "Verifying..." : action}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
