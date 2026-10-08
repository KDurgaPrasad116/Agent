import React, { useState } from 'react';
import { Layers, GitBranch, Calculator, RefreshCw, FileText, ShieldCheck, ArrowRight, CheckCircle2, Server, Cpu, Database, Eye, Lock, Zap } from 'lucide-react';

interface DiagramTab {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const InteractiveDiagrams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const tabs: DiagramTab[] = [
    { id: 'architecture', title: '1. System Architecture', subtitle: 'Frontend, FastAPI & Dual Intelligence', icon: <Layers className="w-4 h-4" /> },
    { id: 'pipeline', title: '2. Analysis Pipeline', subtitle: 'Ingestion to Slicing & Heuristics', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'derivation', title: '3. Scoring Derivation', subtitle: 'Weighted Formulas & Deduction Ledger', icon: <Calculator className="w-4 h-4" /> },
    { id: 'autocorrect', title: '4. Auto-Correction Loop', subtitle: 'Statutory Diffs & Live Re-Scoring', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'generator', title: '5. Contract Generator', subtitle: 'Guided Wizard & Pre-Export Audit', icon: <FileText className="w-4 h-4" /> },
    { id: 'privacy', title: '6. Data Sovereignty', subtitle: 'Zero Cloud Leakage & SQL Shredder', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="glass-card rounded-3xl border border-surface-200/80 dark:border-surface-800/80 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-surface-200/60 dark:border-surface-800/60 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
            <Cpu className="w-3.5 h-3.5" />
            System Schematics & Engineering
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-surface-900 dark:text-white mt-2 tracking-tight">
            Interactive Architecture & Mathematical Proofs
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 max-w-2xl">
            Explore the engineering workflows, deterministic mathematical derivations, and air-gapped privacy guarantees powering LexClear.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveStep(null); }}
              className={`p-3.5 rounded-2xl text-left transition-all duration-200 border ${
                isActive
                  ? 'bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30 font-bold'
                  : 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-700 hover:bg-white dark:hover:bg-surface-850'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 font-bold text-xs">
                <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400'}>
                  {tab.icon}
                </span>
                <span className="truncate">{tab.title.replace(/^\d+\.\s*/, '')}</span>
              </div>
              <div className="text-[11px] line-clamp-1 opacity-80">{tab.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Diagram Canvas */}
      <div className="mt-8 p-6 md:p-8 bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 min-h-[440px] flex flex-col justify-center relative overflow-hidden">
        
        {/* ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-4">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Multi-Tier Architecture</span>
              <h3 className="text-xl font-black text-surface-900 dark:text-white mt-1">Full-Stack System Topology</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Air-gapped separation between presentation UI, validation gateway, dual-engine intelligence, and private storage.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
              {/* Frontend Card */}
              <div className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-blue-500/30 shadow-sm relative overflow-hidden group hover:border-blue-500 transition-all">
                <div className="h-1 bg-blue-500 absolute top-0 inset-x-0" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Tier 1: Client</span>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="font-extrabold text-sm text-surface-900 dark:text-white">React 18 + TS + Tailwind</h4>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">Modern clean reactive interface</p>
                <ul className="text-xs text-surface-600 dark:text-surface-300 mt-3 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5"><span className="text-blue-500">✓</span> Word-level diff visualizer</li>
                  <li className="flex items-center gap-1.5"><span className="text-blue-500">✓</span> Dynamic SVG radar polygon</li>
                  <li className="flex items-center gap-1.5"><span className="text-blue-500">✓</span> Multilingual English/Hindi</li>
                  <li className="flex items-center gap-1.5"><span className="text-blue-500">✓</span> 6-Template guided wizard</li>
                </ul>
              </div>

              {/* API Gateway */}
              <div className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-emerald-500/30 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
                <div className="h-1 bg-emerald-500 absolute top-0 inset-x-0" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Tier 2: Gateway</span>
                  <Server className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="font-extrabold text-sm text-surface-900 dark:text-white">FastAPI Asynchronous</h4>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">High-throughput schema validation</p>
                <ul className="text-xs text-surface-600 dark:text-surface-300 mt-3 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> PDF, DOCX, TXT stream parsers</li>
                  <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Exact character offset slicer</li>
                  <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Pydantic v2 strict typing</li>
                  <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> SHA-256 caching & rate limit</li>
                </ul>
              </div>

              {/* Core Intelligence */}
              <div className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-purple-500/30 shadow-sm relative overflow-hidden group hover:border-purple-500 transition-all">
                <div className="h-1 bg-purple-500 absolute top-0 inset-x-0" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Tier 3: Reasoning</span>
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                <h4 className="font-extrabold text-sm text-surface-900 dark:text-white">Dual-Engine AI</h4>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">Deterministic statutory rules + LLM</p>
                <ul className="text-xs text-surface-600 dark:text-surface-300 mt-3 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5"><span className="text-purple-500">✓</span> 25+ statutory rule doctrines</li>
                  <li className="flex items-center gap-1.5"><span className="text-purple-500">✓</span> Zero-hallucination regexes</li>
                  <li className="flex items-center gap-1.5"><span className="text-purple-500">✓</span> Deterministic fallback mode</li>
                  <li className="flex items-center gap-1.5"><span className="text-purple-500">✓</span> Grade 8 plain-language rewriter</li>
                </ul>
              </div>

              {/* Data & Export */}
              <div className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-amber-500/30 shadow-sm relative overflow-hidden group hover:border-amber-500 transition-all">
                <div className="h-1 bg-amber-500 absolute top-0 inset-x-0" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Tier 4: Vault & Export</span>
                  <Database className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="font-extrabold text-sm text-surface-900 dark:text-white">Local SQLite & DOCX</h4>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">Air-gapped data sovereignty</p>
                <ul className="text-xs text-surface-600 dark:text-surface-300 mt-3 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5"><span className="text-amber-500">✓</span> Private local file (no cloud DB)</li>
                  <li className="flex items-center gap-1.5"><span className="text-amber-500">✓</span> Tracked-changes Word DOCX</li>
                  <li className="flex items-center gap-1.5"><span className="text-amber-500">✓</span> Print-ready formatted PDF</li>
                  <li className="flex items-center gap-1.5"><span className="text-amber-500">✓</span> 1-Click GDPR data shredding</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-2">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Pipeline Flow</span>
              <h3 className="text-xl font-black text-surface-900 dark:text-white mt-1">7-Stage Ingestion to Audit Pipeline</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">Strict end-to-end processing guarantees zero text truncation and deterministic token offsets.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-xs">
              {[
                { step: '1', title: 'Upload & Parse', desc: 'PDF, DOCX, TXT stream; 15MB ceiling', color: 'bg-brand-500' },
                { step: '2', title: 'SHA-256 Digest', desc: 'Determinism key and cache lookup', color: 'bg-teal-500' },
                { step: '3', title: 'Clause Slicing', desc: 'Heading numbers & exact char offsets', color: 'bg-cyan-500' },
                { step: '4', title: 'Dual Scanner', desc: 'Rule patterns + doctrine heuristics', color: 'bg-indigo-500' },
                { step: '5', title: 'Weighted Math', desc: '5-factor formula & step deduction rollup', color: 'bg-purple-500' },
                { step: '6', title: 'Diff Engine', desc: 'Word-level tokens (delete, insert, equal)', color: 'bg-amber-500' },
                { step: '7', title: 'Export & Shred', desc: 'DOCX / PDF bundle with shred controls', color: 'bg-emerald-500' },
              ].map((s) => (
                <div key={s.step} className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 text-center flex flex-col justify-between hover:shadow-md hover:border-brand-500/50 transition-all group">
                  <div>
                    <div className={`w-7 h-7 rounded-full ${s.color} text-white font-extrabold flex items-center justify-center mx-auto mb-2 text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                      {s.step}
                    </div>
                    <div className="font-extrabold text-surface-900 dark:text-white text-xs">{s.title}</div>
                  </div>
                  <div className="text-[11px] text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DERIVATION */}
        {activeTab === 'derivation' && (
          <div className="space-y-6 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-2">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Transparent Mathematics</span>
              <h3 className="text-xl font-black text-surface-900 dark:text-white mt-1">Mathematical Scoring Derivation</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">Zero black-box weights. Every point deduction is mathematically logged and traceable to a specific statute or risk pattern.</p>
            </div>

            <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-brand-500/30 font-mono text-xs md:text-sm text-center text-brand-700 dark:text-brand-300 font-bold shadow-glow-brand">
              Overall Score = (0.25 × Clarity) + (0.20 × Completeness) + (0.20 × Fairness) + (0.25 × LegalRisk) + (0.10 × Compliance)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {[
                { name: 'Clarity (25%)', base: '100.0', triggers: 'Ambiguous scope (-15), Archaic legalese (-5)', focus: 'Plain Language Comprehension', weight: '25%' },
                { name: 'Completeness (20%)', base: '100.0', triggers: 'Missing notice period (-15), No IP terms (-15)', focus: 'Checklist Standards', weight: '20%' },
                { name: 'Fairness (20%)', base: '100.0', triggers: 'Asymmetric cap (-20), One-sided termination (-15)', focus: 'Bilateral Mutuality', weight: '20%' },
                { name: 'Legal Risk (25%)', base: '100.0', triggers: 'Unlimited liability (-20), Sole arbitrator (-15)', focus: 'Statutory Safeguards', weight: '25%' },
                { name: 'Compliance (10%)', base: '100.0', triggers: 'Offshore haven (-10), Stamp duty evasion (-25)', focus: 'Jurisdictional Formality', weight: '10%' },
              ].map((c) => (
                <div key={c.name} className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-surface-900 dark:text-white text-xs">{c.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">{c.weight}</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">Starts at {c.base}</div>
                    <div className="text-[11px] text-surface-500 dark:text-surface-400 mt-2 font-mono leading-relaxed">{c.triggers}</div>
                  </div>
                  <div className="text-[10px] text-surface-400 dark:text-surface-500 mt-3 border-t pt-2 border-surface-100 dark:border-surface-800 font-medium">Target: {c.focus}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTOCORRECT */}
        {activeTab === 'autocorrect' && (
          <div className="space-y-6 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-2">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Automated Healing</span>
              <h3 className="text-xl font-black text-surface-900 dark:text-white mt-1">Auto-Correction & Statutory Healing Loop</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">How predatory clauses are detected, surgically rebalanced with statutory mutuality, and dynamically re-scored.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-5 bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40">
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider">Step 1: Flaw Detected</span>
                <p className="mt-2 text-surface-700 dark:text-surface-300 leading-relaxed font-mono text-[11px]">
                  "Service Provider shall have unlimited liability for any damages..."
                </p>
                <div className="mt-3 font-extrabold text-rose-700 dark:text-rose-400 text-xs flex items-center gap-1.5">
                  <span>Deduction: -20 Legal Risk</span>
                </div>
              </div>

              <div className="p-5 bg-indigo-50/70 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-900/40">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-wider">Step 2: Balanced Alternative</span>
                <p className="mt-2 text-surface-700 dark:text-surface-300 leading-relaxed text-[11px]">
                  Generated using Mutual Liability Cap Doctrine with capped 12 months fees. Commercial scope preserved.
                </p>
                <div className="mt-3 font-extrabold text-indigo-700 dark:text-indigo-400 text-xs">Preserves Intent</div>
              </div>

              <div className="p-5 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider">Step 3: Redline Diff View</span>
                <p className="mt-2 text-surface-700 dark:text-surface-300 text-[11px] leading-relaxed">
                  <span className="line-through text-rose-600 font-mono">unlimited liability</span>{' '}
                  <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1 py-0.5 rounded font-mono font-bold">aggregate liability capped at 12 months fees</span>
                </p>
                <div className="mt-3 font-extrabold text-amber-700 dark:text-amber-400 text-xs">Accept / Reject / Edit</div>
              </div>

              <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">Step 4: Dynamic Re-Score</span>
                <p className="mt-2 text-surface-700 dark:text-surface-300 leading-relaxed text-[11px]">
                  Document recalculated live: deduction is cleared, score rises from 48.0 to 92.5.
                </p>
                <div className="mt-3 font-extrabold text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1">
                  <span>Delta: +44.5 pts (Low Risk)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-2">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Interactive Creation</span>
              <h3 className="text-xl font-black text-surface-900 dark:text-white mt-1">Guided Document Generation Flow</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">Step-by-step wizard creating custom, legally sound agreements vetted by the Scoring Engine before export.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              {[
                { step: '1', title: 'Choose Template', desc: 'NDA, Lease, Employment, Service, Sale, POA' },
                { step: '2', title: 'Guided Questions', desc: 'Party details, amounts, dates & jurisdiction' },
                { step: '3', title: 'Clause Library', desc: 'Toggle protective clauses with plain-English guides' },
                { step: '4', title: 'Live Preview', desc: 'Auto-numbered sections & dynamic table of contents' },
                { step: '5', title: 'Pre-Export Score', desc: 'Audited against Scoring Engine before download' },
                { step: '6', title: 'Word / PDF Export', desc: 'Professional typography ready for signature' },
              ].map((s) => (
                <div key={s.step} className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 text-center flex flex-col justify-between hover:border-accent-500 transition-all">
                  <div>
                    <div className="w-7 h-7 rounded-full bg-accent-600 text-white font-extrabold flex items-center justify-center mx-auto mb-2 text-xs shadow-sm">
                      {s.step}
                    </div>
                    <div className="font-extrabold text-surface-900 dark:text-white text-xs">{s.title}</div>
                  </div>
                  <div className="text-[11px] text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRIVACY */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-2">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Data Sovereignty</span>
              <h3 className="text-xl font-black text-surface-900 dark:text-white mt-1">Data Privacy & Shredding Lifecycle</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">Zero cloud storage, client-side isolation, and cryptographically verified data purging.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">1. Local Processing</span>
                </div>
                <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                  Documents are stored exclusively in your local SQLite database (<code className="text-emerald-600 dark:text-emerald-400">lexclear.db</code>). No confidential contract text is sold, retained, or leaked to public model training sets.
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider">2. Offline Mode</span>
                </div>
                <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                  By default, LexClear runs in 100% offline heuristic mode. All statutory checks, clause segmentations, and diffs execute directly on your local machine without external network calls.
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-rose-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-rose-500" />
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider">3. GDPR Data Shredder</span>
                </div>
                <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                  With a single click on "Delete Document" or "Purge All Data", all records across documents, clauses, deductions, and corrections are permanently wiped via cascading SQL DELETE.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
