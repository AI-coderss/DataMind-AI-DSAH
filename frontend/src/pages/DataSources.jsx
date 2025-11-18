import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataSourceSuggestions from "@/components/data/DataSourceSuggestions";
import DataValidation from "@/components/data/DataValidation";
import DataSourceJoins from "@/components/data/DataSourceJoins";

export default function DataSources() {
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [newSource, setNewSource] = useState({
    name: "",
    type: "csv",
    external_link: ""
  });

  const { data: dataSources = [], isLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: dashboardItems = [] } = useQuery({
    queryKey: ['customInsights'],
    queryFn: () => base44.entities.CustomInsight.filter({ pinned_to_dashboard: true }, '-created_date'),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DataSource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true
          }
        }
      });

      if (result.status === "success") {
        const data = Array.isArray(result.output) ? result.output : [result.output];
        const columns = data.length > 0 ? Object.keys(data[0]).map(key => ({
          name: key,
          type: typeof data[0][key]
        })) : [];

        const createdSource = await base44.entities.DataSource.create({
          name: newSource.name || file.name,
          type: newSource.type,
          file_url,
          data,
          columns,
          row_count: data.length,
          last_synced: new Date().toISOString(),
          status: "active"
        });

        queryClient.invalidateQueries({ queryKey: ['dataSources'] });
        setUploadDialogOpen(false);
        setNewSource({ name: "", type: "csv", external_link: "" });
        setSelectedSource(createdSource);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleGoogleSheets = async () => {
    if (!newSource.external_link) return;
    
    setUploading(true);
    try {
      await base44.entities.DataSource.create({
        name: newSource.name || "Google Sheets Import",
        type: "google_sheets",
        external_link: newSource.external_link,
        status: "active",
        data: [],
        last_synced: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      setUploadDialogOpen(false);
      setNewSource({ name: "", type: "csv", external_link: "" });
      
      alert("Google Sheets link saved! To import data: 1) Export as CSV from Google Sheets 2) Upload the CSV file");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUploading(false);
    }
  };

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
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Data Sources</h1>
            <p className="text-muted-foreground mt-1">Manage your data connections</p>
          </div>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Data Source
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Data Source</DialogTitle>
                <DialogDescription>
                  Upload a file or connect to an external data source
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="link">Google Sheets</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="My Data Source"
                        value={newSource.name}
                        onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Type</Label>
                      <Select value={newSource.type} onValueChange={(value) => setNewSource({...newSource, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>File</Label>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </div>

                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing file...
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="link" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="My Google Sheet"
                        value={newSource.name}
                        onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Google Sheets URL</Label>
                      <Input
                        placeholder="https://docs.google.com/spreadsheets/..."
                        value={newSource.external_link}
                        onChange={(e) => setNewSource({...newSource, external_link: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        To import data, export your sheet as CSV and upload it
                      </p>
                    </div>

                    <Button onClick={handleGoogleSheets} disabled={uploading || !newSource.external_link}>
                      {uploading ? "Saving..." : "Save Link"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* AI-Powered Features */}
        {dataSources.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataSourceSuggestions 
              currentDataSources={dataSources}
              dashboardItems={dashboardItems}
            />
            <DataSourceJoins dataSources={dataSources} />
          </div>
        )}

        {/* Data Validation for Selected Source */}
        {selectedSource && (
          <DataValidation 
            dataSource={selectedSource}
            onApplyFixes={() => queryClient.invalidateQueries({ queryKey: ['dataSources'] })}
          />
        )}

        {/* Data Sources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-effect animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dataSources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`glass-effect border-border/50 hover:shadow-lg transition-all group cursor-pointer ${
                    selectedSource?.id === source.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedSource(source)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          {source.type === 'google_sheets' ? (
                            <LinkIcon className="w-5 h-5 text-white" />
                          ) : source.type === 'excel' ? (
                            <FileSpreadsheet className="w-5 h-5 text-white" />
                          ) : (
                            <FileText className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{source.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {source.type}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(source.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {source.row_count && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rows</span>
                          <span className="font-medium">{source.row_count}</span>
                        </div>
                      )}
                      {source.columns?.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Columns</span>
                          <span className="font-medium">{source.columns.length}</span>
                        </div>
                      )}
                      {source.last_synced && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last synced</span>
                          <span className="font-medium">
                            {new Date(source.last_synced).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        {source.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                        <span className="text-xs capitalize">{source.status}</span>
                      </div>
                    </div>
                    
                    {source.file_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4" 
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={source.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass-effect border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Upload className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No data sources yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Upload your first dataset to start analyzing
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Data Source
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}