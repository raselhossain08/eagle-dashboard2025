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
  StickyNote, 
  Search, 
  Plus, 
  Flag,
  User,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FlagType = 'warning' | 'high-value' | 'vip' | 'support' | 'billing' | 'security';
type NotePriority = 'low' | 'medium' | 'high' | 'urgent';

type AccountFlag = {
  id: string;
  type: FlagType;
  label: string;
  description: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
};

type AccountNote = {
  id: string;
  title: string;
  content: string;
  priority: NotePriority;
  isVisible: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

type UserAccount = {
  id: string;
  name: string;
  email: string;
  status: string;
  flags: AccountFlag[];
  notes: AccountNote[];
};

export default function AccountNotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddFlag, setShowAddFlag] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    priority: "medium" as NotePriority,
    isVisible: true,
    tags: []
  });

  const mockUsers: UserAccount[] = [
    {
      id: "user_1",
      name: "John Doe",
      email: "john.doe@example.com",
      status: "active",
      flags: [
        {
          id: "flag_1",
          type: "high-value",
          label: "Enterprise Customer",
          description: "Annual contract worth $50K+",
          createdBy: "admin@company.com",
          createdAt: "2024-01-10T00:00:00Z"
        },
        {
          id: "flag_2",
          type: "support",
          label: "Premium Support",
          description: "Entitled to 24/7 priority support",
          createdBy: "admin@company.com",
          createdAt: "2024-01-05T00:00:00Z"
        }
      ],
      notes: [
        {
          id: "note_1",
          title: "Payment Method Update",
          content: "Customer requested to update payment method. New card ending in 4532 added on Jan 12, 2024.",
          priority: "medium",
          isVisible: true,
          createdBy: "support@company.com",
          createdAt: "2024-01-12T10:30:00Z",
          updatedAt: "2024-01-12T10:30:00Z",
          tags: ["billing", "payment"]
        },
        {
          id: "note_2",
          title: "Feature Request Discussion",
          content: "Customer interested in advanced analytics feature. Scheduled follow-up call for Q2 roadmap discussion.",
          priority: "high",
          isVisible: false,
          createdBy: "sales@company.com",
          createdAt: "2024-01-08T14:15:00Z",
          updatedAt: "2024-01-10T09:20:00Z",
          tags: ["sales", "feature-request"]
        }
      ]
    },
    {
      id: "user_2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "suspended",
      flags: [
        {
          id: "flag_3",
          type: "warning",
          label: "Payment Issues",
          description: "Multiple failed payment attempts",
          createdBy: "billing@company.com",
          createdAt: "2024-01-14T00:00:00Z",
          expiresAt: "2024-02-14T00:00:00Z"
        }
      ],
      notes: [
        {
          id: "note_3",
          title: "Account Suspension",
          content: "Account suspended due to non-payment. Customer contacted via email and phone. Awaiting response.",
          priority: "urgent",
          isVisible: true,
          createdBy: "billing@company.com",
          createdAt: "2024-01-14T16:45:00Z",
          updatedAt: "2024-01-14T16:45:00Z",
          tags: ["billing", "suspension"]
        }
      ]
    }
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFlagColor = (type: FlagType) => {
    switch (type) {
      case 'warning': return 'bg-red-100 text-red-700 border-red-200';
      case 'high-value': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'vip': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'support': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'billing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'security': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: NotePriority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'high': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const UserCard = ({ user }: { user: UserAccount }) => (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer ${
        selectedUser?.id === user.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedUser(user)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
            {user.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Flags */}
        {user.flags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500">FLAGS</Label>
            <div className="flex flex-wrap gap-1">
              {user.flags.map((flag) => (
                <Badge key={flag.id} variant="outline" className={getFlagColor(flag.type)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {flag.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Notes Summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <StickyNote className="w-3 h-3" />
            {user.notes.length} note{user.notes.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-500">
            {user.notes.filter(n => n.isVisible).length} visible
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Notes & Flags</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Internal notes and flags for customer support and account management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>

        {/* Account Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedUser ? (
            <>
              {/* Account Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {selectedUser.name}
                      </CardTitle>
                      <CardDescription>{selectedUser.email}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setShowAddNote(true)}>
                        <Plus className="w-3 h-3 mr-1" />
                        Add Note
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddFlag(true)}>
                        <Flag className="w-3 h-3 mr-1" />
                        Add Flag
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Tabs defaultValue="notes">
                <TabsList>
                  <TabsTrigger value="notes">Notes ({selectedUser.notes.length})</TabsTrigger>
                  <TabsTrigger value="flags">Flags ({selectedUser.flags.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="notes" className="space-y-4">
                  {showAddNote && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New Note</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={newNote.title}
                              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                              placeholder="Note title..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select 
                              value={newNote.priority} 
                              onValueChange={(value) => setNewNote({...newNote, priority: value as NotePriority})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            value={newNote.content}
                            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                            placeholder="Note details..."
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="visible" 
                              checked={newNote.isVisible}
                              onChange={(e) => setNewNote({...newNote, isVisible: e.target.checked})}
                            />
                            <Label htmlFor="visible" className="text-sm">
                              Visible to other support staff
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowAddNote(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => setShowAddNote(false)}>
                              Save Note
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="space-y-3">
                    {selectedUser.notes.map((note) => (
                      <Card key={note.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                {note.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {note.title}
                              </CardTitle>
                              <CardDescription>
                                By {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getPriorityColor(note.priority)}>
                                {note.priority}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-3">{note.content}</p>
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="flags" className="space-y-4">
                  <div className="space-y-3">
                    {selectedUser.flags.map((flag) => (
                      <Card key={flag.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Flag className="w-4 h-4" />
                                {flag.label}
                              </CardTitle>
                              <CardDescription>
                                By {flag.createdBy} • {new Date(flag.createdAt).toLocaleString()}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getFlagColor(flag.type)}>
                                {flag.type}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{flag.description}</p>
                          {flag.expiresAt && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              Expires: {new Date(flag.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center space-y-2">
                  <StickyNote className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-500">Select an Account</h3>
                  <p className="text-sm text-gray-400">
                    Choose an account from the list to view and manage notes and flags
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Privacy & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              All notes and flags are for internal use only and must comply with privacy regulations.
              Minimize PII in notes and ensure data retention policies are followed.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Data Handling Rules</h4>
              <ul className="space-y-1 text-gray-500">
                <li>• No sensitive personal information</li>
                <li>• Business context only</li>
                <li>• Regular review and cleanup</li>
                <li>• Access logging enabled</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Retention Policy</h4>
              <ul className="space-y-1 text-gray-500">
                <li>• Notes: 2 years maximum</li>
                <li>• Flags: Until resolved</li>
                <li>• Automatic cleanup available</li>
                <li>• Export for compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}