import React from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge, RiskBadge } from '../ui/Badge';
import {
  BookOpen,
  AlertTriangle,
  Languages,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';

export const LaymanExplainer: React.FC = () => {
  const {
    selectedClause,
    clauseExplanation,
    explainLanguage,
    setExplainLanguage,
    setWorkspaceTab,
    isExplaining,
  } = useLexClearStore();

  if (!selectedClause) {
    return (
      <div className="text-center py-12 px-4 space-y-3 text-surface-500">
        <BookOpen className="w-8 h-8 text-surface-400 mx-auto" />
        <h4 className="font-heading font-bold text-sm text-surface-800 dark:text-surface-200">
          No clause selected
        </h4>
        <p className="text-xs max-w-xs mx-auto">
          Click any clause in the document canvas or sidebar to inspect Grade 8 Layman explanation.
        </p>
      </div>
    );
  }

  const regionalText =
    explainLanguage !== 'en' && clauseExplanation?.regional_language_translation
      ? clauseExplanation.regional_language_translation[explainLanguage]
      : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Clause Identifier & Language Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-surface-400">
              #{selectedClause.index}
            </span>
            <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white truncate">
              {selectedClause.title}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-surface-400">
            {selectedClause.clause_type} • Score: {selectedClause.score.toFixed(1)}/100
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-surface-100 dark:bg-surface-950 p-0.5 rounded-lg border border-surface-200 dark:border-surface-800 text-xs shrink-0">
          <button
            onClick={() => setExplainLanguage('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              explainLanguage === 'en'
                ? 'bg-white dark:bg-surface-850 font-bold text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 hover:text-surface-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setExplainLanguage('hi')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              explainLanguage === 'hi'
                ? 'bg-white dark:bg-surface-850 font-bold text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 hover:text-surface-900'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setExplainLanguage('kn')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              explainLanguage === 'kn'
                ? 'bg-white dark:bg-surface-850 font-bold text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 hover:text-surface-900'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>

      {/* Grade 8 Plain English Summary Card */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider block">
          {explainLanguage === 'en'
            ? 'Grade 8 Plain-English Translation'
            : explainLanguage === 'hi'
            ? 'सरल भाषा में अनुवाद'
            : 'ಸರಳ ಭಾಷೆಯ ವಿವರಣೆ'}
        </span>

        <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs sm:text-sm text-surface-800 dark:text-surface-200 leading-relaxed shadow-sm">
          {regionalText || clauseExplanation?.plain_english || selectedClause.text}
        </div>
      </div>

      {/* "What this means for you" Impact Box */}
      {clauseExplanation?.what_this_means_for_you && (
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>What this means for you in real life</span>
          </div>
          <p className="text-xs text-surface-700 dark:text-surface-300 leading-relaxed pl-5">
            {clauseExplanation.what_this_means_for_you}
          </p>
        </div>
      )}

      {/* Legal Jargon Buster */}
      {clauseExplanation?.legal_terms && clauseExplanation.legal_terms.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider block">
            Legal Terms Jargon Buster
          </span>

          <div className="space-y-2">
            {clauseExplanation.legal_terms.map((term, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-surface-50/50 dark:bg-surface-950/50 border border-surface-200 dark:border-surface-800 text-xs space-y-1"
              >
                <div className="font-bold text-primary-600 dark:text-primary-400">
                  {term.term}
                </div>
                <div className="text-surface-600 dark:text-surface-400">
                  {term.definition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions to Ask a Lawyer */}
      {clauseExplanation?.questions_for_lawyer && clauseExplanation.questions_for_lawyer.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-surface-200 dark:border-surface-800">
          <span className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider block">
            Questions for Legal Counsel
          </span>

          <ul className="space-y-2 text-xs text-surface-700 dark:text-surface-300">
            {clauseExplanation.questions_for_lawyer.map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary-500 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Jump to Redlines CTA */}
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={() => setWorkspaceTab('changes')}
        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
      >
        Inspect Balanced Redline
      </Button>
    </div>
  );
};
