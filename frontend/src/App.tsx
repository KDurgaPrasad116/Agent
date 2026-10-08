import React, { useEffect } from 'react';
import { useLexClearStore } from './store/useLexClearStore';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { AnalyzerWorkspace } from './components/workspace/AnalyzerWorkspace';
import { DocumentGeneratorWizard } from './components/generator/DocumentGeneratorWizard';
import { SystemDesignLearningCenter } from './components/education/SystemDesignLearningCenter';
import { ToastContainer } from './components/common/Toast';
import { ShieldCheck, Cpu, CheckCircle2 } from 'lucide-react';

export function App() {
  const { activeView, isDark } = useLexClearStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col font-sans transition-colors selection:bg-primary-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'workspace' && <AnalyzerWorkspace />}
        {activeView === 'generator' && <DocumentGeneratorWizard />}
        {activeView === 'methodology' && <SystemDesignLearningCenter />}
      </main>

      {/* Global Toast Notification Portal */}
      <ToastContainer />

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 py-8 text-center text-xs text-surface-500 dark:text-surface-400 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-surface-900 dark:text-white tracking-tight">
              LexClear
            </span>
            <span>•</span>
            <span>Explainable Legal Intelligence Platform</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-surface-500 dark:text-surface-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local SQLite Isolated
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-primary-500" /> Deterministic Statutory Engine
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> Zero Cloud Telemetry
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
