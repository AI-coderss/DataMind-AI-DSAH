import React from "react";
import { createPageUrl } from "@/utils";
import { BarChart3 } from "lucide-react";
import AppNav from "./components/navigation/AppNav";
import ThemeToggle from "./components/navigation/ThemeToggle";

export default function Layout({ children, currentPageName }) {
  // Don't show layout on Welcome or Home page
  if (currentPageName === "Welcome" || currentPageName === "Home") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-blue-950">
      {/* Header - Fixed at top on desktop */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold gradient-text">DataMind AI</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Business Intelligence</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Desktop Navigation - Fixed below header */}
      <div className="hidden md:block fixed top-[72px] left-0 right-0 z-[90]">
        <AppNav />
      </div>

      {/* Page Content - Add top padding for fixed header + nav */}
      <main className="flex-1 pb-20 md:pb-6 pt-[72px] md:pt-[144px]">
        {children}
      </main>

      {/* Mobile Navigation - Only on mobile */}
      <div className="md:hidden">
        <AppNav />
      </div>
    </div>
  );
}