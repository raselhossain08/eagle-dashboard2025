"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  UserCog, 
  Mail, 
  MessageSquare, 
  BookOpen,
  Shield,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Send,
  FileText,
  Eye,
  Settings,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { SupportToolsService } from "@/lib/services/admin";

interface SupportStats {
  impersonation: {
    activeSessions: number;
    totalSessions: number;
    avgSessionDuration: number;
  };
  emailResends: {
    todayCount: number;
    weekCount: number;
    monthCount: number;
  };
  notes: {
    totalNotes: number;
    pinnedNotes: number;
    recentNotes: number;
  };
  savedReplies: {
    totalReplies: number;
    popularReplies: number;
    recentUsage: number;
  };
}

export default function SupportToolsPage() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<{ status: string; features: string[] } | null>(null);

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      setLoading(true);
      
      // Load health status
      const healthResponse = await SupportToolsService.healthCheck();
      if (healthResponse.success && healthResponse.data) {
        setHealthStatus(healthResponse.data);
      }

      // Load statistics  
      const statsResponse = await SupportToolsService.getSupportStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load support data:', error);
      toast.error('Failed to load support dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Support Tools
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Comprehensive support tools for user assistance and account management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={healthStatus?.status === 'healthy' ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            <Activity className="w-3 h-3" />
            {healthStatus?.status || 'Unknown'}
          </Badge>
          <Button variant="outline" onClick={loadSupportData}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      {healthStatus && (
        <Alert className={healthStatus.status === 'healthy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {healthStatus.status === 'healthy' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Support tools status: <strong>{healthStatus.status}</strong>
              </span>
              <span className="text-sm text-gray-500">
                Features: {healthStatus.features?.join(', ') || 'None'}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.impersonation.activeSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {stats?.impersonation.totalSessions || 0} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Resends Today</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.emailResends.todayCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This week: {stats?.emailResends.weekCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Notes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.notes.totalNotes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pinned: {stats?.notes.pinnedNotes || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Replies</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.savedReplies.totalReplies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent usage: {stats?.savedReplies.recentUsage || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Support Tools Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="impersonation">Impersonation</TabsTrigger>
          <TabsTrigger value="email-resends">Email Resends</TabsTrigger>
          <TabsTrigger value="user-notes">User Notes</TabsTrigger>
          <TabsTrigger value="saved-replies">Saved Replies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/support/impersonate">
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <UserCog className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">User Impersonation</CardTitle>
                    <CardDescription>View accounts as users</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {stats?.impersonation.activeSessions || 0} active
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/support/resend">
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Email Resend</CardTitle>
                    <CardDescription>Resend user emails</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      {stats?.emailResends.todayCount || 0} today
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Send className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/support/notes">
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">User Notes & Flags</CardTitle>
                    <CardDescription>Manage user notes</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {stats?.notes.totalNotes || 0} notes
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/support/replies">
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Saved Replies</CardTitle>
                    <CardDescription>Template library</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {stats?.savedReplies.totalReplies || 0} templates
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Support Activity
              </CardTitle>
              <CardDescription>
                Latest support tool usage and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Impersonation session started</p>
                    <p className="text-xs text-gray-500">Admin viewed user john@example.com • 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Verification email resent</p>
                    <p className="text-xs text-gray-500">Sent to jane@example.com • 5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User note created</p>
                    <p className="text-xs text-gray-500">Added billing note for user account • 12 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Saved reply used</p>
                    <p className="text-xs text-gray-500">Payment receipt template used • 18 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impersonation">
          <Card>
            <CardHeader>
              <CardTitle>User Impersonation Sessions</CardTitle>
              <CardDescription>
                Manage active impersonation sessions and view session history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Use the dedicated impersonation page for full functionality
                </p>
                <Link href="/admin/support/impersonate">
                  <Button>
                    <UserCog className="w-4 h-4 mr-2" />
                    Open Impersonation Tool
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-resends">
          <Card>
            <CardHeader>
              <CardTitle>Email Resend Services</CardTitle>
              <CardDescription>
                Resend various types of emails to users with rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Use the dedicated email resend page for full functionality
                </p>
                <Link href="/admin/support/resend">
                  <Button>
                    <Mail className="w-4 h-4 mr-2" />
                    Open Email Resend Tool
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-notes">
          <Card>
            <CardHeader>
              <CardTitle>User Notes & Flags System</CardTitle>
              <CardDescription>
                Manage user notes, flags, and account annotations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Use the dedicated notes page for full functionality
                </p>
                <Link href="/admin/support/notes">
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Notes & Flags Tool
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved-replies">
          <Card>
            <CardHeader>
              <CardTitle>Saved Replies Library</CardTitle>
              <CardDescription>
                Manage template responses for common support scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Use the dedicated saved replies page for full functionality
                </p>
                <Link href="/admin/support/replies">
                  <Button>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Open Saved Replies Tool
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Security Features</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Full audit logging of all actions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Session-based impersonation with expiry
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Rate limiting on email operations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Read-only mode by default
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Compliance Controls</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  PII minimization in notes system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Role-based visibility controls
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Data retention policies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Automatic session cleanup
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}