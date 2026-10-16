import React, { useEffect, useState } from 'react';
import { useLexClearStore, type ActiveNavView } from '../../store/useLexClearStore';
import { Scale, Moon, Sun, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isDark,
    toggleTheme,
    backendStatus,
    checkBackendStatus,
    platform,
    samples,
    loadSampleContract,
    isLoading,
  } = useLexClearStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 20000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  const navItems: { id: ActiveNavView; label: string }[] = [
    { id: 'landing', label: 'Home' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'generator', label: 'Draft' },
    { id: 'methodology', label: 'How scoring works' },
  ];

  const go = (id: ActiveNavView) => {
    setActiveView(id);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
      <div className="bg-surface-900 text-surface-300 py-1.5 px-4 text-center text-[11px]">
        {platform.disclaimer}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go('landing')} className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
            <Scale className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-heading font-bold text-lg tracking-tight text-surface-900 dark:text-white leading-none">
              LexClear
            </div>
            <span className="text-[11px] text-surface-500">Contract reader</span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1 bg-surface-100 dark:bg-surface-950 p-1 rounded-xl text-xs font-semibold border border-surface-200 dark:border-surface-800">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white dark:bg-surface-850 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-surface-500 pr-1">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{backendStatus === 'online' ? 'Server connected' : 'Server offline'}</span>
          </div>

          {samples[0] && (
            <button
              type="button"
              disabled={isLoading || backendStatus !== 'online'}
              onClick={() => loadSampleContract(samples[0].id)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold disabled:opacity-50"
            >
              Open a sample
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-800"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            className="md:hidden p-2 rounded-xl border border-surface-200 dark:border-surface-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-surface-200 dark:border-surface-800 px-4 py-3 space-y-1 bg-white dark:bg-surface-900">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
