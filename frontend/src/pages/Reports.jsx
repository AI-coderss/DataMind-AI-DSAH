
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Calendar,
  BarChart3,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Reports() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: "",
    template_type: "executive_summary",
    data_source_ids: []
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const createMutation = useMutation({
    mutationFn: (reportData) => base44.entities.Report.create(reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setCreateDialogOpen(false);
      setNewReport({ name: "", template_type: "executive_summary", data_source_ids: [] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Report.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const handleCreate = () => {
    if (!newReport.name) return;
    
    createMutation.mutate({
      ...newReport,
      sections: [],
      is_template: false,
      last_generated: new Date().toISOString()
    });
  };

  const templates = [
    { value: "executive_summary", label: "Executive Summary", icon: BarChart3 },
    { value: "detailed_analysis", label: "Detailed Analysis", icon: FileText },
    { value: "trend_report", label: "Trend Report", icon: Calendar },
    { value: "custom", label: "Custom Report", icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Reports</h1>
            <p className="text-muted-foreground mt-1">Create and manage custom reports</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Configure your report template and data sources
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Report Name</Label>
                  <Input
                    placeholder="Monthly Analysis Report"
                    value={newReport.name}
                    onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Template Type</Label>
                  <Select
                    value={newReport.template_type}
                    onValueChange={(value) => setNewReport({...newReport, template_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data Sources (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      if (!newReport.data_source_ids.includes(value)) {
                        setNewReport({
                          ...newReport,
                          data_source_ids: [...newReport.data_source_ids, value]
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newReport.data_source_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newReport.data_source_ids.map((id) => {
                        const source = dataSources.find(ds => ds.id === id);
                        return (
                          <Badge key={id} variant="secondary">
                            {source?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button onClick={handleCreate} disabled={!newReport.name} className="w-full">
                  Create Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="glass-effect border-border/50 animate-pulse">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"></div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, index) => {
              const template = templates.find(t => t.value === report.template_type);
              const Icon = template?.icon || FileText;

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-border/50 hover:shadow-lg transition-all group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{report.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {template?.label || report.template_type}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(report.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        {report.data_source_ids?.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Data Sources</span>
                            <span className="font-medium">{report.data_source_ids.length}</span>
                          </div>
                        )}
                        {report.last_generated && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Generated</span>
                            <span className="font-medium">
                              {new Date(report.last_generated).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {report.is_template && (
                          <Badge className="bg-blue-500/20 text-blue-600">Template</Badge>
                        )}
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="glass-effect border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create your first custom report
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
