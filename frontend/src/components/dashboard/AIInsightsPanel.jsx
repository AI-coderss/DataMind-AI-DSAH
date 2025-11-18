import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, BarChart3, Loader2, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIInsightsPanel({ data, dashboardItems, onClose }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      analyzeData();
    }
  }, [data, dashboardItems]);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this dashboard data and provide comprehensive insights:

Data Sample: ${JSON.stringify(data.slice(0, 50))}
Dashboard Items: ${dashboardItems.length} visualizations

Generate:
1. Key insights (3-5 important findings)
2. Anomalies detected (unusual patterns or outliers)
3. Trend summaries (what's going up, down, or staying stable)
4. Recommendations (actionable suggestions)

Format as JSON:
{
  "insights": [
    {
      "type": "insight|anomaly|trend|recommendation",
      "severity": "high|medium|low",
      "title": "brief title",
      "description": "detailed explanation",
      "metric": "affected metric/field name"
    }
  ],
  "summary": "Overall summary of the data"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  severity: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  metric: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'anomaly': return AlertTriangle;
      case 'trend': return TrendingUp;
      case 'recommendation': return Sparkles;
      default: return BarChart3;
    }
  };

  const getColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default: return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-24 md:top-36 bottom-24 md:bottom-8 w-[calc(100%-2rem)] md:w-96 z-40"
    >
      <Card className="glass-effect h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Insights
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={analyzeData}
                disabled={isAnalyzing}
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={onClose}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
              <p className="text-sm text-muted-foreground">Analyzing your data...</p>
            </div>
          ) : insights ? (
            <>
              {insights.summary && (
                <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/50">
                  <CardContent className="pt-3">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Summary</p>
                    <p className="text-sm">{insights.summary}</p>
                  </CardContent>
                </Card>
              )}

              <AnimatePresence>
                {insights.insights?.map((insight, index) => {
                  const Icon = getIcon(insight.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`border-l-4 ${getColor(insight.severity)}`}>
                        <CardContent className="pt-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`text-xs ${getSeverityBadge(insight.severity)}`}>
                                  {insight.severity}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {insight.type}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-semibold">{insight.title}</h4>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          {insight.metric && (
                            <div className="flex items-center gap-1 text-xs">
                              <BarChart3 className="w-3 h-3" />
                              <span className="font-medium">{insight.metric}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Sparkles className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="text-sm font-semibold mb-1">No Insights Yet</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Add data to your dashboard to generate insights
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}