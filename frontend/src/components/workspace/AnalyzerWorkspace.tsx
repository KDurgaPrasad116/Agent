import React from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { DocumentIntake } from './DocumentIntake';
import { DocumentReader } from './DocumentReader';
import { ClauseSidebar } from './ClauseSidebar';
import { ScorePanel } from './ScorePanel';
import { LaymanExplainer } from './LaymanExplainer';
import { RedlineStudio } from './RedlineStudio';
import { LegalChatDrawer } from './LegalChatDrawer';
import { ExportDialog } from './ExportDialog';
import { Button } from '../ui/Button';
import { Badge, RiskBadge } from '../ui/Badge';
import {
  FileText,
  Download,
  Bot,
  Layers,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Scale,
} from 'lucide-react';

export const AnalyzerWorkspace: React.FC = () => {
  const {
    analyzeData,
    fileName,
    clearDocument,
    workspaceTab,
    setWorkspaceTab,
    corrections,
    isChatOpen,
    setChatOpen,
    setExportModalOpen,
  } = useLexClearStore();

  // If no document is active, display the Intake dropzone and presets
  if (!analyzeData) {
    return <DocumentIntake />;
  }

  const acceptedCorrectionsCount = Object.values(corrections).filter(
    (c) => c.status === 'accepted' || c.status === 'modified'
  ).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Workspace Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-200 dark:border-surface-800">
        {/* Left: Document details & navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDocument}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            New Document
          </Button>

          <div className="h-4 w-px bg-surface-200 dark:border-surface-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-500 shrink-0" />
            <span className="font-heading font-bold text-sm text-surface-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
              {fileName || analyzeData.document_id}
            </span>
            <RiskBadge scoreOrBand={analyzeData.overall_score} showScore />
          </div>
        </div>

        {/* Right: Actions (Export, AI Chatbot toggle) */}
        <div className="flex items-center gap-2">
          <Button
            variant={workspaceTab === 'chat' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setWorkspaceTab(workspaceTab === 'chat' ? 'score' : 'chat')}
            leftIcon={<Bot className="w-3.5 h-3.5" />}
          >
            AI Assistant
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExportModalOpen(true)}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* 3-PANE WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANE 1: LEFT CLAUSE OUTLINE (3 Cols) */}
        <div className="lg:col-span-3">
          <ClauseSidebar />
        </div>

        {/* PANE 2: CENTER SERIF PAPER DOCUMENT CANVAS (5 Cols) */}
        <div className="lg:col-span-5">
          <DocumentReader />
        </div>

        {/* PANE 3: RIGHT TABBED AUDIT & CORRECTION PANEL (4 Cols) */}
        <div className="lg:col-span-4 hairline-card p-5 space-y-5 max-h-[820px] overflow-y-auto bg-white dark:bg-surface-900 shadow-subtle">
          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-surface-100 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs font-semibold">
            <button
              onClick={() => setWorkspaceTab('score')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                workspaceTab === 'score'
                  ? 'bg-white dark:bg-surface-850 text-surface-900 dark:text-white shadow-sm font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              5 Pillars
            </button>

            <button
              onClick={() => setWorkspaceTab('explain')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                workspaceTab === 'explain'
                  ? 'bg-white dark:bg-surface-850 text-surface-900 dark:text-white shadow-sm font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              Layman Mode
            </button>

            <button
              onClick={() => setWorkspaceTab('changes')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                workspaceTab === 'changes'
                  ? 'bg-white dark:bg-surface-850 text-surface-900 dark:text-white shadow-sm font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              Redlines ({acceptedCorrectionsCount})
            </button>

            <button
              onClick={() => setWorkspaceTab('chat')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                workspaceTab === 'chat'
                  ? 'bg-white dark:bg-surface-850 text-surface-900 dark:text-white shadow-sm font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              Chat
            </button>
          </div>

          {/* Active Tab Panel */}
          {workspaceTab === 'score' && <ScorePanel />}
          {workspaceTab === 'explain' && <LaymanExplainer />}
          {workspaceTab === 'changes' && <RedlineStudio />}
          {workspaceTab === 'chat' && <LegalChatDrawer />}
        </div>
      </div>

      {/* Export & Data Sovereignty Dialog Modal */}
      <ExportDialog />
    </div>
  );
};
