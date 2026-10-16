import React, { useState, useRef } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Upload, FileCode, ArrowRight } from 'lucide-react';

export const DocumentIntake: React.FC = () => {
  const {
    loadSampleContract,
    uploadAndAnalyzeText,
    uploadAndAnalyzeFile,
    isLoading,
    samples,
    platform,
    backendStatus,
    error,
  } = useLexClearStore();

  const [pasteInput, setPasteInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = platform.accepted_uploads.map((ext) => `.${ext}`).join(',');

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
          Open a contract
        </h2>
        <p className="text-sm text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
          Upload {platform.accepted_uploads.map((e) => e.toUpperCase()).join(', ')} (up to{' '}
          {platform.max_upload_mb} MB), paste text, or use a sample from disk.
        </p>
        {backendStatus === 'offline' && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Server is offline. Scoring won’t run until the API is up.
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files[0]) await uploadAndAnalyzeFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-7 hairline-card p-8 text-center flex flex-col items-center justify-center cursor-pointer border-2 border-dashed ${
            isDragging
              ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20'
              : 'border-surface-300 dark:border-surface-700'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={async (e) => {
              if (e.target.files?.[0]) await uploadAndAnalyzeFile(e.target.files[0]);
            }}
            accept={accept}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-surface-900 dark:text-white">
            Drop a file here
          </h3>
          <p className="text-xs text-surface-500 mt-1">or browse from your computer</p>
          <div className="mt-5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              loading={isLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse
            </Button>
          </div>
        </div>

        <div className="md:col-span-5 hairline-card p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-primary-500" /> Paste text
            </span>
            <span className="text-[11px] font-mono text-surface-400">{pasteInput.length} chars</span>
          </div>
          <textarea
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            placeholder="Paste a clause or a full agreement…"
            rows={8}
            className="w-full p-3 rounded-xl text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <Button
            variant="primary"
            size="sm"
            disabled={!pasteInput.trim() || isLoading}
            loading={isLoading}
            className="w-full"
            onClick={() => uploadAndAnalyzeText(pasteInput)}
          >
            Score this text
          </Button>
        </div>
      </div>

      {samples.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-semibold text-surface-900 dark:text-white">Samples</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {samples.map((contract) => (
              <button
                key={contract.id}
                type="button"
                disabled={isLoading || backendStatus !== 'online'}
                onClick={() => loadSampleContract(contract.id)}
                className="hairline-card p-5 text-left space-y-2 hover:border-primary-500 disabled:opacity-60"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="neutral">{contract.category}</Badge>
                  <span className="text-[10px] uppercase text-surface-400">{contract.file_type}</span>
                </div>
                <h4 className="font-heading font-semibold text-sm">{contract.title}</h4>
                <p className="text-xs text-surface-500 line-clamp-2">{contract.description}</p>
                <span className="text-xs font-semibold text-primary-600 inline-flex items-center gap-1">
                  Load <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
