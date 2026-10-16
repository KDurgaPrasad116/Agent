import React, { useEffect } from 'react';
import { useLexClearStore } from './store/useLexClearStore';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { AnalyzerWorkspace } from './components/workspace/AnalyzerWorkspace';
import { DocumentGeneratorWizard } from './components/generator/DocumentGeneratorWizard';
import { SystemDesignLearningCenter } from './components/education/SystemDesignLearningCenter';
import { ToastContainer } from './components/common/Toast';

export function App() {
  const { activeView, isDark } = useLexClearStore();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
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

      <ToastContainer />

      <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 py-6 text-center text-xs text-surface-500 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-heading font-semibold text-surface-800 dark:text-white">LexClear</span>
          <span>Built to read contracts on your machine. Not a law firm.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
