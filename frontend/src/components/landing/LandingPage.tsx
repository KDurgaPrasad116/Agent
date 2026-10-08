import React, { useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge, RiskBadge } from '../ui/Badge';
import { ScoreRing } from '../ui/ScoreRing';
import { InteractiveDiagrams } from '../diagrams/InteractiveDiagrams';
import { SAMPLE_CONTRACTS } from '../../mocks/contracts';
import {
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, loadPresetContract } = useLexClearStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is LexClear a substitute for hiring a qualified attorney?',
      a: 'No. LexClear is an automated informational intelligence platform designed to help professionals and consumers spot risky clauses and understand legalese. It does not provide formal legal representation or legal advice.',
    },
    {
      q: 'How does the scoring formula derive its numbers?',
      a: 'Every document starts from a Base of 100.0 across 5 pillars: Clarity (25%), Completeness (20%), Fairness (20%), Legal Risk (25%), and Compliance (10%). Deductions are mathematically recorded and summed using statutory and contractual rules.',
    },
    {
      q: 'Are confidential agreements sent to third-party AI models?',
      a: 'No. By default, LexClear operates 100% locally in private heuristic mode with an isolated local SQLite database. No contract text is sold, retained, or leaked to public training corpuses.',
    },
    {
      q: 'How does auto-correction avoid modifying business terms?',
      a: 'Our correction engine preserves project milestones, compensation amounts, and role titles while surgically rewriting unbalanced clauses using established statutory mutuality principles.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="pt-8 md:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 dark:text-white leading-[1.1] tracking-tight">
              Audit, demystify and redline{' '}
              <span className="text-primary-600 dark:text-primary-400">contracts</span> in real time.
            </h1>

            <p className="text-base sm:text-lg text-surface-600 dark:text-surface-400 leading-relaxed max-w-xl">
              Deterministic mathematical health scores, clause-level plain-English translations, and surgical statutory redlining. Built for founders, legal ops, and consumers.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => loadPresetContract('predatory-vendor')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Audit a Contract
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setActiveView('generator')}
                leftIcon={<FileText className="w-4 h-4 text-surface-500" />}
              >
                Generate Agreement
              </Button>
            </div>

            {/* Quick Demo Trigger Hint */}
            <div className="pt-3 flex items-center gap-2 text-xs text-surface-500 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Click "Audit a Contract" to test the live Predatory Agreement demo</span>
            </div>
          </div>

          {/* Right Column: Live Interactive Clause Mockup */}
          <div className="lg:col-span-6">
            <div className="hairline-card p-6 md:p-8 space-y-5 shadow-floating bg-surface-50/50 dark:bg-surface-900/90 relative">
              <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-mono font-bold text-surface-700 dark:text-surface-300">
                    Clause 4 • Liability Cap Audit
                  </span>
                </div>
                <RiskBadge scoreOrBand="DANGER" />
              </div>

              {/* Serif Clause Snippet */}
              <div className="p-4 rounded-xl bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-850 font-serif text-sm leading-relaxed text-surface-800 dark:text-surface-200">
                "The Client's aggregate liability shall not exceed{' '}
                <span className="diff-token-del">$10.00</span>. In contrast, the Service Provider shall have{' '}
                <span className="diff-token-del">unlimited liability</span> for any damages."
              </div>

              {/* Micro Explanation Card */}
              <div className="p-4 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-700 dark:text-red-400">Severe Asymmetry Detected</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">-20.0 pts Legal Risk</span>
                </div>
                <p className="text-surface-600 dark:text-surface-300 leading-normal">
                  Statutory mutuality violation: Service provider is exposed to boundless financial ruin while the counterparty is fully immune.
                </p>
                <div className="pt-2 border-t border-red-200/60 dark:border-red-900/40 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Rebalanced: Cap at 12 months fees
                  </span>
                  <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400">
                    Delta: +20.0 pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="border-y border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-surface-900 dark:text-white">Private by Design</div>
              <div className="text-xs text-surface-500">100% offline heuristic mode with private SQLite isolation.</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/80 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-surface-900 dark:text-white">Plain-English Explanations</div>
              <div className="text-xs text-surface-500">Grade 8 plain language summaries and lawyer consultation tips.</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-surface-900 dark:text-white">Transparent Mathematical Scoring</div>
              <div className="text-xs text-surface-500">Every deduction is traceable to a specific statute or risk pattern.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary">Platform Features</Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white">
            Four pillars of contract intelligence
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            A comprehensive suite engineered to replace guesswork with deterministic verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="hairline-card p-6 space-y-4 hover:border-primary-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <ScoreRing score={88} size={28} strokeWidth={4} showLabel={false} />
            </div>
            <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">1. Audit & Score</h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              5-pillar weighted evaluation (Clarity, Completeness, Fairness, Legal Risk, Compliance) with step deduction waterflow.
            </p>
          </div>

          <div className="hairline-card p-6 space-y-4 hover:border-primary-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">2. Demystify & Translate</h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              Slide-out layman drawer translating legalese into practical everyday scenarios with English and Hindi toggle support.
            </p>
          </div>

          <div className="hairline-card p-6 space-y-4 hover:border-primary-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">3. Auto-Correct & Diff</h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              Interactive redline studio offering balanced statutory alternatives. Accept or edit changes and watch the score heal in real time.
            </p>
          </div>

          <div className="hairline-card p-6 space-y-4 hover:border-primary-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">4. Guided Generator</h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              Step-by-step wizard creating custom, legally sound agreements (NDA, Lease, Employment, Service) with pre-export scoring.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS STEPPER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary">Processing Pipeline</Badge>
          <h2 className="font-heading text-3xl font-extrabold text-surface-900 dark:text-white">
            How LexClear processes your agreement
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            A 4-step pipeline that preserves exact character offsets and guarantees zero text truncation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Ingest & Hash', desc: 'Accepts PDF, DOCX, or TXT. Computes SHA-256 digest to verify integrity.' },
            { step: '02', title: 'Clause Slicing', desc: 'Identifies clause boundaries and character offsets without altering wording.' },
            { step: '03', title: 'Statutory Audit', desc: 'Runs 25+ deterministic doctrine checks across Contract and Property Law.' },
            { step: '04', title: 'Surgical Diff', desc: 'Generates word-level redline diff tokens with one-click acceptance.' },
          ].map((s) => (
            <div key={s.step} className="hairline-card p-6 space-y-3">
              <div className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
                STEP {s.step}
              </div>
              <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white">{s.title}</h4>
              <p className="text-xs text-surface-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE ENGINEERING SCHEMATICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <InteractiveDiagrams />
      </section>

      {/* 6. SAMPLE BENCHMARK CONTRACTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary">Interactive Benchmarks</Badge>
          <h2 className="font-heading text-3xl font-extrabold text-surface-900 dark:text-white">
            Try a pre-loaded contract audit
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Experience the scoring dial, clause inspector, and live redline studio in one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {SAMPLE_CONTRACTS.map((sample) => (
            <div
              key={sample.id}
              className="hairline-card p-6 flex flex-col justify-between hover:border-primary-500 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={sample.initialScore >= 75 ? 'success' : 'danger'}>
                    {sample.category}
                  </Badge>
                  <RiskBadge scoreOrBand={sample.initialScore} showScore />
                </div>
                <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">
                  {sample.title}
                </h3>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  {sample.subtitle}
                </p>
              </div>

              <div className="pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => loadPresetContract(sample.id)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Load in Analyzer Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl font-bold text-surface-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="hairline-card overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left text-sm font-semibold text-surface-900 dark:text-white flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-surface-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-400" />
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
      </section>

      {/* 8. FINAL CTA BAND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hairline-card bg-surface-900 text-white p-8 md:p-12 text-center space-y-6 max-w-4xl mx-auto border-surface-800">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight">
            Ready to audit your legal contracts?
          </h2>
          <p className="text-sm text-surface-300 max-w-xl mx-auto leading-relaxed">
            Gain complete clarity over commercial commitments, identify predatory clauses, and rebalance agreements with confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => loadPresetContract('predatory-vendor')}
            >
              Analyze Benchmark Document
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setActiveView('generator')}
            >
              Draft New Agreement
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
