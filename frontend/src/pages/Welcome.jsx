import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Database,
  Calendar,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "AI-Powered Data Analysis",
  "Real-time Insights & Predictions",
  "Automated Report Generation",
  "Schedule Analytics Workflows",
  "Beautiful Visualizations",
  "Export to Multiple Formats",
  "Secure & Private",
  "Cross-Platform Support"
];

export default function Welcome() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">DataMind AI</h1>
              <p className="text-sm text-purple-200">Analytics Platform</p>
            </div>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-block"
                  >
                    <span className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-sm font-medium">
                      ✨ Powered by AI
                    </span>
                  </motion.div>
                  
                  <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                    Transform Data
                    <br />
                    Into
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {" "}Insights
                    </span>
                  </h2>
                  
                  <div className="h-8">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentFeature}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-xl text-purple-200"
                      >
                        {features[currentFeature]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/50 group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-500/50 text-white hover:bg-purple-500/10"
                  >
                    Learn More
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div>
                    <div className="text-3xl font-bold text-purple-400">10x</div>
                    <div className="text-sm text-purple-200">Faster Analysis</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400">95%</div>
                    <div className="text-sm text-purple-200">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-400">24/7</div>
                    <div className="text-sm text-purple-200">Automation</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Feature Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { icon: Sparkles, title: "AI Analysis", color: "purple" },
                  { icon: TrendingUp, title: "Predictions", color: "blue" },
                  { icon: Database, title: "Data Sources", color: "emerald" },
                  { icon: Calendar, title: "Scheduling", color: "orange" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                    </div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer Features */}
        <footer className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-purple-200"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Multiple Data Sources</span>
            </div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
}