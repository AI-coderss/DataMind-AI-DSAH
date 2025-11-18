
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  Sparkles,
  Pin,
  Loader2,
  TrendingUp,
  Database,
  Lightbulb,
  History,
  Save
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatInputWidget from "@/components/chat/ChatInputWidget";
import EChartsWrapper from "@/components/charts/EChartsWrapper";
import ChatHistoryPanel from "@/components/chat/ChatHistoryPanel";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const queryClient = useQueryClient();
  // questionsRef is no longer needed for the animation
  // const questionsRef = useRef([]);

  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const createInsightMutation = useMutation({
    mutationFn: (insightData) => base44.entities.CustomInsight.create(insightData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customInsights'] });
    },
  });

  const saveConversationMutation = useMutation({
    mutationFn: (conversationData) => {
      if (currentConversationId) {
        return base44.entities.ChatHistory.update(currentConversationId, conversationData);
      } else {
        return base44.entities.ChatHistory.create(conversationData);
      }
    },
    onSuccess: (data) => {
      if (!currentConversationId) {
        setCurrentConversationId(data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (dataSources.length > 0 && !selectedDataSource) {
      setSelectedDataSource(dataSources[0].id);
    }
  }, [dataSources]);

  useEffect(() => {
    if (selectedDataSource && messages.length === 0 && !currentConversationId) {
      generateSuggestedQuestions();
    }
  }, [selectedDataSource]);

  useEffect(() => {
    // Auto-save conversation after new messages
    if (messages.length > 0 && selectedDataSource) {
      const timer = setTimeout(() => {
        saveConversation();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    // Load GSAP (kept in case it's used elsewhere, but not for suggested questions animation anymore)
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const saveConversation = async () => {
    if (messages.length === 0 || !selectedDataSource) return;

    const dataSource = dataSources.find(ds => ds.id === selectedDataSource);
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'New Conversation';
    const title = firstUserMessage.length > 50 
      ? firstUserMessage.substring(0, 50) + '...' 
      : firstUserMessage;

    const conversationData = {
      title,
      messages,
      data_source_id: selectedDataSource,
      data_source_name: dataSource?.name,
      last_message_at: new Date().toISOString(),
      message_count: messages.length
    };

    await saveConversationMutation.mutateAsync(conversationData);
  };

  const handleLoadConversation = (conversation) => {
    setMessages(conversation.messages || []);
    setSelectedDataSource(conversation.data_source_id);
    setCurrentConversationId(conversation.id);
    setSuggestedQuestions([]);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSuggestedQuestions([]);
    if (selectedDataSource) {
      generateSuggestedQuestions();
    }
  };

  const generateSuggestedQuestions = async () => {
    if (!selectedDataSource) return;
    
    setIsGeneratingQuestions(true);
    try {
      const dataSource = dataSources.find(ds => ds.id === selectedDataSource);
      const prompt = `Based on this dataset, generate 6 interesting and diverse questions that would provide valuable insights:

Data Source: ${dataSource.name}
Sample Data: ${JSON.stringify(dataSource.data?.slice(0, 20) || [])}

Generate questions that cover different aspects like trends, comparisons, patterns, predictions, anomalies, and summaries.

Format as JSON:
{
  "questions": ["question1", "question2", "question3", "question4", "question5", "question6"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSuggestedQuestions(response.questions || []);
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleQuestionClick = async (question, index) => {
    // Remove the question immediately from state
    setSuggestedQuestions(prev => prev.filter((_, i) => i !== index));
    
    // Send the message
    await handleSendMessage({ text: question });
  };

  const handleSendMessage = async ({ text }) => {
    if (!text.trim() || !selectedDataSource) return;

    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const dataSource = dataSources.find(ds => ds.id === selectedDataSource);
      
      const prompt = `You are a data analyst assistant. Analyze the following data and answer the user's question.

Data Source: ${dataSource.name}
Data Sample: ${JSON.stringify(dataSource.data?.slice(0, 50) || [])}

User Question: ${text}

Provide:
1. A clear answer to their question
2. Key insights from the data
3. If appropriate, suggest a chart visualization with configuration

Format your response as JSON:
{
  "answer": "Your detailed answer",
  "insights": ["insight 1", "insight 2"],
  "chart": {
    "type": "line|bar|pie|area|none",
    "title": "Chart title",
    "description": "What this chart shows",
    "config": {
      // ECharts configuration object (if chart is needed)
      // Must be valid ECharts option format
    }
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            insights: { type: "array", items: { type: "string" } },
            chart: {
              type: "object",
              properties: {
                type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                config: { type: "object" }
              }
            }
          }
        }
      });

      const aiMessage = {
        role: "assistant",
        content: response.answer,
        insights: response.insights,
        chart: response.chart,
        query: text,
        dataSourceId: selectedDataSource
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error analyzing your data. Please try again.",
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInsight = async (message) => {
    try {
      await createInsightMutation.mutateAsync({
        title: message.chart.title,
        description: message.chart.description,
        chart_type: message.chart.type,
        chart_config: message.chart.config,
        data_source_id: message.dataSourceId,
        query: message.query,
        pinned_to_dashboard: true
      });
      alert("Insight pinned to dashboard!");
    } catch (error) {
      console.error("Error pinning insight:", error);
      alert("Failed to pin insight");
    }
  };

  return (
    <div className="fixed inset-0 flex pt-[72px] md:pt-[144px]">
      {/* Suggested Questions Sidebar - 25% */}
      {suggestedQuestions.length > 0 && (
        <div className="hidden lg:block w-1/4 border-r border-border overflow-y-auto p-4">
          <div className="pb-3 mb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm font-semibold">Suggested Questions</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click to ask</p>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {suggestedQuestions.map((question, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  onClick={() => handleQuestionClick(question, idx)}
                  className="text-xs p-3 rounded-lg glass-effect transition-all cursor-pointer border border-transparent hover:border-primary/30 hover:bg-[#6366F1] hover:text-white"
                >
                  {question}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Chat Interface - 70% */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ width: suggestedQuestions.length > 0 ? '70%' : '100%' }}>
        <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-4 md:p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold gradient-text">AI Data Analyst</h1>
                    <p className="text-sm text-muted-foreground">Ask questions and get instant insights</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="gap-2">
                    <History className="w-4 h-4" />
                    <span className="hidden md:inline">History</span>
                  </Button>
                  {messages.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleNewChat} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden md:inline">New Chat</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Data Source Selector */}
              <div className="flex items-center gap-3 mt-4">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Data:</span>
                <Select value={selectedDataSource} onValueChange={(val) => {
                  setSelectedDataSource(val);
                  handleNewChat();
                }}>
                  <SelectTrigger className="w-48 h-8 text-sm">
                    <SelectValue placeholder="Select data" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map(ds => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {dataSources.length === 0 && (
                  <span className="text-xs text-muted-foreground">No data sources</span>
                )}
              </div>
            </motion.div>

            {/* Mobile Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <div className="lg:hidden glass-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-sm font-semibold">Suggested Questions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <AnimatePresence>
                    {suggestedQuestions.map((question, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        onClick={() => handleQuestionClick(question, idx)}
                        disabled={isLoading}
                        className="text-left text-xs p-3 rounded-lg glass-effect hover:bg-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-primary/30"
                      >
                        {question}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-4 md:p-6"
            >
              <div className="space-y-4 min-h-[300px]">
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <Bot className="w-12 h-12 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {isGeneratingQuestions ? "Generating questions..." : "Click a suggested question or type your own"}
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                          <div className={`rounded-xl p-3 text-sm ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
                              : 'glass-effect'
                          }`}>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            
                            {message.insights && message.insights.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Key Insights:
                                </p>
                                <ul className="space-y-1 pl-4">
                                  {message.insights.map((insight, i) => (
                                    <li key={i} className="text-xs list-disc">{insight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {message.chart && message.chart.type !== 'none' && message.chart.config && (
                              <div className="mt-3 bg-white dark:bg-slate-900 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-xs font-semibold text-foreground">{message.chart.title}</h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePinInsight(message)}
                                    className="gap-1 h-6 text-xs px-2"
                                  >
                                    <Pin className="w-3 h-3" />
                                    Pin
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{message.chart.description}</p>
                                <EChartsWrapper 
                                  option={message.chart.config}
                                  style={{ width: '100%', height: '220px' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {message.role === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass-effect rounded-xl p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Fixed Chat Input */}
        <div className="sticky bottom-16 md:bottom-0 bg-background/95 backdrop-blur-xl border-t border-border p-3 md:p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInputWidget
              ref={chatInputRef}
              onSendMessage={handleSendMessage}
              inputText={inputText}
              setInputText={setInputText}
              disabled={isLoading || !selectedDataSource}
            />
          </div>
        </div>
      </div>

      {/* Chat History Panel */}
      <AnimatePresence>
        {showHistory && (
          <ChatHistoryPanel
            onLoadConversation={handleLoadConversation}
            onClose={() => setShowHistory(false)}
            currentDataSourceId={selectedDataSource}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
