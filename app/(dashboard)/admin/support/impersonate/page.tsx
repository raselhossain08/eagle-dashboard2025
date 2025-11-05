"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  UserCog, 
  AlertTriangle,
  Search, 
  Eye, 
  LogOut,
  Shield,
  User,
  Mail,
  Phone,
  CreditCard,
  Activity,
  Ban,
  CheckCircle2,
  XCircle,
  Timer,
  Users,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportToolsService } from "@/lib/services/admin";
import type { ImpersonationSession, StartImpersonationRequest } from "@/lib/services/admin/support.service";

interface User {
  _id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  lastLogin: string;
  subscription: string;
  riskLevel: 'low' | 'medium' | 'high';
  phone?: string;
  joinDate: string;
  profilePicture?: string;
}

export default function UserImpersonationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeSessions, setActiveSessions] = useState<ImpersonationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ImpersonationSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sessionForm, setSessionForm] = useState({
    reason: '',
    sessionType: 'READ_ONLY' as 'READ_ONLY' | 'WRITE_ENABLED'
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    checkConnection();
    loadActiveSessions();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const response = await SupportToolsService.healthCheck();
      if (response.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-yellow-500" />;
      case 'banned':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'border-green-200 text-green-700 bg-green-50';
      case 'medium':
        return 'border-yellow-200 text-yellow-700 bg-yellow-50';
      case 'high':
        return 'border-red-200 text-red-700 bg-red-50';
      default:
        return 'border-gray-200 text-gray-700 bg-gray-50';
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const loadActiveSessions = async () => {
    try {
      setLoading(true);
      const response = await SupportToolsService.getActiveSessions();
      if (response.success && response.data) {
        setActiveSessions(response.data.sessions);
        const userSession = response.data.sessions.find((s: ImpersonationSession) => s.status === 'ACTIVE');
        if (userSession) {
          setCurrentSession(userSession);
        }
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await SupportToolsService.searchUsers(query);
      if (response.success && response.data) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users. Please check your connection.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleStartImpersonation = async () => {
    if (!selectedUser || !sessionForm.reason.trim()) {
      toast.error('Please select a user and provide a reason');
      return;
    }

    try {
      const request: StartImpersonationRequest = {
        targetUserId: selectedUser._id,
        reason: sessionForm.reason,
        sessionType: sessionForm.sessionType
      };

      const response = await SupportToolsService.startImpersonation(request);
      if (response.success && response.data) {
        setCurrentSession(response.data);
        setShowStartModal(false);
        setSessionForm({ reason: '', sessionType: 'READ_ONLY' });
        setSelectedUser(null);
        toast.success('Impersonation session started successfully');
        loadActiveSessions();
      }
    } catch (error) {
      console.error('Failed to start impersonation:', error);
      toast.error('Failed to start impersonation session');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      const response = await SupportToolsService.endImpersonationSession(sessionId);
      if (response.success) {
        setCurrentSession(null);
        toast.success('Impersonation session ended');
        loadActiveSessions();
      }
    } catch (error) {
      console.error('Failed to end session:', error);
      toast.error('Failed to end impersonation session');
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Alert */}
      {connectionStatus !== 'connected' && (
        <Alert className={connectionStatus === 'disconnected' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
          <AlertCircle className={`h-4 w-4 ${connectionStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'}`} />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {connectionStatus === 'checking' ? 'Checking connection...' : 'API connection failed. Some features may not work properly.'}
            </span>
            {connectionStatus === 'disconnected' && (
              <Button variant="outline" size="sm" onClick={checkConnection}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Active Impersonation Banner */}
      {currentSession && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>IMPERSONATION ACTIVE:</strong> You are viewing as {currentSession.targetUser.name} ({currentSession.targetUser.email})
              {currentSession.sessionType === 'READ_ONLY' && " - READ-ONLY MODE"}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="w-4 h-4" />
                <span>Expires: {formatTimeRemaining(currentSession.expiresAt)}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEndSession(currentSession.sessionId)}
              >
                <LogOut className="w-3 h-3 mr-1" />
                End Session
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Impersonation</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Safely view user accounts for support purposes with full audit logging
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadActiveSessions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {currentSession && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Session Active
            </Badge>
          )}
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList>
          <TabsTrigger value="search">Find User</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions ({activeSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find User to Impersonate
              </CardTitle>
              <CardDescription>
                Search by email address or name to find a user account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email or name..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    disabled={!!currentSession || connectionStatus !== 'connected'}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => searchUsers(searchQuery)}
                  disabled={searching || !!currentSession || connectionStatus !== 'connected'}
                >
                  {searching ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {(currentSession || connectionStatus !== 'connected') && (
                <Alert className="mt-4">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    {currentSession 
                      ? 'You must end your current impersonation session before starting a new one.'
                      : 'API connection required for user search functionality.'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Search Results */}
          {(searchResults.length > 0 || searchQuery) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {searchQuery ? `Search Results (${searchResults.length})` : 'Recent Users'}
                </h3>
              </div>
              
              <div className="grid gap-4">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <Card key={user._id} className="transition-all hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {user.name}
                                {getStatusIcon(user.status)}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={user.status === 'active' ? 'default' : 'destructive'}
                              className={user.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                            >
                              {user.status}
                            </Badge>
                            {user.riskLevel && (
                              <Badge 
                                variant="outline" 
                                className={getRiskLevelColor(user.riskLevel)}
                              >
                                {user.riskLevel} risk
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3 h-3 text-gray-400" />
                            <span>{user.subscription}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Last login: {new Date(user.lastLogin).toLocaleString()}
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setSessionForm({ ...sessionForm, sessionType: 'READ_ONLY' });
                              setShowStartModal(true);
                            }}
                            disabled={!!currentSession}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View as User
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setSessionForm({ ...sessionForm, sessionType: 'WRITE_ENABLED' });
                              setShowStartModal(true);
                            }}
                            disabled={!!currentSession}
                          >
                            <UserCog className="w-3 h-3 mr-1" />
                            Impersonate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : searchQuery && !searching ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No users found matching "{searchQuery}"
                      </p>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Active Impersonation Sessions
              </CardTitle>
              <CardDescription>
                Monitor and manage all active impersonation sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Loading active sessions...</p>
                </div>
              ) : activeSessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Support Agent</TableHead>
                      <TableHead>Target User</TableHead>
                      <TableHead>Session Type</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.supportAgent.name}</p>
                            <p className="text-sm text-gray-500">{session.supportAgent.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.targetUser.name}</p>
                            <p className="text-sm text-gray-500">{session.targetUser.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={session.sessionType === 'READ_ONLY' ? 'default' : 'destructive'}
                          >
                            {session.sessionType === 'READ_ONLY' ? 'Read Only' : 'Write Enabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(session.startTime).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatTimeRemaining(session.expiresAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEndSession(session.sessionId)}
                          >
                            <LogOut className="w-3 h-3 mr-1" />
                            End
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active impersonation sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Start Impersonation Modal */}
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start User Impersonation</DialogTitle>
            <DialogDescription>
              Please provide a reason and select session type for impersonating this user account.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Impersonation *</Label>
                <Textarea
                  id="reason"
                  value={sessionForm.reason}
                  onChange={(e) => setSessionForm({ ...sessionForm, reason: e.target.value })}
                  placeholder="Describe why you need to impersonate this user..."
                  rows={3}
                  required
                />
              </div>

              {/* Session Type */}
              <div className="space-y-2">
                <Label htmlFor="session-type">Session Type</Label>
                <Select
                  value={sessionForm.sessionType}
                  onValueChange={(value: 'READ_ONLY' | 'WRITE_ENABLED') => 
                    setSessionForm({ ...sessionForm, sessionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READ_ONLY">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Read Only</p>
                          <p className="text-sm text-gray-500">View user's account without making changes</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="WRITE_ENABLED">
                      <div className="flex items-center gap-2">
                        <UserCog className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Write Enabled</p>
                          <p className="text-sm text-gray-500">Full access to modify user's account</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {sessionForm.sessionType === 'WRITE_ENABLED' && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong>Warning:</strong> Write mode allows you to make changes to the user's account. 
                    All actions will be logged and audited.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowStartModal(false);
                    setSelectedUser(null);
                    setSessionForm({ reason: '', sessionType: 'READ_ONLY' });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartImpersonation}
                  disabled={!sessionForm.reason.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Start Impersonation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Security Controls</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Sessions automatically expire after 2 hours
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Read-only mode by default for safety
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Write actions require explicit reason
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Only one active session per admin
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Audit & Logging</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  All impersonation actions are logged
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  IP address and user agent tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Reason and duration documented
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Compliance with data protection laws
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
