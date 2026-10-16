import React, { useState, useEffect, useMemo } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ScoreRing } from '../ui/ScoreRing';
import { apiClient } from '../../api/client';
import type { LegalTemplate, GenerateResponse } from '../../types';
import { FileText, CheckCircle2, ArrowRight, Download, ChevronRight, Eye } from 'lucide-react';

function draftFromTemplate(
  template: LegalTemplate,
  fieldValues: Record<string, unknown>,
  selectedClauseIds: string[]
): string {
  const lines: string[] = [template.name.toUpperCase(), ''];
  for (const field of template.fields) {
    const value = fieldValues[field.key];
    if (value !== undefined && value !== '') {
      lines.push(`${field.label}: ${String(value)}`);
    }
  }
  lines.push('');
  const extras = template.optional_clauses.filter((c) => selectedClauseIds.includes(c.id));
  if (extras.length) {
    lines.push('Additional clauses');
    for (const clause of extras) {
      lines.push('');
      lines.push(clause.title);
      lines.push(clause.text_template);
    }
  }
  const jurisdiction = fieldValues.jurisdiction;
  if (jurisdiction) {
    lines.push('');
    lines.push(`Governing law: ${String(jurisdiction)}`);
  }
  return lines.join('\n');
}

export const DocumentGeneratorWizard: React.FC = () => {
  const { setActiveView, uploadAndAnalyzeText, addToast, backendStatus } = useLexClearStore();
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GenerateResponse | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
  const [selectedClauseIds, setSelectedClauseIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    apiClient
      .getTemplates()
      .then((data) => {
        if (!mounted) return;
        setTemplates(data);
        if (data[0]) setSelectedTemplateId(data[0].id);
      })
      .catch((e: Error) => {
        if (mounted) setLoadError(e.message || 'Could not load templates');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  useEffect(() => {
    if (!activeTemplate) return;
    const initial: Record<string, unknown> = {};
    for (const field of activeTemplate.fields) {
      initial[field.key] = field.default_value ?? '';
    }
    setFieldValues(initial);
    setSelectedClauseIds(activeTemplate.optional_clauses.filter((c) => c.is_default).map((c) => c.id));
    setGeneratedResult(null);
  }, [activeTemplate?.id]);

  const liveDraft = useMemo(() => {
    if (!activeTemplate) return '';
    if (generatedResult?.full_text) return generatedResult.full_text;
    return draftFromTemplate(activeTemplate, fieldValues, selectedClauseIds);
  }, [activeTemplate, fieldValues, selectedClauseIds, generatedResult]);

  const handleGenerate = async () => {
    if (!activeTemplate) return;
    setIsGenerating(true);
    try {
      const jurisdiction = String(fieldValues.jurisdiction || activeTemplate.jurisdiction_supported[0] || '');
      const res = await apiClient.generateDocument(
        activeTemplate.id,
        fieldValues,
        selectedClauseIds,
        jurisdiction
      );
      setGeneratedResult(res);
      setCurrentStep(4);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Could not generate', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadError || (backendStatus === 'offline' && templates.length === 0)) {
    return (
      <div className="hairline-card p-8 text-center space-y-3 max-w-lg mx-auto">
        <h2 className="font-heading font-bold text-lg">Templates come from the server</h2>
        <p className="text-sm text-surface-500">{loadError || 'Start the API, then reopen Draft.'}</p>
        <Button variant="secondary" onClick={() => setActiveView('landing')}>
          Back home
        </Button>
      </div>
    );
  }

  if (!activeTemplate) {
    return <p className="text-sm text-surface-500 text-center py-16">Loading templates…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div>
          <h2 className="font-heading text-2xl font-bold text-surface-900 dark:text-white">Draft an agreement</h2>
          <p className="text-xs text-surface-500 mt-1">
            Templates, fields, and optional clauses are loaded from the API.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setActiveView('workspace')}>
          ← Workspace
        </Button>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const selected = selectedTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-5 rounded-2xl hairline-card text-left space-y-3 ${
                    selected ? 'border-primary-500 ring-2 ring-primary-500/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FileText className="w-5 h-5 text-primary-500" />
                    <Badge variant="neutral">{tpl.category}</Badge>
                  </div>
                  <h4 className="font-heading font-semibold text-sm">{tpl.name}</h4>
                  <p className="text-xs text-surface-500 leading-relaxed">{tpl.description}</p>
                  <span className="text-xs font-semibold text-primary-600 inline-flex items-center gap-1">
                    {tpl.fields.length} fields <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setCurrentStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue with {activeTemplate.name}
            </Button>
          </div>
        </div>
      )}

      {currentStep >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 hairline-card p-5 space-y-2 text-xs font-semibold">
            {['Pick template', 'Fill the blanks', 'Optional clauses', 'Generate'].map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setCurrentStep(i + 1)}
                className={`w-full text-left p-2.5 rounded-xl ${
                  currentStep === i + 1 ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700' : 'text-surface-600'
                }`}
              >
                {i + 1}. {label}
              </button>
            ))}
            {generatedResult && (
              <div className="pt-4 border-t border-surface-200 dark:border-surface-800 text-center">
                <ScoreRing score={generatedResult.score_preview} size={84} strokeWidth={7} />
              </div>
            )}
          </div>

          <div className="lg:col-span-4 hairline-card p-6 space-y-5">
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-heading font-semibold">{activeTemplate.name}</h3>
                <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                  {activeTemplate.fields.map((field) => (
                    <label key={field.key} className="block space-y-1.5">
                      <span className="text-xs font-semibold flex justify-between">
                        {field.label}
                        {field.required && <span className="text-primary-500">Required</span>}
                      </span>
                      {field.field_type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={String(fieldValues[field.key] ?? '')}
                          placeholder={field.placeholder}
                          onChange={(e) => setFieldValues((p) => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full p-2.5 text-xs rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950"
                        />
                      ) : field.field_type === 'select' && field.options ? (
                        <select
                          value={String(fieldValues[field.key] ?? field.options[0])}
                          onChange={(e) => setFieldValues((p) => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full p-2.5 text-xs rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950"
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                          value={String(fieldValues[field.key] ?? '')}
                          placeholder={field.placeholder}
                          onChange={(e) => setFieldValues((p) => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full p-2.5 text-xs rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950"
                        />
                      )}
                      {field.help_text && <span className="text-[11px] text-surface-400">{field.help_text}</span>}
                    </label>
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setCurrentStep(3)}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-heading font-semibold">Optional clauses</h3>
                <div className="space-y-3 max-h-[520px] overflow-y-auto">
                  {activeTemplate.optional_clauses.map((clause) => {
                    const checked = selectedClauseIds.includes(clause.id);
                    return (
                      <label
                        key={clause.id}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer ${
                          checked ? 'border-primary-500/50 bg-primary-50/20' : 'border-surface-200 dark:border-surface-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedClauseIds((prev) =>
                              prev.includes(clause.id) ? prev.filter((id) => id !== clause.id) : [...prev, clause.id]
                            )
                          }
                          className="mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">{clause.title}</span>
                            {clause.is_recommended && <Badge variant="success">Suggested</Badge>}
                          </div>
                          <p className="text-[11px] text-surface-500 mt-1">{clause.layman_explanation}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="flex justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleGenerate} isLoading={isGenerating}>
                    Generate
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && generatedResult && (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-heading font-semibold">{generatedResult.title}</h3>
                <p className="text-xs text-surface-500">
                  Preview score {generatedResult.score_preview.toFixed(1)} / 100 ·{' '}
                  {generatedResult.risk_band.replace(/_/g, ' ').toLowerCase()}
                </p>
                {generatedResult.suggestions?.length > 0 && (
                  <ul className="text-left text-xs space-y-1 bg-surface-50 dark:bg-surface-950 p-3 rounded-xl">
                    {generatedResult.suggestions.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                )}
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={<Eye className="w-4 h-4" />}
                  onClick={() => uploadAndAnalyzeText(generatedResult.full_text, `${activeTemplate.id}_draft.txt`)}
                >
                  Score this draft
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    const blob = new Blob([generatedResult.full_text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${activeTemplate.id}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download text
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 max-h-[820px] overflow-y-auto">
            <div className="document-paper p-8 rounded-2xl whitespace-pre-wrap text-sm">{liveDraft}</div>
          </div>
        </div>
      )}
    </div>
  );
};
