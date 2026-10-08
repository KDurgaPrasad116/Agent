import React, { useEffect } from 'react';
import { useLexClearStore, type ActiveNavView } from '../../store/useLexClearStore';
import {
  Scale,
  Moon,
  Sun,
  FileEdit,
  ShieldCheck,
  Zap,
  Activity,
  Compass,
  Palette,
  Database,
  Cpu,
  Radio,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isDark,
    toggleTheme,
    loadPresetContract,
    useMockMode,
    setUseMockMode,
    backendStatus,
    checkBackendStatus,
  } = useLexClearStore();

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  const navItems: { id: ActiveNavView; label: string; icon: React.ReactNode }[] = [
    { id: 'landing', label: 'Product Tour', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'workspace', label: 'Analyzer Workspace', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'generator', label: 'Contract Generator', icon: <FileEdit className="w-3.5 h-3.5" /> },
    { id: 'methodology', label: 'Architecture & Workflow', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 transition-colors">
      {/* Top Banner: Informational Legal Notice & Backend Health Indicator */}
      <div className="bg-surface-950 text-surface-400 py-1.5 px-4 text-center text-[11px] font-medium flex items-center justify-between border-b border-surface-850">
        <div className="flex items-center gap-2 mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-400 shrink-0" />
          <span>
            <strong className="text-white font-semibold">LEGAL COMPLIANCE NOTICE:</strong> LexClear provides transparent AI contract risk analysis and automated redlining, not formal legal advice.
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {/* Backend Status indicator */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-surface-400">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-amber-500'
              }`}
            />
            <span>{backendStatus === 'online' ? 'FastAPI Online' : 'Offline / Standalone'}</span>
          </div>

          <button
            onClick={() => setUseMockMode(!useMockMode)}
            className="flex items-center gap-1 pl-2 border-l border-surface-800 text-[10px] font-mono hover:text-white transition-colors"
            title="Toggle between local offline mock datasets and live FastAPI backend"
          >
            <Database className="w-3 h-3 text-primary-400" />
            <span>Mode: {useMockMode ? 'Benchmark Mocks' : 'Live Gateway'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-subtle border border-primary-500 group-hover:bg-primary-500 transition-colors">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg tracking-tight text-surface-900 dark:text-white">
                Lex<span className="text-primary-600 dark:text-primary-400">Clear</span>
              </span>
            </div>
            <span className="text-[11px] text-surface-500 font-medium block -mt-0.5">
              Explainable Legal Intelligence Platform
            </span>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-100 dark:bg-surface-950 p-1 rounded-xl text-xs font-semibold border border-surface-200 dark:border-surface-800">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-surface-850 text-primary-700 dark:text-primary-300 shadow-sm border border-surface-200 dark:border-surface-700 font-bold'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadPresetContract('predatory-vendor')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-colors shadow-subtle active:scale-95"
            title="Load the predatory agreement sample audit"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="hidden sm:inline">Audit Sample Doc</span>
            <span className="sm:hidden">Sample</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border border-surface-200 dark:border-surface-800"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-surface-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
