import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layout, 
  Trash2, 
  Share2, 
  Download, 
  Search,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Settings
} from 'lucide-react';

const categoryIcons = {
  custom: Settings,
  sales: DollarSign,
  marketing: TrendingUp,
  finance: BarChart3,
  operations: Users
};

export default function TemplateLibrary({ isOpen, onClose, onLoad }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shareTemplateId, setShareTemplateId] = useState(null);
  const [shareEmails, setShareEmails] = useState('');
  const queryClient = useQueryClient();

  const { data: myTemplates = [] } = useQuery({
    queryKey: ['myTemplates'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DashboardTemplate.filter({ created_by: user.email }, '-created_date');
    },
    enabled: isOpen,
  });

  const { data: sharedTemplates = [] } = useQuery({
    queryKey: ['sharedTemplates'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const all = await base44.entities.DashboardTemplate.filter({ is_shared: true }, '-created_date');
      return all.filter(t => t.shared_with?.includes(user.email) || t.created_by === user.email);
    },
    enabled: isOpen,
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.DashboardTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTemplates'] });
    },
  });

  const shareTemplateMutation = useMutation({
    mutationFn: async ({ id, emails }) => {
      const template = myTemplates.find(t => t.id === id);
      const existingEmails = template.shared_with || [];
      const newEmails = emails.split(',').map(e => e.trim()).filter(e => e);
      
      return base44.entities.DashboardTemplate.update(id, {
        is_shared: true,
        shared_with: [...new Set([...existingEmails, ...newEmails])]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['sharedTemplates'] });
      setShareTemplateId(null);
      setShareEmails('');
      alert('Template shared successfully!');
    },
  });

  const handleShare = () => {
    if (!shareEmails.trim()) {
      alert('Please enter at least one email address');
      return;
    }
    shareTemplateMutation.mutate({ id: shareTemplateId, emails: shareEmails });
  };

  const filteredMyTemplates = myTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSharedTemplates = sharedTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TemplateCard = ({ template, showDelete = false }) => {
    const Icon = categoryIcons[template.category] || Settings;
    
    return (
      <Card className="group hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm line-clamp-1">{template.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {template.description || 'No description'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {showDelete && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setShareTemplateId(template.id)}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      if (confirm('Delete this template?')) {
                        deleteTemplateMutation.mutate(template.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {template.items?.length || 0} items
              </Badge>
              <Badge className="text-xs capitalize">{template.category}</Badge>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onLoad(template.items);
                onClose();
              }}
              className="h-7 gap-1"
            >
              <Download className="w-3 h-3" />
              Load
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Dashboard Templates
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="my" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my">My Templates ({myTemplates.length})</TabsTrigger>
              <TabsTrigger value="shared">Shared ({sharedTemplates.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my" className="flex-1 overflow-y-auto mt-4">
              {filteredMyTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No templates found' : 'No templates saved yet'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMyTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} showDelete />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="flex-1 overflow-y-auto mt-4">
              {filteredSharedTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No templates found' : 'No shared templates yet'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSharedTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={!!shareTemplateId} onOpenChange={() => setShareTemplateId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                User Emails (comma-separated)
              </Label>
              <textarea
                placeholder="email1@example.com, email2@example.com"
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShareTemplateId(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleShare} className="flex-1 gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}