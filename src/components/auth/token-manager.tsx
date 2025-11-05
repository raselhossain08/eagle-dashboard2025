'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenUtils } from '@/lib/utils/token.utils';
import { TokenSetter } from '@/lib/utils/token-setter';
import { Copy, Key, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TokenManager() {
  const [token, setToken] = useState('');
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Refresh token status
  const refreshTokenStatus = () => {
    const storedToken = TokenUtils.getToken();
    const userInfo = TokenUtils.getUserInfo();
    const authenticated = TokenUtils.isAuthenticated();
    
    setCurrentToken(storedToken);
    setTokenInfo(userInfo);
    setIsAuthenticated(authenticated);
  };

  // Initialize on mount
  useEffect(() => {
    refreshTokenStatus();
  }, []);

  // Set custom token
  const handleSetToken = () => {
    if (!token.trim()) {
      toast.error('Please enter a token');
      return;
    }

    try {
      TokenUtils.setToken(token.trim());
      toast.success('Token set successfully');
      setToken('');
      refreshTokenStatus();
    } catch (error) {
      toast.error('Failed to set token');
      console.error('Token setting error:', error);
    }
  };

  // Generate and set test token
  const handleGenerateTestToken = () => {
    try {
      const newToken = TokenSetter.setGeneratedTestToken();
      toast.success('Test token generated and set');
      refreshTokenStatus();
    } catch (error) {
      toast.error('Failed to generate test token');
      console.error('Token generation error:', error);
    }
  };

  // Clear token
  const handleClearToken = () => {
    try {
      TokenUtils.clearAllTokens();
      toast.success('Token cleared');
      refreshTokenStatus();
    } catch (error) {
      toast.error('Failed to clear token');
      console.error('Token clearing error:', error);
    }
  };

  // Copy token to clipboard
  const handleCopyToken = async () => {
    if (!currentToken) return;
    
    try {
      await navigator.clipboard.writeText(currentToken);
      toast.success('Token copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy token');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Token Manager</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage authentication tokens for development and testing
        </p>
      </div>

      {/* Current Token Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Current Token Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Authentication Status:</span>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Authenticated
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Not Authenticated
                </>
              )}
            </Badge>
          </div>

          {currentToken && (
            <>
              <div className="space-y-2">
                <Label>Current Token:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${currentToken.substring(0, 30)}...`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopyToken} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {tokenInfo && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label className="text-xs">User ID:</Label>
                    <p className="font-mono text-sm">{tokenInfo.userId}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Email:</Label>
                    <p className="font-mono text-sm">{tokenInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Role:</Label>
                    <Badge variant="outline">{tokenInfo.role}</Badge>
                  </div>
                  <div>
                    <Label className="text-xs">Expires:</Label>
                    <p className="text-sm">{TokenUtils.formatTokenExpiry()}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Permissions:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tokenInfo.permissions?.slice(0, 5).map((perm: string) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {tokenInfo.permissions?.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tokenInfo.permissions.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={refreshTokenStatus} variant="outline">
              Refresh Status
            </Button>
            {currentToken && (
              <Button onClick={handleClearToken} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Token
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Set Custom Token */}
      <Card>
        <CardHeader>
          <CardTitle>Set Custom Token</CardTitle>
          <CardDescription>
            Enter a JWT token manually (useful for testing with real backend tokens)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-token">JWT Token:</Label>
            <Input
              id="custom-token"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono"
            />
          </div>
          <Button onClick={handleSetToken} disabled={!token.trim()}>
            Set Token
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Fast setup for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleGenerateTestToken} className="w-full">
              Generate Test Token
            </Button>
            <Button 
              onClick={() => {
                TokenSetter.quickDevSetup();
                refreshTokenStatus();
                toast.success('Development setup complete');
              }} 
              variant="outline"
              className="w-full"
            >
              Quick Dev Setup
            </Button>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Development Console Commands:
            </h4>
            <div className="space-y-1 text-sm font-mono text-blue-700 dark:text-blue-300">
              <p>TokenSetter.quickDevSetup()</p>
              <p>AuthDebugger.checkAuthStatus()</p>
              <p>AuthDebugger.testApiConnection()</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cookie Storage Information</CardTitle>
          <CardDescription>
            How tokens are stored in browser cookies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Cookie Name:</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">token</code>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Max Age:</span>
              <span>7 days (default)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Secure:</span>
              <span>{process.env.NODE_ENV === 'production' ? 'Yes' : 'No (Dev)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">SameSite:</span>
              <span>Strict</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">HttpOnly:</span>
              <span>No (Client Accessible)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}