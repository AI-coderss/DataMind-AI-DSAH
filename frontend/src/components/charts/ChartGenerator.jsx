import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import ChartTypeSelector from './ChartTypeSelector';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ChartGenerator({ data, onGenerate }) {
  const [chartType, setChartType] = useState('bar');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAdvancedChart = async () => {
    setIsGenerating(true);
    try {
      const isKpiType = chartType === 'kpi' || chartType === 'metric';
      
      let prompt, responseSchema;

      if (isKpiType) {
        prompt = `Generate a ${chartType} card configuration based on this data:

Data sample:
${JSON.stringify(data.slice(0, 20), null, 2)}

${customPrompt ? `Additional requirements: ${customPrompt}` : ''}

Create a ${chartType} card with:
- A clear numerical value (aggregated from the data)
- Descriptive label
- Trend indicator (up/down) if applicable
- Change percentage if applicable

Return JSON:
{
  "title": "Card Title (e.g., Total Sales)",
  "description": "Brief description",
  "config": {
    "type": "${chartType}",
    "data": {
      "value": "numerical value",
      "label": "descriptive label",
      "change": "+X%" (optional),
      "trend": "up" or "down" (optional)
    }
  }
}`;

        responseSchema = {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            config: {
              type: "object",
              properties: {
                type: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    value: { type: "string" },
                    label: { type: "string" },
                    change: { type: "string" },
                    trend: { type: "string" }
                  }
                }
              }
            }
          }
        };
      } else {
        prompt = `Generate an advanced ${chartType} chart configuration for ECharts.

Data sample:
${JSON.stringify(data.slice(0, 20), null, 2)}

${customPrompt ? `Additional requirements: ${customPrompt}` : ''}

Create a sophisticated, interactive chart with:
- Smooth animations
- Interactive tooltips
- Legend with click events
- Zoom and dataZoom for time series
- Visual styling with gradients
- Responsive design
- Drill-down capability markers

Return valid ECharts option object as JSON:
{
  "title": "Chart Title",
  "description": "What this chart shows",
  "config": {
    // Complete ECharts configuration
  }
}`;

        responseSchema = {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            config: { type: "object" }
          }
        };
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: responseSchema
      });

      onGenerate({
        ...response,
        chart_type: chartType
      });
    } catch (error) {
      console.error('Chart generation error:', error);
      alert('Failed to generate chart. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Chart Type</Label>
        <div className="mt-2">
          <ChartTypeSelector selected={chartType} onChange={setChartType} />
        </div>
      </div>

      <div>
        <Label>Custom Instructions (Optional)</Label>
        <Textarea
          placeholder="E.g., Focus on sales trends, highlight top performers, use blue color scheme..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="mt-2"
          rows={3}
        />
      </div>

      <Button
        onClick={generateAdvancedChart}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate {chartType === 'kpi' || chartType === 'metric' ? 'Card' : 'Chart'}
          </>
        )}
      </Button>
    </div>
  );
}