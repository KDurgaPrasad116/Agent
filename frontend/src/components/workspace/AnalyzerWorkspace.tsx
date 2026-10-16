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
import { RiskBadge } from '../ui/Badge';
import { FileText, Download, ArrowLeft } from 'lucide-react';

export const AnalyzerWorkspace: React.FC = () => {
  const {
    analyzeData,
    fileName,
    clearDocument,
    workspaceTab,
    setWorkspaceTab,
    corrections,
    setExportModalOpen,
    isLoading,
  } = useLexClearStore();

  if (!analyzeData) {
    return <DocumentIntake />;
  }

  const acceptedCorrectionsCount = Object.values(corrections).filter(
    (c) => c.status === 'accepted' || c.status === 'modified'
  ).length;

  const tabs: { id: typeof workspaceTab; label: string }[] = [
    { id: 'score', label: 'Score' },
    { id: 'explain', label: 'Plain English' },
    { id: 'changes', label: `Edits (${acceptedCorrectionsCount})` },
    { id: 'chat', label: 'Ask' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {isLoading && (
        <div className="text-xs text-primary-600 font-medium">Working on the file…</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={clearDocument} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            New file
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-primary-500 shrink-0" />
            <span className="font-heading font-semibold text-sm truncate max-w-[220px]">
              {fileName || analyzeData.document_id}
            </span>
            <RiskBadge scoreOrBand={analyzeData.overall_score} showScore />
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setExportModalOpen(true)}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3">
          <ClauseSidebar />
        </div>
        <div className="lg:col-span-5">
          <DocumentReader />
        </div>
        <div className="lg:col-span-4 hairline-card p-5 space-y-5 max-h-[820px] overflow-y-auto bg-white dark:bg-surface-900">
          <div className="flex p-1 rounded-xl bg-surface-100 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs font-semibold">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setWorkspaceTab(tab.id)}
                className={`flex-1 py-1.5 rounded-lg ${
                  workspaceTab === tab.id
                    ? 'bg-white dark:bg-surface-850 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {workspaceTab === 'score' && <ScorePanel />}
          {workspaceTab === 'explain' && <LaymanExplainer />}
          {workspaceTab === 'changes' && <RedlineStudio />}
          {workspaceTab === 'chat' && <LegalChatDrawer />}
        </div>
      </div>
      <ExportDialog />
    </div>
  );
};
