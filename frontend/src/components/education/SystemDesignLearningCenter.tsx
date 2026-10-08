import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge, RiskBadge } from '../ui/Badge';
import { ScoreRing } from '../ui/ScoreRing';
import {
  Cpu,
  Layers,
  GitBranch,
  Calculator,
  RefreshCw,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Server,
  Database,
  Lock,
  Search,
  BookOpen,
  HelpCircle,
  Terminal,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PipelineStep {
  id: number;
  name: string;
  subname: string;
  icon: React.ReactNode;
  latencyMs: number;
  description: string;
  tradeoff: string;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
}

export const SystemDesignLearningCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'architecture' | 'formula' | 'faq'>('simulation');
  const [selectedSimStep, setSelectedSimStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [glossarySearch, setGlossarySearch] = useState('');

  // Interactive Formula Weights Simulator State
  const [simCriteria, setSimCriteria] = useState({
    clarity: 85,
    completeness: 85,
    fairness: 65,
    legal_risk: 45,
    compliance: 85,
  });

  const computedOverall =
    simCriteria.clarity * 0.25 +
    simCriteria.completeness * 0.20 +
    simCriteria.fairness * 0.20 +
    simCriteria.legal_risk * 0.25 +
    simCriteria.compliance * 0.10;

  const pipelineSteps: PipelineStep[] = [
    {
      id: 1,
      name: 'Stream Ingest & Sanitizer',
      subname: 'Binary Stream Decoupling',
      icon: <Server className="w-4 h-4 text-primary-500" />,
      latencyMs: 110,
      description:
        'Receives multi-part file uploads (PDF, DOCX, TXT) with a 15MB hard ceiling. Decodes byte streams, strips malicious macros, and normalizes CRLF line breaks into uniform Unicode UTF-8 strings.',
      tradeoff:
        'Streaming buffer parsing prevents OOM spikes on large 50-page enterprise contracts while keeping RAM footprint under 45MB.',
      inputPayload: {
        file_name: 'Vendor_Master_Services_Agreement.pdf',
        size_bytes: 489200,
        content_type: 'application/pdf',
      },
      outputPayload: {
        status: 'sanitized',
        char_count: 8420,
        word_count: 1240,
        line_break_format: 'LF_UNIX',
      },
    },
    {
      id: 2,
      name: 'SHA-256 Digest & Cache Key',
      subname: 'Cryptographic Determinism',
      icon: <Lock className="w-4 h-4 text-emerald-500" />,
      latencyMs: 12,
      description:
        'Calculates a 256-bit cryptographic digest of the raw document text. Used as an idempotency cache key to verify whether the identical document was already audited, avoiding redundant re-processing.',
      tradeoff:
        'Hash lookups guarantee O(1) determinism. If the document text changes by even a single comma, the digest invalidates to ensure fresh audit results.',
      inputPayload: {
        raw_text_sample: 'MASTER SERVICES AGREEMENT\\nClause 1: Scope...',
      },
      outputPayload: {
        sha256_hash: '9a5c8e3f4b21d7a8c901e23f45a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
        cache_status: 'CACHE_MISS_PROCEED_TO_PARSE',
      },
    },
    {
      id: 3,
      name: 'Clause Slicing & Offset Matrix',
      subname: 'Zero-Truncation Segmentation',
      icon: <GitBranch className="w-4 h-4 text-indigo-500" />,
      latencyMs: 45,
      description:
        'Executes deterministic regex boundary matchers to identify numbered headers, roman numerals, and section titles. Computes exact start_char and end_char offsets into the original text string.',
      tradeoff:
        'Offset matrices guarantee character-exact highlighting. The system never reconstructs text from fragments, preserving legal document integrity.',
      inputPayload: {
        text_length: 8420,
        regex_patterns: ['^(Clause|Article|Section|\\d+\\.)\\s+.*'],
      },
      outputPayload: {
        total_clauses_extracted: 7,
        offsets: [
          { clause_id: 'cl-1', start_char: 0, end_char: 310, title: '1. Scope of Services' },
          { clause_id: 'cl-4', start_char: 1014, end_char: 1318, title: '4. Limitation of Liability' },
        ],
      },
    },
    {
      id: 4,
      name: 'Dual Intelligence Scanner',
      subname: 'Deterministic Rules + AI Fallback',
      icon: <Cpu className="w-4 h-4 text-purple-500" />,
      latencyMs: 280,
      description:
        'Scans each clause against 25+ statutory doctrine checks (e.g. Uncapped Liability, Perkins Eastman unilateral arbitrator, Section 27 Restraint of Trade). Falls back to temperature=0 LLM inference only for ambiguous plain-English explanations.',
      tradeoff:
        'Rule-first architecture ensures 0% hallucination on statutory violations, executing in <300ms without relying on cloud API tokens.',
      inputPayload: {
        evaluating_clause: 'Clause 4: Limitation of Liability',
        text: 'Client liability capped at $10.00; Service Provider has unlimited liability...',
      },
      outputPayload: {
        doctrine_matched: 'DOCTRINE_RECIPROCAL_LIABILITY_CAP',
        violation_flag: 'CRITICAL_ASYMMETRY',
        points_deducted: 20.0,
        remedy_template: 'Cap aggregate liability to 12 months fees paid.',
      },
    },
    {
      id: 5,
      name: 'Mathematical Scoring Engine',
      subname: 'Weighted 5-Pillar Derivation',
      icon: <Calculator className="w-4 h-4 text-amber-500" />,
      latencyMs: 18,
      description:
        'Evaluates the 5 foundational pillars starting from Base 100.0. Subtracts identified flaw points and rolls up weighted criterion scores: Overall = 0.25*Clarity + 0.20*Completeness + 0.20*Fairness + 0.25*LegalRisk + 0.10*Compliance.',
      tradeoff:
        'Pure algebraic derivation eliminates black-box subjectivity. Every lost point is mathematically auditable to a specific clause violation.',
      inputPayload: {
        deductions_recorded: 7,
        weights: [0.25, 0.20, 0.20, 0.25, 0.10],
      },
      outputPayload: {
        criteria_scores: { clarity: 85.0, completeness: 85.0, fairness: 65.0, legal_risk: 45.0, compliance: 85.0 },
        overall_score: 48.0,
        risk_band: 'HIGH_RISK',
      },
    },
    {
      id: 6,
      name: 'Redline Diff Engine',
      subname: 'Word-Level Tokenizer',
      icon: <RefreshCw className="w-4 h-4 text-sky-500" />,
      latencyMs: 65,
      description:
        'Computes word-level diff tokens (equal, delete, insert) between offending predatory clauses and statutory balanced alternatives. Recomputes live score deltas as users accept proposed corrections.',
      tradeoff:
        'Word-level tokenization preserves non-offending commercial terms (names, dates, dollar amounts) while surgically repairing unbalanced statutory covenants.',
      inputPayload: {
        original: 'Service Provider shall have unlimited liability...',
        proposed: 'liability capped at twelve (12) months fees paid...',
      },
      outputPayload: {
        diff_tokens: [
          { type: 'delete', value: 'unlimited liability' },
          { type: 'insert', value: 'liability capped at twelve (12) months fees paid' },
        ],
        score_delta: '+20.0 pts',
      },
    },
    {
      id: 7,
      name: 'Data Sovereignty & Shredder',
      subname: 'Local SQLite Isolation',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      latencyMs: 25,
      description:
        'Persists audit artifacts inside local machine SQLite database (lexclear.db). Enables 1-click GDPR data shredding to execute cascading SQL DELETE across all document tables.',
      tradeoff:
        'Zero cloud telemetry guarantees total air-gap confidentiality for M&A agreements, trade secrets, and proprietary vendor contracts.',
      inputPayload: {
        target: 'local_sqlite',
        database_file: 'lexclear.db',
      },
      outputPayload: {
        persistence_status: 'LOCAL_ENCRYPTED_SAVED',
        shred_capability: 'READY_CASCADING_DELETE_ACTIVE',
      },
    },
  ];

  const currentStep = pipelineSteps.find((s) => s.id === selectedSimStep) || pipelineSteps[0];

  // Automated Live Simulation Runner
  const runSimulation = () => {
    setIsSimulating(true);
    setSelectedSimStep(1);

    let step = 1;
    const interval = setInterval(() => {
      step += 1;
      if (step <= 7) {
        setSelectedSimStep(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 1200);
  };

  const faqs = [
    {
      q: 'Why does LexClear use a deterministic Rule Engine instead of pure LLM prompting?',
      a: 'Pure LLM prompt chains are non-deterministic: the same contract scored three times can produce three different scores. In legal compliance, predictability is paramount. Our Rule Engine uses statutory doctrine patterns that execute with 100% mathematical determinism, using LLM models only as a translation assistant for plain English explanations.',
    },
    {
      q: 'How does the character offset slicer guarantee zero text loss?',
      a: 'Rather than splitting by sentences or stripping punctuation, our parser computes start_char and end_char slice indices against the original unaltered string. When a clause is displayed, the UI reads directly from the master string at those exact offsets.',
    },
    {
      q: 'Where are my documents stored when using LexClear?',
      a: 'All files, extracted clauses, deduction ledgers, and redlines are stored in a private local SQLite database on your machine (lexclear.db). No confidential contract text is sold or leaked to public AI training sets.',
    },
    {
      q: 'Can the scoring formula be tuned for specific industries?',
      a: 'Yes. The 5 criterion weights (Clarity: 25%, Completeness: 20%, Fairness: 20%, Legal Risk: 25%, Compliance: 10%) can be calibrated via backend configuration to match specialized enterprise risk tolerance.',
    },
  ];

  const glossary = [
    { term: 'Perkins Eastman Doctrine', def: 'Arbitration doctrine establishing that a party with an interest in the outcome cannot unilaterally appoint a sole arbitrator.' },
    { term: 'Liquidated Damages', def: 'A pre-agreed financial amount set in the contract that a breaching party must pay as compensation for a specific default.' },
    { term: 'Section 27 Restraint of Trade', def: 'Statutory provision rendering any agreement that restrains an individual from exercising a lawful profession, trade, or business void to that extent.' },
    { term: 'Severability', def: 'A standard clause stating that if any single provision is found illegal by a court, the remainder of the contract remains in full legal effect.' },
    { term: 'Quantum Meruit', def: 'A legal doctrine entitling a service provider to receive reasonable payment for the actual value of work performed, even if the agreement is cancelled early.' },
  ];

  const filteredGlossary = glossary.filter(
    (g) =>
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.def.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="border-b border-surface-200 dark:border-surface-800 pb-5">
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
          Engineering & Theoretical Foundation
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white mt-1">
          System Design & Model Workflow
        </h1>
        <p className="text-sm text-surface-500 mt-1 max-w-3xl leading-relaxed">
          An interactive visual learning experience explaining the dual-engine architecture, deterministic statutory pipelines, mathematical scoring derivations, and local air-gapped data sovereignty.
        </p>

        {/* Navigation Switcher */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'simulation'
                ? 'bg-primary-600 text-white border-primary-500 shadow-subtle'
                : 'hairline-card text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Pipeline Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'architecture'
                ? 'bg-primary-600 text-white border-primary-500 shadow-subtle'
                : 'hairline-card text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4-Tier Topology & Model Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('formula')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'formula'
                ? 'bg-primary-600 text-white border-primary-500 shadow-subtle'
                : 'hairline-card text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Mathematical Formula Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'faq'
                ? 'bg-primary-600 text-white border-primary-500 shadow-subtle'
                : 'hairline-card text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Glossary & FAQ</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE PIPELINE SIMULATOR */}
      {activeTab === 'simulation' && (
        <div className="space-y-8">
          <div className="hairline-card p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
              <div>
                <h3 className="font-heading font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary-500" />
                  Live 7-Stage Contract Ingestion & Audit Pipeline
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Click any stage or hit "Run Live Pipeline Simulation" to follow a contract through the system.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={runSimulation}
                isLoading={isSimulating}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                {isSimulating ? 'Simulating Pipeline...' : 'Run Pipeline Simulation'}
              </Button>
            </div>

            {/* Stepper Node Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {pipelineSteps.map((step) => {
                const isActive = selectedSimStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedSimStep(step.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-500 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/20 font-bold'
                        : 'hairline-card text-surface-600 dark:text-surface-400 hover:border-surface-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] text-surface-400">0{step.id}</span>
                      <span className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400">
                        {step.latencyMs}ms
                      </span>
                    </div>
                    <div className="font-heading font-bold text-xs truncate">{step.name}</div>
                    <div className="text-[10px] text-surface-400 truncate mt-0.5">{step.subname}</div>
                  </button>
                );
              })}
            </div>

            {/* Stage Inspector Detail Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Explainer Details (6 Cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    {currentStep.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-surface-900 dark:text-white">
                      Stage {currentStep.id}: {currentStep.name}
                    </h4>
                    <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                      Execution Budget: ~{currentStep.latencyMs}ms
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 space-y-2 text-xs">
                  <span className="font-bold text-surface-700 dark:text-surface-300 block">
                    Under the Hood:
                  </span>
                  <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Engineering Decision & Trade-Off:
                  </span>
                  <p className="text-surface-600 dark:text-surface-300 leading-relaxed text-[11px]">
                    {currentStep.tradeoff}
                  </p>
                </div>
              </div>

              {/* Right Live Payload Inspector (6 Cols) */}
              <div className="lg:col-span-6 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-surface-500">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Live Data Payload Inspector
                  </span>
                  <Badge variant="success">Active Memory State</Badge>
                </div>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-surface-950 text-slate-300 border border-surface-800 overflow-x-auto max-h-[160px]">
                    <div className="text-[10px] text-surface-500 font-bold mb-1 uppercase tracking-wider">
                      // Input Parameters
                    </div>
                    <pre className="text-[11px] leading-relaxed">
                      {JSON.stringify(currentStep.inputPayload, null, 2)}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-950 text-slate-300 border border-surface-800 overflow-x-auto max-h-[180px]">
                    <div className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-wider">
                      // Output Transformation
                    </div>
                    <pre className="text-[11px] leading-relaxed text-emerald-300">
                      {JSON.stringify(currentStep.outputPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 4-TIER TOPOLOGY & MODEL FLOW */}
      {activeTab === 'architecture' && (
        <div className="space-y-8">
          <div className="hairline-card p-6 md:p-8 space-y-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-surface-900 dark:text-white">
                Full-Stack Architecture & Isolation Boundaries
              </h3>
              <p className="text-xs text-surface-500 mt-1">
                Air-gapped separation between client browser, API gateway, dual-engine intelligence, and private persistence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
              {/* Presentation Tier */}
              <div className="hairline-card p-5 space-y-3 hover:border-primary-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Tier 1</span>
                  <Server className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white">
                  Presentation Client
                </h4>
                <p className="text-xs text-surface-500">React 18 + TS + Tailwind + Zustand</p>
                <ul className="text-xs text-surface-600 dark:text-surface-400 space-y-1.5 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <li>• Interactive Redline Diff Studio</li>
                  <li>• Real-time Word-level Tokens</li>
                  <li>• Dynamic SVG Score Ring</li>
                  <li>• Swappable Offline Mocks</li>
                </ul>
              </div>

              {/* Gateway Tier */}
              <div className="hairline-card p-5 space-y-3 hover:border-primary-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Tier 2</span>
                  <Server className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white">
                  Gateway & Parsing
                </h4>
                <p className="text-xs text-surface-500">FastAPI Asynchronous Gateway</p>
                <ul className="text-xs text-surface-600 dark:text-surface-400 space-y-1.5 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <li>• PDF, DOCX, TXT Stream Parsers</li>
                  <li>• Character Offset Slicer</li>
                  <li>• Pydantic v2 Schema Validation</li>
                  <li>• 15MB Multipart File Ceiling</li>
                </ul>
              </div>

              {/* Dual Intelligence Tier */}
              <div className="hairline-card p-5 space-y-3 hover:border-primary-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Tier 3</span>
                  <Cpu className="w-4 h-4 text-purple-500" />
                </div>
                <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white">
                  Dual Intelligence AI
                </h4>
                <p className="text-xs text-surface-500">Deterministic Rules + LLM</p>
                <ul className="text-xs text-surface-600 dark:text-surface-400 space-y-1.5 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <li>• 25+ Statutory Doctrine Rules</li>
                  <li>• 0% Hallucination Guarantee</li>
                  <li>• Fallback Deterministic LLM (Temp=0)</li>
                  <li>• Grade 8 Layman Synthesizer</li>
                </ul>
              </div>

              {/* Data Vault Tier */}
              <div className="hairline-card p-5 space-y-3 hover:border-primary-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Tier 4</span>
                  <Database className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white">
                  Storage & Shredder
                </h4>
                <p className="text-xs text-surface-500">Air-Gapped Local SQLite</p>
                <ul className="text-xs text-surface-600 dark:text-surface-400 space-y-1.5 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <li>• Local Database (lexclear.db)</li>
                  <li>• Tracked-Changes DOCX Generator</li>
                  <li>• Formatted PDF Export Engine</li>
                  <li>• 1-Click GDPR Data Shredder</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MATHEMATICAL FORMULA SIMULATOR */}
      {activeTab === 'formula' && (
        <div className="space-y-8">
          <div className="hairline-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800">
              <div>
                <h3 className="font-heading font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary-500" />
                  Interactive 5-Pillar Mathematical Formula Simulator
                </h3>
                <p className="text-xs text-surface-500 mt-1">
                  Adjust individual pillar scores to simulate how the weighted mathematical formula recomputes overall contract health live.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ScoreRing score={computedOverall} size={84} strokeWidth={7} />
              </div>
            </div>

            {/* Formula Code Chip */}
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 font-mono text-xs text-center text-primary-700 dark:text-primary-300 font-bold">
              Overall Score = (0.25 × Clarity) + (0.20 × Completeness) + (0.20 × Fairness) + (0.25 × LegalRisk) + (0.10 × Compliance)
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
              <div className="p-4 rounded-xl hairline-card space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Clarity (25%)</span>
                  <span className="font-mono text-primary-600">{simCriteria.clarity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simCriteria.clarity}
                  onChange={(e) => setSimCriteria({ ...simCriteria, clarity: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-[10px] text-surface-400 block">Plain language reading</span>
              </div>

              <div className="p-4 rounded-xl hairline-card space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Completeness (20%)</span>
                  <span className="font-mono text-primary-600">{simCriteria.completeness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simCriteria.completeness}
                  onChange={(e) => setSimCriteria({ ...simCriteria, completeness: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-[10px] text-surface-400 block">Essential covenants</span>
              </div>

              <div className="p-4 rounded-xl hairline-card space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Fairness (20%)</span>
                  <span className="font-mono text-primary-600">{simCriteria.fairness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simCriteria.fairness}
                  onChange={(e) => setSimCriteria({ ...simCriteria, fairness: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-[10px] text-surface-400 block">Bilateral mutuality</span>
              </div>

              <div className="p-4 rounded-xl hairline-card space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Legal Risk (25%)</span>
                  <span className="font-mono text-primary-600">{simCriteria.legal_risk}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simCriteria.legal_risk}
                  onChange={(e) => setSimCriteria({ ...simCriteria, legal_risk: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-[10px] text-surface-400 block">Statutory shields</span>
              </div>

              <div className="p-4 rounded-xl hairline-card space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Compliance (10%)</span>
                  <span className="font-mono text-primary-600">{simCriteria.compliance}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simCriteria.compliance}
                  onChange={(e) => setSimCriteria({ ...simCriteria, compliance: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-[10px] text-surface-400 block">Formal execution</span>
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span>Derivation Result: </span>
                <span className="text-surface-600 dark:text-surface-400">
                  ({simCriteria.clarity}×0.25) + ({simCriteria.completeness}×0.20) + ({simCriteria.fairness}×0.20) + ({simCriteria.legal_risk}×0.25) + ({simCriteria.compliance}×0.10)
                </span>
              </div>
              <div className="font-bold text-sm text-primary-600 dark:text-primary-400">
                = {computedOverall.toFixed(1)} / 100.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: GLOSSARY & FAQ */}
      {activeTab === 'faq' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Glossary */}
          <div className="lg:col-span-6 hairline-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <h4 className="font-heading font-bold text-base text-surface-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                Legal Terms Glossary
              </h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded-lg text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 w-36 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredGlossary.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-surface-50/70 dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800 text-xs space-y-1">
                  <span className="font-bold text-surface-900 dark:text-white block">{item.term}</span>
                  <p className="text-surface-600 dark:text-surface-300 leading-relaxed">{item.def}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: FAQ */}
          <div className="lg:col-span-6 hairline-card p-6 space-y-4">
            <div className="pb-3 border-b border-surface-200 dark:border-surface-800">
              <h4 className="font-heading font-bold text-base text-surface-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary-500" />
                Frequently Asked Architecture Questions
              </h4>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="hairline-card overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left text-xs sm:text-sm font-semibold text-surface-900 dark:text-white flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-surface-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-surface-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-surface-600 dark:text-surface-300 leading-relaxed border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
