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
  MessageSquare, 
  Search, 
  Plus, 
  Copy,
  Edit,
  Trash2,
  Tag,
  Clock,
  User,
  Filter,
  BookOpen,
  Star
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ReplyCategory = 'support' | 'finance' | 'sales' | 'technical' | 'billing' | 'general';

type SavedReply = {
  id: string;
  title: string;
  content: string;
  category: ReplyCategory;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isPublic: boolean;
  isFavorite: boolean;
};

export default function SavedRepliesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ReplyCategory | 'all'>('all');
  const [selectedReply, setSelectedReply] = useState<SavedReply | null>(null);
  const [showAddReply, setShowAddReply] = useState(false);
  const [newReply, setNewReply] = useState({
    title: "",
    content: "",
    category: "support" as ReplyCategory,
    tags: [] as string[],
    isPublic: true,
  });

  const mockReplies: SavedReply[] = [
    {
      id: "reply_1",
      title: "Payment Method Update Instructions",
      content: `Hi {{customer_name}},

Thank you for reaching out regarding your payment method update.

To update your payment information:
1. Log into your account at {{dashboard_url}}
2. Navigate to Billing Settings
3. Click "Update Payment Method"
4. Enter your new payment details

If you encounter any issues, please don't hesitate to contact us.

Best regards,
{{agent_name}}
{{company_name}} Support Team`,
      category: "billing",
      tags: ["payment", "billing", "instructions"],
      createdBy: "support@company.com",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-12T15:30:00Z",
      usageCount: 45,
      isPublic: true,
      isFavorite: true
    },
    {
      id: "reply_2",
      title: "Account Suspension Resolution",
      content: `Hello {{customer_name}},

I understand your concern about your account suspension. I've reviewed your account and can help resolve this issue.

Your account was suspended due to: {{suspension_reason}}

To reactivate your account:
{{resolution_steps}}

Once these steps are completed, your account will be reactivated within 24 hours.

Please let me know if you need any assistance with these steps.

Kind regards,
{{agent_name}}`,
      category: "support",
      tags: ["suspension", "account", "resolution"],
      createdBy: "admin@company.com",
      createdAt: "2024-01-08T14:20:00Z",
      updatedAt: "2024-01-08T14:20:00Z",
      usageCount: 23,
      isPublic: true,
      isFavorite: false
    },
    {
      id: "reply_3",
      title: "Refund Process Explanation",
      content: `Dear {{customer_name}},

Thank you for your refund request. I've initiated the refund process for invoice {{invoice_number}}.

Refund Details:
- Amount: {{refund_amount}}
- Method: {{payment_method}}
- Processing Time: 5-7 business days

You will receive an email confirmation once the refund is processed. The funds should appear in your account within the specified timeframe.

If you have any questions about this refund, please reference case #{{case_number}}.

Best regards,
{{agent_name}}
Finance Team`,
      category: "finance",
      tags: ["refund", "payment", "finance"],
      createdBy: "finance@company.com",
      createdAt: "2024-01-05T09:15:00Z",
      updatedAt: "2024-01-07T11:45:00Z",
      usageCount: 31,
      isPublic: true,
      isFavorite: true
    },
    {
      id: "reply_4",
      title: "Feature Request Acknowledgment",
      content: `Hi {{customer_name}},

Thank you for taking the time to share your feature request with us.

Your suggestion: {{feature_description}}

I've added this to our product roadmap for consideration. Our product team reviews all feature requests monthly, and we'll keep you updated on any developments.

In the meantime, you might find these existing features helpful:
{{alternative_features}}

We truly appreciate your feedback and input in making our product better.

Best regards,
{{agent_name}}
Product Support Team`,
      category: "technical",
      tags: ["feature-request", "product", "roadmap"],
      createdBy: "product@company.com",
      createdAt: "2024-01-03T16:30:00Z",
      updatedAt: "2024-01-03T16:30:00Z",
      usageCount: 18,
      isPublic: true,
      isFavorite: false
    },
    {
      id: "reply_5",
      title: "Contract Renewal Follow-up",
      content: `Dear {{customer_name}},

I hope this email finds you well. I'm reaching out regarding your upcoming contract renewal.

Current Contract Details:
- Contract: {{contract_number}}
- Expiration Date: {{expiration_date}}
- Current Plan: {{current_plan}}

Renewal Options:
{{renewal_options}}

To discuss your renewal or explore upgrade options, please reply to this email or schedule a call at {{calendar_link}}.

Thank you for your continued partnership.

Best regards,
{{agent_name}}
Account Management Team`,
      category: "sales",
      tags: ["contract", "renewal", "sales"],
      createdBy: "sales@company.com",
      createdAt: "2023-12-28T13:45:00Z",
      updatedAt: "2024-01-02T10:20:00Z",
      usageCount: 12,
      isPublic: false,
      isFavorite: true
    }
  ];

  const filteredReplies = mockReplies.filter(reply => {
    const matchesSearch = reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reply.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reply.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || reply.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: ReplyCategory) => {
    switch (category) {
      case 'support': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'finance': return 'bg-green-100 text-green-700 border-green-200';
      case 'sales': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'technical': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'billing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'general': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // In a real app, you'd show a toast notification here
    console.log('Copied to clipboard');
  };

  const ReplyCard = ({ reply }: { reply: SavedReply }) => (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer ${
        selectedReply?.id === reply.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedReply(reply)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {reply.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              {reply.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getCategoryColor(reply.category)}>
                {reply.category}
              </Badge>
              {!reply.isPublic && (
                <Badge variant="outline">Private</Badge>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(reply.content);
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {reply.content.substring(0, 150)}...
        </p>
        
        {reply.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reply.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {reply.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{reply.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {reply.createdBy.split('@')[0]}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {reply.usageCount} uses
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(reply.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Replies</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Template library for support and finance communications
          </p>
        </div>
        <Button onClick={() => setShowAddReply(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Reply Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search titles, content, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ReplyCategory | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Reply Form */}
          {showAddReply && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Reply Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Title</Label>
                    <Input
                      value={newReply.title}
                      onChange={(e) => setNewReply({...newReply, title: e.target.value})}
                      placeholder="Brief description of the template..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={newReply.category} 
                      onValueChange={(value) => setNewReply({...newReply, category: value as ReplyCategory})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Template Content</Label>
                  <Textarea
                    value={newReply.content}
                    onChange={(e) => setNewReply({...newReply, content: e.target.value})}
                    placeholder="Template content with variables like {{customer_name}}..."
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="public" 
                      checked={newReply.isPublic}
                      onChange={(e) => setNewReply({...newReply, isPublic: e.target.checked})}
                    />
                    <Label htmlFor="public" className="text-sm">
                      Make available to all team members
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddReply(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowAddReply(false)}>
                      Save Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Templates ({filteredReplies.length})
              </h3>
              <div className="flex gap-2">
                {['support', 'finance', 'sales', 'technical'].map(category => {
                  const count = filteredReplies.filter(r => r.category === category).length;
                  return count > 0 ? (
                    <Badge key={category} variant="outline" className={getCategoryColor(category as ReplyCategory)}>
                      {category}: {count}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            
            <div className="grid gap-3">
              {filteredReplies.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>
          </div>
        </div>

        {/* Template Preview */}
        <div className="space-y-4">
          {selectedReply ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedReply.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {selectedReply.title}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className={getCategoryColor(selectedReply.category)}>
                        {selectedReply.category}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Star className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Template Content</Label>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-1">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {selectedReply.content}
                      </pre>
                    </div>
                  </div>

                  {selectedReply.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedReply.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-sm font-medium">Usage Count</Label>
                      <p>{selectedReply.usageCount} times</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p>{new Date(selectedReply.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Created By</Label>
                    <p>{selectedReply.createdBy}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => copyToClipboard(selectedReply.content)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Template
                  </Button>
                </div>

                <Alert>
                  <Tag className="h-4 w-4" />
                  <AlertDescription>
                    Use variables like {`{{customer_name}}`}, {`{{agent_name}}`}, and {`{{case_number}}`} to personalize messages automatically.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center space-y-2">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-500">Select a Template</h3>
                  <p className="text-sm text-gray-400">
                    Choose a template from the list to preview and copy
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4" />
                Available Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">{`{{customer_name}}`}</div>
                  <div className="font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">{`{{agent_name}}`}</div>
                  <div className="font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">{`{{case_number}}`}</div>
                  <div className="font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">{`{{invoice_number}}`}</div>
                  <div className="font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">{`{{company_name}}`}</div>
                  <div className="font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">{`{{dashboard_url}}`}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}