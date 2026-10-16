import React, { useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { apiClient } from '../../api/client';
import {
  Download,
  FileText,
  Trash2,
  AlertTriangle,
  X,
  FileCheck,
  ShieldAlert,
  Code,
} from 'lucide-react';

export const ExportDialog: React.FC = () => {
  const {
    documentId,
    analyzeData,
    isExportModalOpen,
    setExportModalOpen,
    deleteActiveDocument,
    purgeAllData,
    addToast,
  } = useLexClearStore();

  const [isExporting, setIsExporting] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  if (!isExportModalOpen || !analyzeData) return null;

  const handleDownload = async (format: 'docx' | 'pdf', mode: 'clean' | 'tracked_changes') => {
    setIsExporting(true);
    try {
      const blob = await apiClient.exportDocument(documentId || 'lexclear_doc', format, mode);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lexclear_${documentId}_${mode}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast(`Downloaded ${format.toUpperCase()} (${mode})`, 'success');
    } catch {
      addToast('Export download error', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleJsonExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analyzeData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `lexclear_${documentId}_audit.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('Downloaded JSON analysis report', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-900 hairline-card max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">
                Download or delete
              </h3>
              <p className="text-xs text-surface-500">
                Take a copy with you, or remove it from this machine
              </p>
            </div>
          </div>

          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options Cards */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider block">
            Downloads
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Clean DOCX */}
            <button
              onClick={() => handleDownload('docx', 'clean')}
              disabled={isExporting}
              className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-850 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-mono text-surface-400">.DOCX</span>
              </div>
              <div className="font-bold text-xs text-surface-900 dark:text-white group-hover:text-primary-600">
                Clean Agreement
              </div>
              <p className="text-[11px] text-surface-500 leading-snug">
                Finalized text with accepted redlines incorporated.
              </p>
            </button>

            {/* Tracked Changes DOCX */}
            <button
              onClick={() => handleDownload('docx', 'tracked_changes')}
              disabled={isExporting}
              className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-850 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-[10px] font-mono text-surface-400">.DOCX</span>
              </div>
              <div className="font-bold text-xs text-surface-900 dark:text-white group-hover:text-primary-600">
                Tracked Changes
              </div>
              <p className="text-[11px] text-surface-500 leading-snug">
                Word redline markup for counterparty negotiation.
              </p>
            </button>

            {/* Formatted PDF */}
            <button
              onClick={() => handleDownload('pdf', 'clean')}
              disabled={isExporting}
              className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-850 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-mono text-surface-400">.PDF</span>
              </div>
              <div className="font-bold text-xs text-surface-900 dark:text-white group-hover:text-primary-600">
                Audit Certificate
              </div>
              <p className="text-[11px] text-surface-500 leading-snug">
                PDF copy of the scored agreement.
              </p>
            </button>

            {/* Raw JSON */}
            <button
              onClick={handleJsonExport}
              disabled={isExporting}
              className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-850 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <Code className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-mono text-surface-400">.JSON</span>
              </div>
              <div className="font-bold text-xs text-surface-900 dark:text-white group-hover:text-primary-600">
                JSON report
              </div>
              <p className="text-[11px] text-surface-500 leading-snug">
                Raw analysis for anyone who wants the numbers.
              </p>
            </button>
          </div>
        </div>

        {/* Privacy & GDPR Data Erasure */}
        <div className="pt-3 border-t border-surface-200 dark:border-surface-800 space-y-3">
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
            Privacy on this machine
          </span>

          {!showPurgeConfirm ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await deleteActiveDocument();
                  setExportModalOpen(false);
                }}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
              >
                Delete This Document
              </Button>

              <button
                onClick={() => setShowPurgeConfirm(true)}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Purge All Records
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-2">
              <div className="text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm database purge?</span>
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-400">
                This will delete all analyzed contracts and scores from the local SQLite database.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    await purgeAllData();
                    setShowPurgeConfirm(false);
                    setExportModalOpen(false);
                  }}
                >
                  Confirm Purge
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPurgeConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
