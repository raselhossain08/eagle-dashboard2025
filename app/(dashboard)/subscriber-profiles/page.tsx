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
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Users, 
  UserCheck, 
  Shield, 
  FileText,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Download,
  Search,
  Filter,
  BarChart3,
  Clock,
  AlertTriangle,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  DollarSign,
  Settings,
  Globe,
  Lock,
  ZoomIn,
  ExternalLink,
  ImageIcon
} from 'lucide-react';
import {
  subscriberProfileService,
  SubscriberProfile,
  ProfileAnalytics,
  UpdateKycStatusData,
  CreateIdentityDocumentData
} from '@/lib/services/subscriptions/subscriber-profile.service';
import { TokenUtils } from '@/lib/utils/token.utils';

export default function SubscriberProfileManagement() {
  const [profiles, setProfiles] = useState<any>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [kycQueue, setKycQueue] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<SubscriberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check user role permissions
  const userRole = TokenUtils.getUserRole();
  const hasAdminAccess = TokenUtils.hasAdminRole();
  const userInfo = TokenUtils.getUserInfo();
  
  // Check admin access on component mount
  useEffect(() => {
    const accessCheck = TokenUtils.checkAdminAccess();
    console.log('🔐 Admin Access Check:', accessCheck);
    
    if (!accessCheck.hasAccess) {
      console.log('❌ Access denied for subscriber profiles');
      if (accessCheck.userRole) {
        console.log(`💡 Current role: ${accessCheck.userRole} (need: admin/superadmin)`);
      }
    }
  }, []);

  // Show access denied if user doesn't have admin role
  if (!loading && !hasAdminAccess) {
    const accessCheck = TokenUtils.checkAdminAccess();
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-red-500 text-6xl mb-4">�</div>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Admin permissions required for subscriber profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm">
                <strong>Current Role:</strong> 
                <span className="ml-2 font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                  {userRole || 'unknown'}
                </span>
              </div>
              <div className="text-sm mt-2">
                <strong>Required:</strong> 
                <span className="ml-2 font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  admin, superadmin, or support_admin
                </span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🔧 Solution:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Logout from current account</li>
                <li>2. Login with admin credentials:</li>
                <li className="ml-4 font-mono text-xs bg-blue-100 p-1 rounded">
                  raselhossain86666@gmail.com
                </li>
              </ol>
            </div>

            <Button 
              onClick={() => {
                console.log('🔍 Debugging current session...');
                TokenUtils.debugTokenInfo();
              }}
              variant="outline" 
              className="w-full"
            >
              🔍 Debug Session Info
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dialog states
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showFilePreviewDialog, setShowFilePreviewDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('all');
  const [kycLevelFilter, setKycLevelFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  // Form states
  const [kycUpdateForm, setKycUpdateForm] = useState<UpdateKycStatusData>({
    status: 'not_started',
    rejectionReason: ''
  });

  const [documentForm, setDocumentForm] = useState<CreateIdentityDocumentData>({
    type: 'passport',
    number: '',
    issueDate: '',
    expiryDate: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (!loading) {
      loadProfiles();
    }
  }, [searchQuery, kycStatusFilter, kycLevelFilter, completionFilter, currentPage, pageLimit]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProfiles(),
        loadAnalytics(),
        loadKycQueue()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load subscriber profiles data');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: pageLimit,
        ...(searchQuery && { search: searchQuery }),
        ...(kycStatusFilter && kycStatusFilter !== 'all' && { kycStatus: kycStatusFilter }),
        ...(kycLevelFilter && kycLevelFilter !== 'all' && { kycLevel: kycLevelFilter }),
        ...(completionFilter && completionFilter !== 'all' && { completionRange: completionFilter }),
        sortBy: 'updatedAt',
        sortOrder: 'desc' as const
      };

      const response = await subscriberProfileService.getAllProfiles(filters);
      
      if (response.success) {
        setProfiles(response.data);
      } else {
        throw new Error(response.data?.message || 'Failed to load profiles');
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      throw error;
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await subscriberProfileService.getProfileAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Don't throw here as analytics is not critical
    }
  };

  const loadKycQueue = async () => {
    try {
      const response = await subscriberProfileService.getKycQueue();
      if (response.success) {
        setKycQueue(response.data);
      }
    } catch (error) {
      console.error('Error loading KYC queue:', error);
      // Don't throw here as queue is not critical
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleViewProfile = async (profileId: string) => {
    try {
      const response = await subscriberProfileService.getProfileById(profileId);
      setSelectedProfile(response.data);
      setShowProfileDialog(true);
    } catch (error) {
      console.error('Error fetching profile details:', error);
      toast.error('Failed to load profile details');
    }
  };

  const handleUpdateKyc = async () => {
    if (!selectedProfile?._id) return;

    // Validate rejection reason if status is rejected
    if (kycUpdateForm.status === 'rejected' && !kycUpdateForm.rejectionReason?.trim()) {
      toast.error('Rejection reason is required when rejecting KYC');
      return;
    }

    try {
      // Prepare update data - only include rejectionReason if status is rejected
      const updateData: any = {
        status: kycUpdateForm.status,
        level: kycUpdateForm.level,
        riskScore: kycUpdateForm.riskScore
      };
      
      // Only add rejectionReason if status is rejected and reason is provided
      if (kycUpdateForm.status === 'rejected' && kycUpdateForm.rejectionReason?.trim()) {
        updateData.rejectionReason = kycUpdateForm.rejectionReason.trim();
      }

      await subscriberProfileService.updateKycStatus(selectedProfile._id, updateData);
      
      toast.success('KYC status updated successfully');
      setShowKycDialog(false);
      resetKycForm();
      setSelectedProfile(null);
      loadData();
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast.error('Failed to update KYC status');
    }
  };

  const handleVerifyDocument = async (profileId: string, documentId: string, verified: boolean) => {
    try {
      await subscriberProfileService.verifyIdentityDocument(profileId, documentId, verified);
      toast.success(`Document ${verified ? 'verified' : 'rejected'} successfully`);
      
      // Refresh profile details
      if (selectedProfile?._id) {
        const response = await subscriberProfileService.getProfileById(selectedProfile._id);
        setSelectedProfile(response.data);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to deactivate this profile?')) return;
    
    // TODO: Implement delete functionality when service method is available
    toast.error('Delete functionality not yet implemented');
  };

  const handleAddDocument = async () => {
    try {
      if (!documentForm.number || !documentForm.type) {
        toast.error('Please fill in required fields');
        return;
      }

      await subscriberProfileService.addIdentityDocument(documentForm);
      toast.success('Document added successfully');
      
      // Reset form
      setDocumentForm({
        type: 'passport',
        number: '',
        issueDate: '',
        expiryDate: ''
      });
      
      // Refresh profile details
      if (selectedProfile?._id) {
        const response = await subscriberProfileService.getProfileById(selectedProfile._id);
        if (response.success) {
          setSelectedProfile(response.data);
        }
      }
      
      setShowDocumentDialog(false);
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
    }
  };

  const resetKycForm = () => {
    setKycUpdateForm({
      status: 'not_started',
      rejectionReason: ''
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setKycStatusFilter('all');
    setKycLevelFilter('all');
    setCompletionFilter('all');
    setCurrentPage(1);
  };

  const handleFilePreview = (document: any) => {
    if (!document.fileUrl) {
      toast.error('No file available for preview');
      return;
    }
    setPreviewFile(document);
    setShowFilePreviewDialog(true);
  };

  const getFileIcon = (type: string) => {
    const fileType = type?.toLowerCase();
    if (fileType?.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType?.includes('image') || fileType?.includes('jpg') || fileType?.includes('png') || fileType?.includes('jpeg')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const isImageFile = (type: string) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    return imageTypes.includes(type?.toLowerCase());
  };

  const isPdfFile = (type: string) => {
    return type?.toLowerCase().includes('pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading subscriber profiles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriber Profiles</h1>
          <p className="text-muted-foreground">
            Manage subscriber profiles, KYC verification, and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProfiles}</div>
              <p className="text-xs text-muted-foreground">
                {(analytics.profileCompletionRate ?? 0).toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KYC Verified</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.kycStatusDistribution?.approved ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {(analytics.kycAdoptionRate ?? 0).toFixed(1)}% adoption rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics.avgCompletionRate ?? 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average age: {(analytics.avgAge ?? 0).toFixed(1)} years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.kycStatusDistribution?.pending_review ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profiles">All Profiles</TabsTrigger>
          <TabsTrigger value="kyc-queue">KYC Queue ({kycQueue?.totalDocs || 0})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Profiles Tab */}
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscriber Profiles</CardTitle>
                  <CardDescription>
                    Manage all subscriber profiles and their verification status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={kycStatusFilter} onValueChange={setKycStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="KYC Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={kycLevelFilter} onValueChange={setKycLevelFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="KYC Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={completionFilter} onValueChange={setCompletionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Completion %" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="0-25">0-25%</SelectItem>
                    <SelectItem value="26-50">26-50%</SelectItem>
                    <SelectItem value="51-75">51-75%</SelectItem>
                    <SelectItem value="76-100">76-100%</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={resetFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>

              {/* Profiles Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>KYC Level</TableHead>
                      <TableHead>Risk Rating</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles?.docs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No profiles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles?.docs?.map((profile: SubscriberProfile) => (
                        <TableRow key={profile._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{profile.fullName || profile.user?.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{profile.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={profile.profileCompletion?.percentage || 0} 
                                className="w-16 h-2"
                              />
                              <span className="text-sm">{profile.profileCompletion?.percentage || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(profile.identityDocuments?.length || 0) > 0 ? (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">
                                    {profile.identityDocuments?.length || 0}
                                  </span>
                                  <div className="flex gap-1">
                                    {profile.identityDocuments?.slice(0, 3).map((doc, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full ${
                                          doc.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                                        }`}
                                        title={`${doc.type} - ${doc.isVerified ? 'Verified' : 'Pending'}`}
                                      />
                                    ))}
                                    {(profile.identityDocuments?.length || 0) > 3 && (
                                      <span className="text-xs text-gray-500">
                                        +{(profile.identityDocuments?.length || 0) - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">No docs</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={subscriberProfileService.getKycStatusColor(profile.kycStatus?.status || 'not_started')}>
                              {subscriberProfileService.formatKycStatus(profile.kycStatus?.status || 'not_started')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={subscriberProfileService.getKycLevelColor(profile.kycStatus?.level || 'none')}>
                              {subscriberProfileService.formatKycLevel(profile.kycStatus?.level || 'none')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={subscriberProfileService.getAmlRiskColor(profile.compliance?.amlRiskRating || 'medium')}>
                              {(profile.compliance?.amlRiskRating || 'medium').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => profile._id && handleViewProfile(profile._id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setKycUpdateForm({
                                    status: profile.kycStatus?.status || 'not_started',
                                    level: profile.kycStatus?.level || 'none',
                                    rejectionReason: profile.kycStatus?.rejectionReason || '',
                                    riskScore: profile.kycStatus?.riskScore || 0
                                  });
                                  setShowKycDialog(true);
                                }}
                              >
                                <Shield className="h-3 w-3" />
                              </Button>
                              {/* Documents Check Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setShowDocumentDialog(true);
                                }}
                                title={`Check Documents (${profile.identityDocuments?.length || 0} files)`}
                                className={`relative ${
                                  (profile.identityDocuments?.length || 0) > 0 
                                    ? 'bg-green-50 hover:bg-green-100 border-green-200' 
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <FileText className="h-3 w-3" />
                                {(profile.identityDocuments?.length || 0) > 0 && (
                                  <span className="ml-1 text-xs font-semibold text-green-700">
                                    {profile.identityDocuments?.length || 0}
                                  </span>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => profile._id && handleDeleteProfile(profile._id)}
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

              {/* Pagination */}
              {profiles && profiles.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageLimit) + 1} to {Math.min(currentPage * pageLimit, profiles.totalDocs)} of {profiles.totalDocs} profiles
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, profiles.totalPages))}
                      disabled={currentPage === profiles.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Queue Tab */}
        <TabsContent value="kyc-queue">
          <Card>
            <CardHeader>
              <CardTitle>KYC Review Queue</CardTitle>
              <CardDescription>
                Profiles pending KYC review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycQueue?.docs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No profiles in KYC queue
                        </TableCell>
                      </TableRow>
                    ) : (
                      kycQueue?.docs?.map((profile: SubscriberProfile) => (
                        <TableRow key={profile._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{profile.fullName || profile.user?.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{profile.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {profile.kycStatus?.submittedAt ? new Date(profile.kycStatus.submittedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {profile.identityDocuments?.map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <Badge 
                                    variant={doc.isVerified ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => (doc as any).fileUrl && handleFilePreview(doc)}
                                    title={(doc as any).fileUrl ? "Click to preview" : "No file available"}
                                  >
                                    {getFileIcon((doc as any).mimeType || (doc as any).fileType)}
                                    <span className="ml-1">{doc.type}</span>
                                  </Badge>
                                  {(doc as any).fileUrl && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleFilePreview(doc)}
                                      title="Preview Document"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              {(!profile.identityDocuments || profile.identityDocuments.length === 0) && (
                                <span className="text-muted-foreground text-sm">No documents</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{profile.kycStatus?.riskScore || 0}</span>
                              {(profile.kycStatus?.riskScore || 0) > 70 && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => profile._id && handleViewProfile(profile._id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setKycUpdateForm({
                                    status: 'approved',
                                    level: 'basic',
                                    rejectionReason: '',
                                    riskScore: profile.kycStatus?.riskScore || 0
                                  });
                                  setShowKycDialog(true);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setKycUpdateForm({
                                    status: 'rejected',
                                    level: profile.kycStatus?.level || 'none',
                                    rejectionReason: '',
                                    riskScore: profile.kycStatus?.riskScore || 0
                                  });
                                  setShowKycDialog(true);
                                }}
                              >
                                <X className="h-3 w-3" />
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

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.kycLevelDistribution || {}).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="capitalize">{level}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={analytics.totalProfiles > 0 ? ((count as number) / analytics.totalProfiles) * 100 : 0}
                            className="w-20 h-2"
                          />
                          <span className="text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>KYC Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.kycStatusDistribution || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={analytics.totalProfiles > 0 ? ((count as number) / analytics.totalProfiles) * 100 : 0}
                            className="w-20 h-2"
                          />
                          <span className="text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Profile Details Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
            <DialogDescription>
              Complete profile information and verification status
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="grid grid-cols-2 gap-6 max-h-96 overflow-y-auto">
              {/* Personal Info */}
              <div>
                <h4 className="font-medium mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Full Name:</strong> {selectedProfile.fullName || 'N/A'}</div>
                  <div><strong>Date of Birth:</strong> {selectedProfile.personalInfo?.dateOfBirth ? new Date(selectedProfile.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Age:</strong> {selectedProfile.age || 'N/A'}</div>
                  <div><strong>Gender:</strong> {selectedProfile.personalInfo?.gender || 'N/A'}</div>
                  <div><strong>Nationality:</strong> {selectedProfile.personalInfo?.nationality || 'N/A'}</div>
                  <div><strong>Marital Status:</strong> {selectedProfile.personalInfo?.maritalStatus || 'N/A'}</div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {selectedProfile.user?.email || 'N/A'}</div>
                  <div><strong>Primary Phone:</strong> {selectedProfile.contactInfo?.primaryPhone || 'N/A'}</div>
                  <div><strong>Alternate Phone:</strong> {selectedProfile.contactInfo?.alternatePhone || 'N/A'}</div>
                  <div><strong>Address:</strong> {selectedProfile.primaryAddress ? subscriberProfileService.formatAddress(selectedProfile.primaryAddress) : 'N/A'}</div>
                </div>
              </div>

              {/* Employment */}
              <div>
                <h4 className="font-medium mb-3">Employment</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Status:</strong> {selectedProfile.employment?.employmentStatus ? subscriberProfileService.formatEmploymentStatus(selectedProfile.employment.employmentStatus) : 'N/A'}</div>
                  <div><strong>Employer:</strong> {selectedProfile.employment?.employer || 'N/A'}</div>
                  <div><strong>Job Title:</strong> {selectedProfile.employment?.jobTitle || 'N/A'}</div>
                  <div><strong>Industry:</strong> {selectedProfile.employment?.industry || 'N/A'}</div>
                </div>
              </div>

              {/* KYC Status */}
              <div>
                <h4 className="font-medium mb-3">KYC Status</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Status:</strong> 
                    <Badge className={`ml-2 ${subscriberProfileService.getKycStatusColor(selectedProfile.kycStatus?.status || 'not_started')}`}>
                      {subscriberProfileService.formatKycStatus(selectedProfile.kycStatus?.status || 'not_started')}
                    </Badge>
                  </div>
                  <div>
                    <strong>Level:</strong> 
                    <Badge className={`ml-2 ${subscriberProfileService.getKycLevelColor(selectedProfile.kycStatus?.level || 'none')}`}>
                      {subscriberProfileService.formatKycLevel(selectedProfile.kycStatus?.level || 'none')}
                    </Badge>
                  </div>
                  <div><strong>Risk Score:</strong> {selectedProfile.kycStatus?.riskScore || 'N/A'}</div>
                  <div><strong>Completed Steps:</strong> {selectedProfile.kycStatus?.completedSteps?.length || 0}</div>
                </div>
              </div>

              {/* Identity Documents */}
              <div className="col-span-2">
                <h4 className="font-medium mb-3">Identity Documents</h4>
                <div className="space-y-2">
                  {selectedProfile.identityDocuments?.length ? (
                    selectedProfile.identityDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium capitalize">{doc.type.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {doc.issuingCountry && `• ${doc.issuingCountry}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={doc.isVerified ? "default" : "outline"}>
                            {doc.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                          
                          {/* File Preview Button */}
                          {(doc as any).fileUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFilePreview(doc)}
                              title="Preview Document"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {/* Download Button */}
                          {(doc as any).fileUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open((doc as any).fileUrl, '_blank')}
                              title="Download Document"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {selectedProfile._id && doc._id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyDocument(selectedProfile._id!, doc._id!, !doc.isVerified)}
                            >
                              {doc.isVerified ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KYC Update Dialog */}
      <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update KYC Status</DialogTitle>
            <DialogDescription>
              Update the KYC verification status and level for this profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="kycStatus">KYC Status</Label>
              <Select
                value={kycUpdateForm.status}
                onValueChange={(value) => setKycUpdateForm({...kycUpdateForm, status: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kycLevel">KYC Level</Label>
              <Select
                value={kycUpdateForm.level}
                onValueChange={(value) => setKycUpdateForm({...kycUpdateForm, level: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="riskScore">Risk Score (0-100)</Label>
              <Input
                id="riskScore"
                type="number"
                min="0"
                max="100"
                value={kycUpdateForm.riskScore}
                onChange={(e) => setKycUpdateForm({...kycUpdateForm, riskScore: parseInt(e.target.value) || 0})}
              />
            </div>
            {kycUpdateForm.status === 'rejected' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  value={kycUpdateForm.rejectionReason}
                  onChange={(e) => setKycUpdateForm({...kycUpdateForm, rejectionReason: e.target.value})}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowKycDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateKyc}
              disabled={kycUpdateForm.status === 'rejected' && !kycUpdateForm.rejectionReason?.trim()}
            >
              Update KYC Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Management Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Management</DialogTitle>
            <DialogDescription>
              View and manage identity documents for {selectedProfile?.user?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6">
              {/* Existing Documents */}
              <div>
                <h4 className="text-sm font-medium mb-3">Existing Documents</h4>
                {selectedProfile.identityDocuments?.length ? (
                  <div className="space-y-2">
                    {selectedProfile.identityDocuments.map((doc, index) => (
                      <div key={doc._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium capitalize">{doc.type?.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.number} • {doc.issuingCountry}
                          </div>
                          {doc.issueDate && (
                            <div className="text-xs text-muted-foreground">
                              Issued: {new Date(doc.issueDate).toLocaleDateString()}
                              {doc.expiryDate && ` • Expires: ${new Date(doc.expiryDate).toLocaleDateString()}`}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={doc.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {doc.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                          
                          {/* File Preview Button */}
                          {(doc as any).fileUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFilePreview(doc)}
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Download Button */}
                          {(doc as any).fileUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open((doc as any).fileUrl, '_blank')}
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {!doc.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyDocument(selectedProfile._id!, doc._id!, true)}
                              title="Verify Document"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyDocument(selectedProfile._id!, doc._id!, false)}
                            title="Reject Document"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    No documents uploaded yet
                  </div>
                )}
              </div>

              {/* Document Preview Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Document Preview & Actions</h4>
                
                {selectedProfile.identityDocuments && selectedProfile.identityDocuments.length > 0 ? (
                  <div className="grid gap-4">
                    {selectedProfile.identityDocuments.map((doc, index) => (
                      <div key={doc._id || index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getFileIcon((doc as any).mimeType || (doc as any).fileType)}
                              <span className="font-medium capitalize">{doc.type?.replace('_', ' ')}</span>
                              <Badge className={doc.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {doc.isVerified ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                              <div><strong>Number:</strong> {doc.number}</div>
                              <div><strong>Country:</strong> {doc.issuingCountry || 'N/A'}</div>
                              {doc.issueDate && (
                                <div><strong>Issued:</strong> {new Date(doc.issueDate).toLocaleDateString()}</div>
                              )}
                              {doc.expiryDate && (
                                <div><strong>Expires:</strong> {new Date(doc.expiryDate).toLocaleDateString()}</div>
                              )}
                            </div>

                            {/* File Preview Thumbnail */}
                            {(doc as any).fileUrl && (
                              <div className="mb-3">
                                {isImageFile((doc as any).mimeType || (doc as any).fileType) ? (
                                  <div 
                                    className="relative w-24 h-24 rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleFilePreview(doc)}
                                  >
                                    <img
                                      src={(doc as any).fileUrl}
                                      alt={`${doc.type} thumbnail`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        const parent = (e.target as HTMLElement).parentNode as HTMLElement;
                                        if (parent) {
                                          parent.innerHTML = `
                                            <div class="w-full h-full bg-red-100 flex items-center justify-center">
                                              <span class="text-red-500 text-xs">Failed to load</span>
                                            </div>
                                          `;
                                        }
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                                      <Eye className="text-white opacity-0 hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ) : isPdfFile((doc as any).mimeType || (doc as any).fileType) ? (
                                  <div 
                                    className="w-24 h-24 rounded-lg border bg-red-100 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors"
                                    onClick={() => handleFilePreview(doc)}
                                  >
                                    <FileText className="h-8 w-8 text-red-600" />
                                    <span className="text-xs text-red-600 ml-1">PDF</span>
                                  </div>
                                ) : (
                                  <div className="w-24 h-24 rounded-lg border bg-gray-100 flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-gray-600" />
                                    <span className="text-xs text-gray-600 ml-1">FILE</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {/* Preview Button */}
                            {(doc as any).fileUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFilePreview(doc)}
                                className="w-full"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            )}
                            
                            {/* Download Button */}
                            {(doc as any).fileUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open((doc as any).fileUrl, '_blank')}
                                className="w-full"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                            
                            {/* Verify/Reject Buttons */}
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={doc.isVerified ? "destructive" : "default"}
                                onClick={() => handleVerifyDocument(selectedProfile._id!, doc._id!, !doc.isVerified)}
                                className="flex-1"
                              >
                                {doc.isVerified ? (
                                  <>
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Verify
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">No documents found</p>
                    <p className="text-sm">This user hasn't uploaded any KYC documents yet</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedProfile(selectedProfile);
                      setShowKycDialog(true);
                      setShowDocumentDialog(false);
                    }}
                    disabled={!selectedProfile.identityDocuments || selectedProfile.identityDocuments.length === 0}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Update KYC Status
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={showFilePreviewDialog} onOpenChange={setShowFilePreviewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {previewFile && getFileIcon((previewFile as any).mimeType || (previewFile as any).fileType)}
                  Document Preview
                </DialogTitle>
                <DialogDescription>
                  {previewFile && (
                    <>
                      {previewFile.type?.replace('_', ' ').toUpperCase()} • 
                      {previewFile.number} • 
                      {previewFile.issuingCountry}
                      {previewFile.isVerified && (
                        <Badge className="ml-2 bg-green-100 text-green-800">Verified</Badge>
                      )}
                    </>
                  )}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                {previewFile && (previewFile as any).fileUrl && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open((previewFile as any).fileUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = (previewFile as any).fileUrl;
                        link.download = `${previewFile.type}_${previewFile.number}`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {previewFile && (previewFile as any).fileUrl && (
            <div className="flex-1 overflow-auto">
              {/* Preview Content Based on File Type */}
              {isImageFile((previewFile as any).mimeType || (previewFile as any).fileType) ? (
                // Image Preview
                <div className="flex justify-center items-center min-h-[500px] bg-gray-50 rounded-lg">
                  <div className="relative max-w-full max-h-full">
                    <img
                      src={(previewFile as any).fileUrl}
                      alt={`${previewFile.type} document`}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentNode as HTMLElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
                              <ImageIcon class="w-16 h-16 text-red-400 mb-4" />
                              <p class="text-red-600 font-medium">Failed to load image</p>
                              <p class="text-red-500 text-sm">The image file might be corrupted or unavailable</p>
                              <button onclick="window.open('${(previewFile as any).fileUrl}', '_blank')" 
                                      class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Try Opening in New Tab
                              </button>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                </div>
              ) : isPdfFile((previewFile as any).mimeType || (previewFile as any).fileType) ? (
                // PDF Preview
                <div className="w-full h-[70vh] bg-gray-50 rounded-lg overflow-hidden">
                  <iframe
                    src={`${(previewFile as any).fileUrl}#view=FitH`}
                    className="w-full h-full border-0"
                    title="PDF Document"
                    onError={() => {
                      // Fallback for PDF loading issues
                      console.error('Failed to load PDF in iframe');
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none"></div>
                </div>
              ) : (
                // Unsupported File Type
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Preview not available</p>
                  <p className="text-gray-500 text-sm mb-4">This file type cannot be previewed in browser</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open((previewFile as any).fileUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = (previewFile as any).fileUrl;
                        link.download = `${previewFile.type}_${previewFile.number}`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Document Information Panel */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Document Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Document Type:</strong> {previewFile.type?.replace('_', ' ').toUpperCase()}</div>
                  <div><strong>Document Number:</strong> {previewFile.number}</div>
                  <div><strong>Issuing Country:</strong> {previewFile.issuingCountry || 'N/A'}</div>
                  <div><strong>Issuing State:</strong> {previewFile.issuingState || 'N/A'}</div>
                  <div><strong>Issue Date:</strong> {previewFile.issueDate ? new Date(previewFile.issueDate).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Expiry Date:</strong> {previewFile.expiryDate ? new Date(previewFile.expiryDate).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Verification Status:</strong> 
                    <Badge className={`ml-2 ${previewFile.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {previewFile.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div><strong>Upload Date:</strong> {previewFile.createdAt ? new Date(previewFile.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    size="sm"
                    variant={previewFile.isVerified ? "default" : "outline"}
                    onClick={() => {
                      if (selectedProfile?._id && previewFile._id) {
                        handleVerifyDocument(selectedProfile._id, previewFile._id, !previewFile.isVerified);
                        setShowFilePreviewDialog(false);
                      }
                    }}
                    disabled={!selectedProfile?._id || !previewFile._id}
                  >
                    {previewFile.isVerified ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Mark as Unverified
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Verify Document
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowFilePreviewDialog(false);
                      setShowKycDialog(true);
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Update KYC Status
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {(!previewFile || !(previewFile as any).fileUrl) && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
              <FileText className="w-16 h-16 mb-4" />
              <p className="font-medium">No file available for preview</p>
              <p className="text-sm">This document doesn't have an associated file</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}