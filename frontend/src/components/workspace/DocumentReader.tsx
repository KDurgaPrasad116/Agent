import React, { useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { RiskBadge } from '../ui/Badge';
import {
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const DocumentReader: React.FC = () => {
  const {
    analyzeData,
    fileName,
    selectedClauseId,
    setSelectedClauseId,
    setWorkspaceTab,
    addToast,
  } = useLexClearStore();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  if (!analyzeData) return null;

  const handleCopy = () => {
    const fullText = analyzeData.clauses.map((c) => `${c.title}\n${c.text}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    addToast('Document text copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <FileText className="w-3.5 h-3.5 text-primary-500" />
          <span className="font-medium font-sans">
            {analyzeData.clauses.length} sections
          </span>
        </div>

        {/* Zoom & Utility Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-100 dark:bg-surface-900 rounded-lg p-0.5 border border-surface-200 dark:border-surface-800 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-1 hover:text-primary-600 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-surface-600 dark:text-surface-400">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 hover:text-primary-600 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-300 hover:text-primary-600 transition-colors text-xs flex items-center gap-1"
            title="Copy document text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Scrollable Serif Document Canvas */}
      <div className="overflow-y-auto max-h-[820px] pr-2 pb-8 flex justify-center">
        <div
          className="document-paper p-8 sm:p-12 rounded-2xl w-full space-y-6 shadow-floating bg-white dark:bg-surface-900"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Document Header Stamp */}
          <div className="border-b border-surface-200 dark:border-surface-800 pb-5 text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary-600 dark:text-primary-400 font-bold px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800">
              Working copy
            </div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-surface-900 dark:text-white pt-1">
              {(fileName ? fileName.replace(/\.[^/.]+$/, '') : (analyzeData.global_summary?.purpose?.slice(0, 40) || 'Legal Agreement')).toUpperCase()}
            </h1>
            <p className="text-xs text-surface-400 font-sans">
              Click a section to read it in plain English
            </p>
          </div>

          {/* Interactive Clause Blocks */}
          <div className="space-y-5">
            {analyzeData.clauses.map((clause) => {
              const isSelected = selectedClauseId === clause.id;
              const isDanger = clause.risk_level === 'DANGER';
              const isWarn = clause.risk_level === 'WARNING';

              const borderClass = isDanger
                ? 'border-l-4 border-l-red-500 bg-red-50/20 dark:bg-red-950/10'
                : isWarn
                ? 'border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
                : 'border-l-4 border-l-emerald-500 bg-surface-50/40 dark:bg-surface-950/20';

              const activeRing = isSelected
                ? 'ring-2 ring-primary-500/80 shadow-md bg-primary-50/30 dark:bg-primary-950/30'
                : 'hover:bg-surface-100/60 dark:hover:bg-surface-850/60';

              return (
                <div
                  key={clause.id}
                  id={`clause-block-${clause.id}`}
                  onClick={() => {
                    setSelectedClauseId(clause.id);
                    setWorkspaceTab('explain');
                  }}
                  className={`p-4 sm:p-5 rounded-xl cursor-pointer transition-all ${borderClass} ${activeRing}`}
                >
                  {/* Clause Head */}
                  <div className="flex items-center justify-between pb-2 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-surface-400">
                        #{clause.index}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-surface-900 dark:text-white">
                        {clause.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-surface-400 hidden sm:inline">
                        {clause.clause_type}
                      </span>
                      <RiskBadge scoreOrBand={clause.risk_level} />
                    </div>
                  </div>

                  {/* Clause Body Text */}
                  <p className="font-serif text-sm sm:text-base leading-relaxed text-surface-800 dark:text-surface-200">
                    {clause.text}
                  </p>

                  {/* Flagged issues hint pill */}
                  {clause.flagged_issues && clause.flagged_issues.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-surface-200/60 dark:border-surface-800/60 flex items-center gap-2 text-[11px] text-red-600 dark:text-red-400 font-sans font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{clause.flagged_issues[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* End of Document Stamp */}
          <div className="text-center pt-8 border-t border-surface-200 dark:border-surface-800 text-[11px] font-mono text-surface-400 space-y-1">
            <div>— End of file —</div>
          </div>
        </div>
      </div>
    </div>
  );
};
