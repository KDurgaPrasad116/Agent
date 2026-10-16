import React, { useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Badge, RiskBadge } from '../ui/Badge';
import { Search, Filter, ShieldAlert, CheckCircle, FileDiff } from 'lucide-react';

export const ClauseSidebar: React.FC = () => {
  const {
    analyzeData,
    selectedClauseId,
    setSelectedClauseId,
    corrections,
    setWorkspaceTab,
  } = useLexClearStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'risk' | 'diffs'>('all');

  if (!analyzeData) return null;

  const filteredClauses = analyzeData.clauses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterRisk === 'risk') return c.risk_level === 'DANGER' || c.risk_level === 'WARNING';
    if (filterRisk === 'diffs') return !!corrections[c.id];
    return true;
  });

  const dangerCount = analyzeData.clauses.filter((c) => c.risk_level === 'DANGER').length;
  const warnCount = analyzeData.clauses.filter((c) => c.risk_level === 'WARNING').length;
  const diffsCount = Object.keys(corrections).length;

  return (
    <div className="hairline-card p-4 space-y-4 max-h-[820px] overflow-y-auto flex flex-col bg-white dark:bg-surface-900">
      {/* Header & Search */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider">
            Clauses ({analyzeData.clauses.length})
          </span>
          <span className="text-[11px] font-mono text-surface-400">
            {dangerCount + warnCount} flagged
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search clause terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-surface-900 dark:text-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">
          <button
            onClick={() => setFilterRisk('all')}
            className={`py-1 rounded-md transition-colors text-center ${
              filterRisk === 'all'
                ? 'bg-surface-200 dark:bg-surface-800 text-surface-900 dark:text-white font-bold'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            All ({analyzeData.clauses.length})
          </button>
          <button
            onClick={() => setFilterRisk('risk')}
            className={`py-1 rounded-md transition-colors text-center ${
              filterRisk === 'risk'
                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold'
                : 'text-surface-500 hover:text-red-600'
            }`}
          >
            Risky ({dangerCount + warnCount})
          </button>
          <button
            onClick={() => setFilterRisk('diffs')}
            className={`py-1 rounded-md transition-colors text-center ${
              filterRisk === 'diffs'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-surface-500 hover:text-emerald-600'
            }`}
          >
            Diffs ({diffsCount})
          </button>
        </div>
      </div>

      {/* Clause Items List */}
      <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
        {filteredClauses.map((clause) => {
          const isSelected = selectedClauseId === clause.id;
          const isDanger = clause.risk_level === 'DANGER';
          const isWarn = clause.risk_level === 'WARNING';
          const hasDiff = !!corrections[clause.id];

          const dotColor = isDanger
            ? 'bg-red-500'
            : isWarn
            ? 'bg-amber-500'
            : 'bg-emerald-500';

          return (
            <button
              key={clause.id}
              onClick={() => {
                setSelectedClauseId(clause.id);
                setWorkspaceTab('explain');
                const el = document.getElementById(`clause-block-${clause.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-1 border ${
                isSelected
                  ? 'bg-primary-50/90 dark:bg-primary-950/50 border-primary-500 text-primary-900 dark:text-primary-100 font-semibold shadow-sm ring-1 ring-primary-500/30'
                  : 'border-transparent hover:bg-surface-100 dark:hover:bg-surface-850 text-surface-700 dark:text-surface-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                  <span className="font-bold text-[11px] truncate">
                    #{clause.index} {clause.title}
                  </span>
                </div>
                <RiskBadge scoreOrBand={clause.risk_level} />
              </div>

              {hasDiff && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 pl-3.5">
                  <FileDiff className="w-3 h-3" />
                  <span>Rewrite waiting</span>
                </div>
              )}
            </button>
          );
        })}

        {filteredClauses.length === 0 && (
          <div className="text-center py-8 text-xs text-surface-400">
            No clauses match the current filter.
          </div>
        )}
      </div>
    </div>
  );
};
