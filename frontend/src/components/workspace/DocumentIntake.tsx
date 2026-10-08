import React, { useState, useRef } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge, RiskBadge } from '../ui/Badge';
import { SAMPLE_CONTRACTS } from '../../mocks/contracts';
import {
  Upload,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCode,
  Languages,
} from 'lucide-react';

export const DocumentIntake: React.FC = () => {
  const {
    loadPresetContract,
    uploadAndAnalyzeText,
    uploadAndAnalyzeFile,
    isLoading,
  } = useLexClearStore();

  const [pasteInput, setPasteInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadAndAnalyzeFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadAndAnalyzeFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* Header title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span>Explainable Legal Intelligence Intake</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
          Upload or select an agreement to audit
        </h2>
        <p className="text-sm text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
          Deterministic 5-criteria statutory analysis, plain-English layman explanations, and surgical redline diffs.
        </p>
      </div>

      {/* Main Ingest Area: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Dropzone Column (7 Cols) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-7 hairline-card p-8 sm:p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed ${
            isDragging
              ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20 scale-[0.99]'
              : 'border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900/60 hover:border-primary-400 hover:bg-surface-50 dark:hover:bg-surface-850'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 mb-4 shadow-subtle">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">
            Drag and drop contract file here
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-xs">
            Supports <strong>PDF</strong>, <strong>DOCX</strong>, and <strong>TXT</strong> (up to 15MB). Automated offset segmentation.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </Button>
            <span className="text-xs text-surface-400 font-medium">or select a preset below</span>
          </div>

          <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800 flex items-center gap-4 text-[11px] text-surface-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Isolated SQLite
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> SHA-256 Verified
            </span>
          </div>
        </div>

        {/* Text Paste Column (5 Cols) */}
        <div className="md:col-span-5 hairline-card p-6 bg-white dark:bg-surface-900/60 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-primary-500" /> Paste Contract Text
              </span>
              <span className="text-[11px] font-mono text-surface-400">
                {pasteInput.length} chars
              </span>
            </div>
            <p className="text-xs text-surface-500">
              Directly audit clauses, emails, or contract snippets without uploading a file.
            </p>
          </div>

          <textarea
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            placeholder="Paste your legal clauses here... e.g. 'The Client reserves unilateral right to terminate at any time...'"
            rows={7}
            className="w-full p-3.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />

          <Button
            variant="primary"
            size="sm"
            disabled={!pasteInput.trim() || isLoading}
            loading={isLoading}
            className="w-full"
            onClick={() => uploadAndAnalyzeText(pasteInput)}
          >
            Audit Pasted Clauses
          </Button>
        </div>
      </div>

      {/* Preset Benchmark Contract Showcase */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">
              Pre-Audited Benchmark Contracts
            </h3>
            <p className="text-xs text-surface-500">
              Instant 1-click test datasets with pre-computed statutory risk ledgers and redlines.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_CONTRACTS.map((contract) => {
            const isHighRisk = contract.initialScore < 60;
            const isCritical = contract.initialScore < 30;

            return (
              <div
                key={contract.id}
                onClick={() => loadPresetContract(contract.id)}
                className="hairline-card p-5 bg-white dark:bg-surface-900/70 hover:border-primary-500 hover:shadow-subtle cursor-pointer transition-all space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-bold uppercase">
                      {contract.category}
                    </span>
                    <RiskBadge scoreOrBand={contract.initialScore} showScore />
                  </div>

                  <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {contract.title}
                  </h4>

                  <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
                    {contract.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Load Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
