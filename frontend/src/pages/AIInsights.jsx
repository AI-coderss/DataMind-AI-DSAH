
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Link as LinkIcon,
  RefreshCw,
  Plus,
  Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";

const insightIcons = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  correlation: LinkIcon,
  recommendation: Lightbulb,
};

const impactColors = {
  high: "bg-red-500/20 text-red-600 border-red-500/30",
  medium: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  low: "bg-blue-500/20 text-blue-600 border-blue-500/30",
};

export default function AIInsights() {
  const queryClient = useQueryClient();
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const handleAnalyze = async () => {
    if (!selectedDataSource) return;
    
    setIsAnalyzing(true);
    try {
      const source = dataSources.find(ds => ds.id === selectedDataSource);
      if (!source || !source.data || source.data.length === 0) {
        alert("This data source has no data to analyze");
        return;
      }

      // Create analysis record
      const analysis = await base44.entities.Analysis.create({
        title: `Analysis of ${source.name}`,
        data_source_id: source.id,
        status: "processing"
      });

      // Use AI to analyze the data
      const prompt = `Analyze the following dataset and provide insights:
      
Dataset: ${JSON.stringify(source.data.slice(0, 100))}
Columns: ${source.columns?.map(c => c.name).join(', ')}

Please provide:
1. Key trends
2. Any anomalies or outliers
3. Correlations between variables
4. Recommendations for actions

Format your response as JSON with this structure:
{
  "summary": "Overall summary",
  "insights": [
    {
      "title": "Insight title",
      "description": "Detailed description",
      "type": "trend|anomaly|correlation|recommendation",
      "confidence": 0.0-1.0,
      "impact": "high|medium|low"
    }
  ],
  "metrics": {
    "key_metric_name": value
  }
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string" },
                  confidence: { type: "number" },
                  impact: { type: "string" }
                }
              }
            },
            metrics: { type: "object" }
          }
        }
      });

      // Update analysis with results
      await base44.entities.Analysis.update(analysis.id, {
        ...result,
        status: "completed"
      });

      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      setAnalyzeDialogOpen(false);
      setSelectedDataSource(null); // Reset selected data source
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze data. Please try again.");
    } finally {
      setIsAnalyzing(false);
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
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">AI Insights</h1>
            <p className="text-muted-foreground mt-1">Discover patterns and trends in your data</p>
          </div>

          <Dialog open={analyzeDialogOpen} onOpenChange={setAnalyzeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg">
                <Brain className="w-4 h-4 mr-2" />
                Generate Analysis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate AI Analysis</DialogTitle>
                <DialogDescription>
                  Select a data source to analyze with AI
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Data Source</Label>
                  <Select value={selectedDataSource || ""} onValueChange={setSelectedDataSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name} ({source.row_count} rows)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedDataSource || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Analyses */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading analyses...</div>
        ) : analyses.length > 0 ? (
          <div className="space-y-6">
            {analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{analysis.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(analysis.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          analysis.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-orange-500/20 text-orange-600'
                        }
                      >
                        {analysis.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  {analysis.status === 'completed' && (
                    <CardContent className="space-y-6">
                      {/* Summary */}
                      {analysis.summary && (
                        <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-muted-foreground">{analysis.summary}</p>
                        </div>
                      )}

                      {/* Key Metrics */}
                      {analysis.metrics && Object.keys(analysis.metrics).length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Key Metrics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(analysis.metrics).map(([key, value]) => (
                              <div key={key} className="p-3 rounded-lg bg-accent/50">
                                <p className="text-xs text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-lg font-bold mt-1">
                                  {typeof value === 'number' ? value.toFixed(2) : value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Insights */}
                      {analysis.insights && analysis.insights.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Insights</h4>
                          <div className="space-y-3">
                            {analysis.insights.map((insight, idx) => {
                              const Icon = insightIcons[insight.type] || Lightbulb;
                              return (
                                <div
                                  key={idx}
                                  className="p-4 rounded-lg border border-border/50 bg-card"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-${insight.type === 'trend' ? 'blue' : insight.type === 'anomaly' ? 'red' : insight.type === 'correlation' ? 'purple' : 'green'}-500/20 flex items-center justify-center`}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="font-semibold">{insight.title}</h5>
                                        <Badge
                                          variant="outline"
                                          className={impactColors[insight.impact] || impactColors.low}
                                        >
                                          {insight.impact} impact
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {insight.description}
                                      </p>
                                      {insight.confidence && (
                                        <div className="mt-2">
                                          <div className="flex items-center gap-2 text-xs">
                                            <span className="text-muted-foreground">Confidence:</span>
                                            <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden max-w-[100px]">
                                              <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                style={{ width: `${insight.confidence * 100}%` }}
                                              />
                                            </div>
                                            <span className="font-medium">
                                              {(insight.confidence * 100).toFixed(0)}%
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass-effect border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Brain className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No analyses yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Generate your first AI-powered analysis
              </p>
              <Button onClick={() => setAnalyzeDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
