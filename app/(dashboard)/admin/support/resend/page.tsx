"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  RefreshCw, 
  Search, 
  Send, 
  Mail,
  FileText,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CommunicationType = 'receipt' | 'verification' | 'contract';

type Communication = {
  id: string;
  type: CommunicationType;
  recipient: string;
  subject: string;
  sentDate: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  userId: string;
  userName: string;
  details?: string;
};

export default function ResendCommunicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<CommunicationType | 'all'>('all');
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);

  const mockCommunications: Communication[] = [
    {
      id: "comm_1",
      type: "receipt",
      recipient: "john.doe@example.com",
      subject: "Payment Receipt #INV-2024-001",
      sentDate: "2024-01-15T10:30:00Z",
      status: "delivered",
      userId: "user_1",
      userName: "John Doe",
      details: "Payment of $99.99 for Pro Plan subscription"
    },
    {
      id: "comm_2",
      type: "verification",
      recipient: "jane.smith@example.com", 
      subject: "Verify Your Email Address",
      sentDate: "2024-01-14T14:22:00Z",
      status: "failed",
      userId: "user_2",
      userName: "Jane Smith",
      details: "Account verification required to complete registration"
    },
    {
      id: "comm_3",
      type: "contract",
      recipient: "bob.wilson@company.com",
      subject: "Contract Ready for Signature - Service Agreement",
      sentDate: "2024-01-13T09:15:00Z",
      status: "pending",
      userId: "user_3",
      userName: "Bob Wilson",
      details: "Annual service contract requiring digital signature"
    },
    {
      id: "comm_4",
      type: "receipt",
      recipient: "alice.brown@startup.io",
      subject: "Payment Receipt #INV-2024-002", 
      sentDate: "2024-01-12T16:45:00Z",
      status: "sent",
      userId: "user_4",
      userName: "Alice Brown",
      details: "Payment of $299.99 for Enterprise Plan subscription"
    }
  ];

  const filteredCommunications = mockCommunications.filter(comm => {
    const matchesSearch = comm.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comm.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || comm.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case 'receipt': return <Receipt className="w-4 h-4" />;
      case 'verification': return <Mail className="w-4 h-4" />;
      case 'contract': return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Communication['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const resendCommunication = (communication: Communication) => {
    console.log(`Resending ${communication.type} to ${communication.recipient}`);
    // API call would go here
  };

  const CommunicationCard = ({ comm }: { comm: Communication }) => (
    <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => setSelectedCommunication(comm)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              {getTypeIcon(comm.type)}
            </div>
            <div>
              <CardTitle className="text-lg capitalize">{comm.type}</CardTitle>
              <CardDescription>{comm.subject}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={getStatusColor(comm.status)}>
            {comm.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-3 h-3 text-gray-400" />
          <span>{comm.userName}</span>
          <span className="text-gray-400">•</span>
          <Mail className="w-3 h-3 text-gray-400" />
          <span>{comm.recipient}</span>
        </div>
        
        <div className="text-sm text-gray-500">
          Sent: {new Date(comm.sentDate).toLocaleString()}
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-2 rounded">
          {comm.details}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              resendCommunication(comm);
            }}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Resend
          </Button>
          {comm.status === 'failed' && (
            <Button size="sm" variant="outline">
              <AlertCircle className="w-3 h-3 mr-1" />
              View Error
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resend Communications</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and resend email communications to users
          </p>
        </div>
        <Button>
          <Send className="w-4 h-4 mr-2" />
          Send Custom Email
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Communications List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Email, subject, or user name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Communication Type</Label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as CommunicationType | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="receipt">Payment Receipts</SelectItem>
                      <SelectItem value="verification">Email Verification</SelectItem>
                      <SelectItem value="contract">Contract Links</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communications Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Communications ({filteredCommunications.length})
              </h3>
              <div className="flex gap-2">
                {['sent', 'delivered', 'failed', 'pending'].map(status => {
                  const count = filteredCommunications.filter(c => c.status === status).length;
                  return (
                    <Badge key={status} variant="outline" className={getStatusColor(status as Communication['status'])}>
                      {status}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <div className="grid gap-4">
              {filteredCommunications.map((comm) => (
                <CommunicationCard key={comm.id} comm={comm} />
              ))}
            </div>
          </div>
        </div>

        {/* Communication Details */}
        <div className="space-y-4">
          {selectedCommunication ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedCommunication.type)}
                  Communication Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="capitalize">{selectedCommunication.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Recipient</Label>
                    <p>{selectedCommunication.recipient}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">User</Label>
                    <p>{selectedCommunication.userName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subject</Label>
                    <p>{selectedCommunication.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedCommunication.status)}>
                      {selectedCommunication.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Sent Date</Label>
                    <p>{new Date(selectedCommunication.sentDate).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Message (Optional)</Label>
                  <Textarea
                    placeholder="Add a personal message to include with the resent communication..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => resendCommunication(selectedCommunication)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Now
                  </Button>
                </div>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Resending will create a new delivery attempt. The original communication status will remain unchanged.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center space-y-2">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-500">Select a Communication</h3>
                  <p className="text-sm text-gray-400">
                    Choose a communication from the list to view details and resend options
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common communication tasks and bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Receipt className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Payment Receipt</div>
                    <div className="text-xs text-gray-500">Send payment confirmation</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Mail className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Email Verification</div>
                    <div className="text-xs text-gray-500">Resend verification link</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Contract Link</div>
                    <div className="text-xs text-gray-500">Send signing link</div>
                  </div>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry All Failed Communications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Pending as Delivered
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Export Communication Log
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-retry Failed Emails</Label>
                    <p className="text-sm text-gray-500">Automatically retry failed communications after 1 hour</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Delivery Notifications</Label>
                    <p className="text-sm text-gray-500">Notify admins of delivery failures</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}