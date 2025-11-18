import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Database, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataSourceSuggestions({ currentDataSources, dashboardItems }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const dataSourcesInfo = currentDataSources.map(ds => ({
        name: ds.name,
        type: ds.type,
        columns: ds.columns?.map(c => c.name).join(', ') || 'N/A'
      }));

      const dashboardContext = dashboardItems.map(item => ({
        title: item.title,
        type: item.chart_type
      }));

      const prompt = `Based on the existing data sources and dashboard content, suggest 3-5 additional data sources that would enhance analysis:

Current Data Sources:
${JSON.stringify(dataSourcesInfo, null, 2)}

Dashboard Items:
${JSON.stringify(dashboardContext, null, 2)}

Provide suggestions for complementary data sources that would:
1. Fill gaps in current analysis
2. Enable deeper insights
3. Support predictive or comparative analysis

Format as JSON:
{
  "suggestions": [
    {
      "name": "suggested data source name",
      "reason": "why this would be valuable",
      "dataTypes": ["example data types it should contain"],
      "potentialInsights": "what insights it could unlock"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  dataTypes: { type: "array", items: { type: "string" } },
                  potentialInsights: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Data Source Suggestions
          </CardTitle>
          <Button
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading || currentDataSources.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Get Suggestions
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {suggestions.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Click "Get Suggestions" to discover complementary data sources
            </p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{suggestion.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{suggestion.reason}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {suggestion.dataTypes?.map((type, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-start gap-2 bg-accent/50 rounded p-2">
                            <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs">{suggestion.potentialInsights}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}