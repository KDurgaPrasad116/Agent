import React, { useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge, RiskBadge } from '../ui/Badge';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileDiff,
  Edit3,
  Sparkles,
  TrendingUp,
  Columns,
  AlignJustify,
  ShieldCheck,
  Scale,
} from 'lucide-react';

export const RedlineStudio: React.FC = () => {
  const {
    analyzeData,
    corrections,
    diffViewMode,
    setDiffViewMode,
    acceptCorrection,
    rejectCorrection,
    modifyCorrection,
    acceptAllCorrections,
    resetCorrections,
    rescoreResult,
  } = useLexClearStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  if (!analyzeData) return null;

  const correctionsList = Object.values(corrections);
  const acceptedCount = correctionsList.filter((c) => c.status === 'accepted' || c.status === 'modified').length;

  const startEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = (clauseId: string) => {
    modifyCorrection(clauseId, editText);
    setEditingId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800 gap-3">
        <div>
          <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white flex items-center gap-2">
            <FileDiff className="w-4 h-4 text-primary-500" />
            <span>Statutory Redline Studio</span>
          </h4>
          <p className="text-xs text-surface-500">
            {acceptedCount} of {correctionsList.length} amendments applied
          </p>
        </div>

        {/* View Toggle & Bulk Actions */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-surface-100 dark:bg-surface-950 p-0.5 rounded-lg border border-surface-200 dark:border-surface-800 text-xs">
            <button
              onClick={() => setDiffViewMode('split')}
              className={`px-2 py-1 rounded flex items-center gap-1 ${
                diffViewMode === 'split'
                  ? 'bg-white dark:bg-surface-850 font-bold text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500'
              }`}
              title="Side-by-side view"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setDiffViewMode('inline')}
              className={`px-2 py-1 rounded flex items-center gap-1 ${
                diffViewMode === 'inline'
                  ? 'bg-white dark:bg-surface-850 font-bold text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500'
              }`}
              title="Inline unified view"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inline</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={acceptAllCorrections}
            disabled={correctionsList.length === 0}
          >
            Accept All
          </Button>

          {acceptedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetCorrections}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Live Re-Score Health Gain Banner */}
      {rescoreResult && (
        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Document Health Healed: +{rescoreResult.delta} Points
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Baseline {rescoreResult.before_score.toFixed(1)} → New Score{' '}
                <strong>{rescoreResult.after_score.toFixed(1)} / 100</strong>
              </div>
            </div>
          </div>
          <RiskBadge scoreOrBand={rescoreResult.after_score} showScore />
        </div>
      )}

      {/* Corrections List */}
      <div className="space-y-4">
        {correctionsList.map((patch) => {
          const isAccepted = patch.status === 'accepted';
          const isRejected = patch.status === 'rejected';
          const isModified = patch.status === 'modified';
          const isEditing = editingId === patch.id;

          return (
            <div
              key={patch.id}
              className={`p-4 rounded-xl hairline-card space-y-3 transition-all ${
                isAccepted || isModified
                  ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : isRejected
                  ? 'border-surface-300 opacity-60'
                  : 'bg-white dark:bg-surface-900'
              }`}
            >
              {/* Clause Title & Status Badge */}
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-surface-900 dark:text-white truncate max-w-[240px]">
                  {patch.clause_title}
                </span>

                <div className="flex items-center gap-2">
                  {patch.legal_doctrine && (
                    <span className="text-[10px] font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded hidden sm:inline">
                      {patch.legal_doctrine}
                    </span>
                  )}
                  {isAccepted ? (
                    <Badge variant="success">Accepted</Badge>
                  ) : isModified ? (
                    <Badge variant="primary">Custom Edit</Badge>
                  ) : isRejected ? (
                    <Badge variant="neutral">Rejected</Badge>
                  ) : (
                    <Badge variant="warning">Suggested</Badge>
                  )}
                </div>
              </div>

              {/* Rationale Quote */}
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed italic">
                "{patch.reason}"
              </p>

              {/* Diff Viewer */}
              {diffViewMode === 'split' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-serif leading-relaxed">
                  {/* Original Clause */}
                  <div className="p-3 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-300 space-y-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                      Original Clause
                    </span>
                    <p className="line-through opacity-80">{patch.original_text}</p>
                  </div>

                  {/* Proposed Redline */}
                  <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 space-y-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Balanced Amendment
                    </span>
                    {isEditing ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full p-2 text-xs font-serif bg-white dark:bg-surface-950 border border-emerald-400 rounded text-surface-900 dark:text-white"
                      />
                    ) : (
                      <p>{patch.revised_text}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Inline Unified View */
                <div className="p-3.5 rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs font-serif leading-relaxed space-y-2">
                  <div className="line-through text-red-700 dark:text-red-400 bg-red-100/50 dark:bg-red-950/40 p-1.5 rounded">
                    {patch.original_text}
                  </div>
                  <div className="text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950/40 p-1.5 rounded">
                    {patch.revised_text}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-200 dark:border-surface-800 text-xs">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isAccepted ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => acceptCorrection(patch.clause_id)}
                  >
                    {isAccepted ? 'Accepted' : 'Accept Redline'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => rejectCorrection(patch.clause_id)}
                  >
                    Reject
                  </Button>
                </div>

                {isEditing ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => saveEdit(patch.clause_id)}
                  >
                    Save Changes
                  </Button>
                ) : (
                  <button
                    onClick={() => startEdit(patch.id, patch.revised_text)}
                    className="text-surface-500 hover:text-primary-600 text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {correctionsList.length === 0 && (
          <div className="text-center py-12 text-surface-400 text-xs">
            No active redlines detected for this document.
          </div>
        )}
      </div>
    </div>
  );
};
