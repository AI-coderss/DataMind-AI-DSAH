
import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Sparkles,
  ChevronRight,
  Bot,
  User,
  Loader2,
  Plus,
  TrendingUp,
  Database,
  Trash2,
  Layout as LayoutIcon,
  Save,
  FolderOpen,
  Settings2,
  Palette,
  FileJson,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatInputWidget from "@/components/chat/ChatInputWidget";
import InteractiveChart from "@/components/charts/InteractiveChart";
import KPICard from "@/components/dashboard/KPICard";
import DrillDownModal from "@/components/dashboard/DrillDownModal";
import ChartGenerator from "@/components/charts/ChartGenerator";
import SaveTemplateDialog from "@/components/dashboard/SaveTemplateDialog";
import TemplateLibrary from "@/components/dashboard/TemplateLibrary";
import ThemeCustomizer from "@/components/dashboard/ThemeCustomizer";
import DashboardExport from "@/components/dashboard/DashboardExport";
import LayoutCustomizer from "@/components/dashboard/LayoutCustomizer";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import { ChartBrushProvider } from "@/components/charts/ChartBrushManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

export default function Dashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);
  const [showChartGenerator, setShowChartGenerator] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const chatInputRef = useRef(null);

  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: dashboardItems = [] } = useQuery({
    queryKey: ['customInsights'],
    queryFn: () => base44.entities.CustomInsight.filter({ pinned_to_dashboard: true }, '-created_date'),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const createInsightMutation = useMutation({
    mutationFn: (insightData) => base44.entities.CustomInsight.create(insightData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customInsights'] });
    },
  });

  const updateInsightMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomInsight.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customInsights'] });
    },
  });

  const deleteInsightMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomInsight.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customInsights'] });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: (templateData) => base44.entities.DashboardTemplate.create(templateData),
    onSuccess: () => {
      alert('Template saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboardTemplates'] }); // Invalidate template list
      setShowSaveTemplate(false);
    },
    onError: (error) => {
      console.error("Error saving template:", error);
      alert('Failed to save template.');
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (dataSources.length > 0 && !selectedDataSource) {
      setSelectedDataSource(dataSources[0].id);
    }
  }, [dataSources]);

  const kpiCards = dashboardItems.filter(item => 
    item.chart_config?.type === 'kpi' || item.chart_config?.type === 'metric'
  );
  const chartItems = dashboardItems.filter(item => 
    item.chart_config?.type !== 'kpi' && item.chart_config?.type !== 'metric'
  );

  const handleReorderCharts = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(chartItems);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    
    newItems.forEach((item, index) => {
      updateInsightMutation.mutate({
        id: item.id,
        data: { ...item, order: index }
      });
    });
  };

  const handleDrillDown = (params) => {
    setDrillDownData(params);
  };

  const handleSaveTemplate = async (templateData) => {
    await saveTemplateMutation.mutateAsync(templateData);
  };

  const handleLoadTemplate = async (templateItems) => {
    if (!selectedDataSource) {
      alert("Please select a data source before loading a template.");
      return;
    }
    for (const item of templateItems) {
      // Create a copy of the item and adjust properties for CustomInsight creation
      const newItem = {
        title: item.title,
        description: item.description,
        chart_type: item.chart_type,
        chart_config: item.chart_config,
        data_source_id: selectedDataSource, // Use currently selected data source
        query: item.query, // Preserve query if it exists
        pinned_to_dashboard: true
      };
      await createInsightMutation.mutateAsync(newItem);
    }
    setShowTemplateLibrary(false);
    queryClient.invalidateQueries({ queryKey: ['customInsights'] });
  };

  const handleImportConfig = async (config) => {
    // config expects { items: [], theme: {} }
    const { items, theme } = config;

    if (!selectedDataSource) {
      alert("Please select a data source before importing dashboard configuration.");
      return;
    }

    // Process items (custom insights)
    for (const item of items) {
      // Create a new object with only the relevant fields for CustomInsight creation
      const insightData = {
        title: item.title,
        description: item.description,
        chart_type: item.chart_type,
        chart_config: item.chart_config,
        data_source_id: selectedDataSource, // Use currently selected data source
        query: item.query, // Preserve query if it exists
        pinned_to_dashboard: true,
      };
      await createInsightMutation.mutateAsync(insightData);
    }

    // Apply theme
    if (theme) {
      localStorage.setItem('dashboardTheme', JSON.stringify(theme));
      // In a real app, you might dispatch an action to update the theme context
      // For now, this just saves it to localStorage for persistence.
    }

    queryClient.invalidateQueries({ queryKey: ['customInsights'] });
    alert('Dashboard configuration imported successfully!');
    setShowExportDialog(false); // Close the export/import dialog
  };

  const analyzeData = async () => {
    if (!selectedDataSource) {
      alert("Please select a data source!");
      return;
    }

    setIsLoading(true);
    try {
      const dataSource = dataSources.find(ds => ds.id === selectedDataSource);
      const prompt = `Analyze this dataset and generate 5 insightful questions with advanced visualization suggestions:

Data Source: ${dataSource.name}
Sample Data: ${JSON.stringify(dataSource.data?.slice(0, 20) || [])}

For each question, suggest:
1. The question
2. Best chart type (bar, line, pie, scatter, area, heatmap, radar, gauge, kpi, metric)
3. Why this visualization is effective

Format as JSON:
{
  "questions": [
    {
      "text": "question text",
      "chartType": "suggested type",
      "reason": "why this chart type"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  text: { type: "string" },
                  chartType: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setMessages([{
        role: "assistant",
        content: "I've analyzed your data! Here are some visualization opportunities:",
        questions: response.questions || []
      }]);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async ({ text }) => {
    if (!text.trim() || !selectedDataSource) return;

    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const dataSource = dataSources.find(ds => ds.id === selectedDataSource);
      
      const prompt = `You are an advanced data visualization expert. Create interactive, sophisticated visualizations.

Data Source: ${dataSource.name}
Data: ${JSON.stringify(dataSource.data || [])}

User Request: ${text}

Generate a response with:
1. Clear answer
2. Advanced visualization (if appropriate) with interactive features
3. Key insights

For charts (bar, line), ensure they are WIDE and use full available width.
For KPI/metric cards, provide clear numerical values.

Use advanced ECharts features:
- Gradients and visual effects
- Interactive tooltips with formatters
- DataZoom for exploration
- Legend interactions
- Animation effects
- Full width layout for line/bar charts

Response format (JSON):
{
  "answer": "Your detailed answer",
  "visualization": {
    "type": "bar|line|pie|scatter|area|heatmap|radar|gauge|kpi|metric",
    "title": "Chart title",
    "description": "What this shows",
    "data": {
      // For kpi: {"value": "123", "label": "Total Sales", "change": "+15%", "trend": "up"}
      // For metric: {"value": "45%", "label": "Conversion Rate"}
      // For charts: Complete ECharts configuration with grid: {left: 50, right: 50, bottom: 50}
    }
  },
  "insights": ["insight 1", "insight 2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            visualization: {
              type: "object",
              properties: {
                type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                data: { type: "object" }
              }
            },
            insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.answer,
        visualization: response.visualization,
        insights: response.insights
      }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToDashboard = async (message) => {
    if (!message.visualization) return;

    try {
      const vis = message.visualization;
      await createInsightMutation.mutateAsync({
        title: vis.title,
        description: vis.description,
        chart_type: vis.type,
        chart_config: { type: vis.type, data: vis.data },
        data_source_id: selectedDataSource,
        query: message.content,
        pinned_to_dashboard: true
      });
      alert("Added to dashboard!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add to dashboard");
    }
  };

  const handleQuestionClick = (question) => {
    setInputText(typeof question === 'string' ? question : question.text);
    chatInputRef.current?.focusInput();
  };

  const handleGenerateChart = async (chartData) => {
    await createInsightMutation.mutateAsync({
      title: chartData.title,
      description: chartData.description,
      chart_type: chartData.chart_type,
      chart_config: chartData.config,
      data_source_id: selectedDataSource,
      pinned_to_dashboard: true
    });
    setShowChartGenerator(false);
  };

  const currentDataSource = dataSources.find(ds => ds.id === selectedDataSource);

  return (
    <ChartBrushProvider>
      <div className="relative min-h-screen">
        <div className="p-4 md:p-8 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">Interactive Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-sm">Advanced visualizations with drill-down capabilities</p>
              </div>
              <div className="flex gap-2">
                {dashboardItems.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => setShowInsightsPanel(!showInsightsPanel)}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="hidden md:inline">AI Insights</span>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Settings2 className="w-4 h-4" />
                      <span className="hidden md:inline">Customize</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowLayoutCustomizer(true)}>
                      <LayoutIcon className="w-4 h-4 mr-2" />
                      Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowThemeCustomizer(true)}>
                      <Palette className="w-4 h-4 mr-2" />
                      Theme
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                      <FileJson className="w-4 h-4 mr-2" />
                      Export/Import
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <LayoutIcon className="w-4 h-4" />
                      <span className="hidden md:inline">Templates</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowSaveTemplate(true)} disabled={dashboardItems.length === 0}>
                      <Save className="w-4 h-4 mr-2" />
                      Save as Template
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowTemplateLibrary(true)}>
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Load Template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={showChartGenerator} onOpenChange={setShowChartGenerator}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      <span className="hidden md:inline">Create Chart</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Custom Chart</DialogTitle>
                    </DialogHeader>
                    {selectedDataSource && (
                      <ChartGenerator
                        data={dataSources.find(ds => ds.id === selectedDataSource)?.data || []}
                        onGenerate={handleGenerateChart}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {dashboardItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 px-4"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-center">Your Dashboard is Empty</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6 text-sm px-4">
                  Use the AI Assistant, Create Chart, or Load a Template to get started
                </p>
                <Button onClick={() => setShowTemplateLibrary(true)} className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Browse Templates
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* KPI Cards Section with Marquee */}
                {kpiCards.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Key Metrics</h3>
                    {kpiCards.length > 4 ? (
                      <div className="relative overflow-hidden">
                        <style>{`
                          @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                          }
                          .marquee-container {
                            display: flex;
                            animation: marquee 30s linear infinite;
                            white-space: nowrap; /* Prevent items from wrapping */
                          }
                          .marquee-container:hover {
                            animation-play-state: paused;
                          }
                        `}</style>
                        <div className="marquee-container">
                          {[...kpiCards, ...kpiCards].map((item, index) => (
                            <motion.div
                              key={`${item.id}-${index}`} // Unique key for duplicated items
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (index % kpiCards.length) * 0.05 }} // Delay based on original index
                              className="flex-shrink-0 w-64 mr-4" // Fixed width for marquee items
                            >
                              <KPICard 
                                item={item} 
                                onDelete={(id) => deleteInsightMutation.mutate(id)} 
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {kpiCards.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <KPICard 
                              item={item} 
                              onDelete={(id) => deleteInsightMutation.mutate(id)} 
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Charts Section with Drag and Drop */}
                {chartItems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Visualizations</h3>
                    <DragDropContext onDragEnd={handleReorderCharts}>
                      <Droppable droppableId="charts-grid">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
                          >
                            {chartItems.map((item, index) => {
                              const isWideChart = item.chart_type === 'line' || item.chart_type === 'bar';
                              return (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                  {(provided, snapshot) => (
                                    <motion.div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: index * 0.05 }}
                                      className={`relative group ${
                                        snapshot.isDragging ? 'z-50 rotate-2' : ''
                                      } ${isWideChart ? 'lg:col-span-2' : ''}`}
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <div className="bg-background/80 backdrop-blur-sm rounded p-1 border border-border">
                                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
                                        onClick={() => deleteInsightMutation.mutate(item.id)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                      <InteractiveChart
                                        chartId={item.id}
                                        title={item.title}
                                        description={item.description}
                                        chartConfig={{
                                          ...item.chart_config,
                                          grid: isWideChart
                                            ? { left: 60, right: 60, bottom: 60, top: 40 }
                                            : item.chart_config?.grid
                                        }}
                                        onDrillDown={handleDrillDown}
                                        data={dataSources.find(ds => ds.id === item.data_source_id)?.data}
                                        drillDownPath={item.drill_down_path || []}
                                      />
                                    </motion.div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <AnimatePresence>
          {showInsightsPanel && currentDataSource && (
            <AIInsightsPanel
              data={currentDataSource.data}
              dashboardItems={dashboardItems}
              onClose={() => setShowInsightsPanel(false)}
            />
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <AnimatePresence>
          {!isPanelOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPanelOpen(true)}
              className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-2xl flex items-center justify-center z-50"
            >
              <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* AI Chat Side Panel */}
        <AnimatePresence>
          {isPanelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setIsPanelOpen(false)}
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-16 md:right-4 md:left-auto md:bottom-4 md:w-[420px] max-h-[calc(100vh-8rem)] md:max-h-[700px] bg-card/95 backdrop-blur-xl border-t md:border border-border md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
              >
                <div className="p-3 border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm">AI Assistant</h2>
                        <p className="text-xs text-muted-foreground hidden md:block">Advanced visualizations</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsPanelOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {dataSources.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3 text-muted-foreground hidden md:block" />
                      <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                        <SelectTrigger className="h-7 text-xs flex-1">
                          <SelectValue placeholder="Select data..." />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map(ds => (
                            <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {selectedDataSource && messages.length === 0 && (
                  <div className="p-2 border-b border-border bg-accent/30">
                    <Button
                      onClick={analyzeData}
                      disabled={isLoading}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 h-8 text-xs"
                    >
                      {isLoading ? <><Loader2 className="w-3 h-3 animate-spin mr-2" />Analyzing...</> : <><Sparkles className="w-3 h-3 mr-2" />Analyze Data</>}
                    </Button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {!selectedDataSource ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <Database className="w-10 h-10 text-muted-foreground mb-2" />
                      <h3 className="text-xs font-semibold mb-1">Select Data Source</h3>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-3">
                      <Sparkles className="w-10 h-10 text-muted-foreground mb-2" />
                      <h3 className="text-xs font-semibold mb-1">Ready to Analyze</h3>
                      <p className="text-xs text-muted-foreground">Click "Analyze Data" or ask a question</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                            <div className={`rounded-lg p-2 max-w-[85%] text-xs ${
                              message.role === 'user' ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'bg-accent/50'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              
                              {message.questions && message.questions.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.questions.map((q, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleQuestionClick(q)}
                                      className="w-full text-left text-xs p-1.5 rounded bg-background/10 hover:bg-background/20 transition-colors"
                                    >
                                      <div className="flex items-start gap-1">
                                        <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                          <p>{typeof q === 'string' ? q : q.text}</p>
                                          {q.chartType && (
                                            <Badge variant="outline" className="text-[10px] mt-1">{q.chartType}</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {message.insights && message.insights.length > 0 && (
                                <div className="mt-2 space-y-0.5">
                                  <p className="text-xs font-semibold flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Insights:
                                  </p>
                                  <ul className="space-y-0.5 text-xs pl-3">
                                    {message.insights.map((insight, i) => (
                                      <li key={i} className="list-disc">{insight}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {message.visualization && (
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => addToDashboard(message)}
                                    className="w-full gap-1 bg-background/20 hover:bg-background/30 h-7 text-xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add to Dashboard
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {message.role === 'user' && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-accent/50 rounded-lg p-2">
                            <div className="flex items-center gap-2 text-xs">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Analyzing...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selectedDataSource && (
                  <div className="p-2 border-t border-border bg-accent/20">
                    <ChatInputWidget
                      ref={chatInputRef}
                      onSendMessage={handleSendMessage}
                      inputText={inputText}
                      setInputText={setInputText}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <DrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          drillData={drillDownData}
        />

        <SaveTemplateDialog
          isOpen={showSaveTemplate}
          onClose={() => setShowSaveTemplate(false)}
          onSave={handleSaveTemplate}
          currentItems={dashboardItems}
        />

        <TemplateLibrary
          isOpen={showTemplateLibrary}
          onClose={() => setShowTemplateLibrary(false)}
          onLoad={handleLoadTemplate}
        />

        <ThemeCustomizer
          isOpen={showThemeCustomizer}
          onClose={() => setShowThemeCustomizer(false)}
          onSave={() => { /* Implement theme saving logic if different from localStorage */ }}
        />

        <DashboardExport
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          dashboardItems={dashboardItems}
          onImport={handleImportConfig}
        />

        <LayoutCustomizer
          isOpen={showLayoutCustomizer}
          onClose={() => setShowLayoutCustomizer(false)}
          onSave={() => { /* Implement layout saving logic */ }}
        />
      </div>
    </ChartBrushProvider>
  );
}
