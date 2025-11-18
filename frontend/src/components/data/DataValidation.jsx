import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataValidation({ dataSource, onApplyFixes }) {
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateData = async () => {
    setIsValidating(true);
    try {
      const prompt = `Analyze this dataset and provide data quality assessment and cleaning suggestions:

Data Source: ${dataSource.name}
Sample Data (first 20 rows): ${JSON.stringify(dataSource.data?.slice(0, 20) || [])}
Columns: ${JSON.stringify(dataSource.columns || [])}

Analyze for:
1. Missing values and how to handle them
2. Data type inconsistencies
3. Outliers or anomalies
4. Duplicate records
5. Format issues (dates, numbers, etc.)
6. Suggested data transformations

Format as JSON:
{
  "overallQuality": "excellent|good|fair|poor",
  "issues": [
    {
      "type": "missing_values|type_mismatch|outliers|duplicates|format_issue",
      "severity": "high|medium|low",
      "column": "column name",
      "description": "detailed description",
      "suggestion": "how to fix it",
      "affectedRows": number
    }
  ],
  "recommendations": [
    {
      "action": "recommended action",
      "reason": "why this is recommended",
      "impact": "expected improvement"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overallQuality: { type: "string" },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  severity: { type: "string" },
                  column: { type: "string" },
                  description: { type: "string" },
                  suggestion: { type: "string" },
                  affectedRows: { type: "number" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  reason: { type: "string" },
                  impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setValidationResults(response);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Failed to validate data');
    } finally {
      setIsValidating(false);
    }
  };

  const qualityColors = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    fair: 'text-yellow-500',
    poor: 'text-red-500'
  };

  const severityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            Data Quality Assessment
          </CardTitle>
          <Button
            size="sm"
            onClick={validateData}
            disabled={isValidating}
            className="gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Validate Data
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {!validationResults && !isValidating ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Click "Validate Data" to analyze data quality and get cleaning suggestions
            </p>
          ) : validationResults ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm font-medium">Overall Quality:</span>
                <span className={`text-sm font-bold capitalize ${qualityColors[validationResults.overallQuality]}`}>
                  {validationResults.overallQuality}
                </span>
              </div>

              {validationResults.issues && validationResults.issues.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Issues Found ({validationResults.issues.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResults.issues.map((issue, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-l-4 border-l-red-500">
                          <CardContent className="pt-3">
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={severityColors[issue.severity]}>
                                {issue.severity} severity
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {issue.affectedRows} rows
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">
                              {issue.column && `Column: ${issue.column}`}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {issue.description}
                            </p>
                            <div className="bg-accent/50 rounded p-2">
                              <p className="text-xs font-medium mb-1">💡 Suggestion:</p>
                              <p className="text-xs">{issue.suggestion}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {validationResults.recommendations && validationResults.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {validationResults.recommendations.map((rec, index) => (
                      <Card key={index} className="bg-accent/30">
                        <CardContent className="pt-3">
                          <p className="text-sm font-medium mb-1">{rec.action}</p>
                          <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                          <Badge variant="outline" className="text-xs">
                            Impact: {rec.impact}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}