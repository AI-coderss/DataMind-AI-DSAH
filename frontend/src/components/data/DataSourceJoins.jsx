import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitMerge, Loader2, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataSourceJoins({ dataSources }) {
  const [joinSuggestions, setJoinSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeJoins = async () => {
    if (dataSources.length < 2) {
      alert('Need at least 2 data sources to suggest joins');
      return;
    }

    setIsAnalyzing(true);
    try {
      const dataSourcesInfo = dataSources.map(ds => ({
        id: ds.id,
        name: ds.name,
        columns: ds.columns?.map(c => ({ name: c.name, type: c.type })) || [],
        sampleData: ds.data?.slice(0, 5) || []
      }));

      const prompt = `Analyze these data sources and suggest potential joins:

Data Sources:
${JSON.stringify(dataSourcesInfo, null, 2)}

Identify:
1. Common columns that could be used for joins
2. Semantic relationships between tables
3. Recommended join types (inner, left, etc.)
4. Potential insights from combining these sources

Format as JSON:
{
  "joins": [
    {
      "leftSource": "source name",
      "rightSource": "source name",
      "leftColumn": "column name",
      "rightColumn": "column name",
      "joinType": "inner|left|right|full",
      "confidence": "high|medium|low",
      "reason": "why this join makes sense",
      "potentialInsights": "what you could learn from this join"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            joins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  leftSource: { type: "string" },
                  rightSource: { type: "string" },
                  leftColumn: { type: "string" },
                  rightColumn: { type: "string" },
                  joinType: { type: "string" },
                  confidence: { type: "string" },
                  reason: { type: "string" },
                  potentialInsights: { type: "string" }
                }
              }
            }
          }
        }
      });

      setJoinSuggestions(response.joins || []);
    } catch (error) {
      console.error('Join analysis error:', error);
      alert('Failed to analyze joins');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confidenceColors = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-indigo-500" />
            Data Source Joins
          </CardTitle>
          <Button
            size="sm"
            onClick={analyzeJoins}
            disabled={isAnalyzing || dataSources.length < 2}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <GitMerge className="w-4 h-4" />
                Find Joins
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {joinSuggestions.length === 0 && !isAnalyzing ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {dataSources.length < 2
                ? 'Add at least 2 data sources to detect joins'
                : 'Click "Find Joins" to discover relationships between data sources'}
            </p>
          ) : (
            <div className="space-y-3">
              {joinSuggestions.map((join, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-indigo-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={confidenceColors[join.confidence]}>
                              {join.confidence} confidence
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {join.joinType} join
                            </Badge>
                          </div>
                          <div className="text-sm mb-2">
                            <span className="font-semibold">{join.leftSource}</span>
                            <span className="text-muted-foreground mx-1">·</span>
                            <code className="text-xs bg-accent px-1 py-0.5 rounded">
                              {join.leftColumn}
                            </code>
                            <span className="mx-2">→</span>
                            <span className="font-semibold">{join.rightSource}</span>
                            <span className="text-muted-foreground mx-1">·</span>
                            <code className="text-xs bg-accent px-1 py-0.5 rounded">
                              {join.rightColumn}
                            </code>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{join.reason}</p>
                          <div className="bg-accent/50 rounded p-2">
                            <p className="text-xs font-medium mb-1">💡 Potential Insights:</p>
                            <p className="text-xs">{join.potentialInsights}</p>
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