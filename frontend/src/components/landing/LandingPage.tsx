import React, { useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  FileText,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lock,
  Scale,
  PenLine,
  Search,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, loadSampleContract, samples, platform, backendStatus, isLoading } =
    useLexClearStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does this replace a lawyer?',
      a: 'No. It flags one-sided wording and translates dense clauses into everyday language. For anything you might sign, talk to counsel.',
    },
    {
      q: 'Where does the score come from?',
      a: platform.weights && Object.keys(platform.weights).length
        ? `Each file starts at 100. Points come off five areas: ${Object.entries(platform.weights)
            .map(([k, v]) => `${k.replace(/_/g, ' ')} (${Math.round(Number(v) * 100)}%)`)
            .join(', ')}. The breakdown is on the score tab after you open a file.`
        : 'Each file starts at 100. Points come off five areas such as fairness and legal risk. You can see every deduction after you open a file.',
    },
    {
      q: 'Does my contract leave this computer?',
      a: 'By default it stays in a local database on this machine. You can delete a file, or wipe everything, from the export dialog.',
    },
    {
      q: 'Will rewrites change prices or dates?',
      a: 'Suggested edits aim at balance — notice periods, liability, termination — not at inventing new commercial terms. You can reject or rewrite any suggestion before export.',
    },
  ];

  const firstSample = samples[0];

  return (
    <div className="space-y-20 pb-16">
      <section className="pt-6 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold tracking-wide text-primary-700 dark:text-primary-300 uppercase">
              Contract reader for people who did not go to law school
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white leading-[1.12] tracking-tight">
              See the unfair parts before you sign.
            </h1>
            <p className="text-base text-surface-600 dark:text-surface-400 leading-relaxed max-w-xl">
              Drop in a PDF, Word file, or pasted text. LexClear splits it into clauses, scores the
              rough edges, and offers a plainer rewrite you can accept or ignore.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                loading={isLoading}
                onClick={() => {
                  if (firstSample && backendStatus === 'online') {
                    loadSampleContract(firstSample.id);
                  } else {
                    setActiveView('workspace');
                  }
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {firstSample ? `Try “${firstSample.title}”` : 'Open the workspace'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setActiveView('generator')}
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Draft a new agreement
              </Button>
            </div>

            {backendStatus === 'offline' && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                The API isn’t running. Start the backend, then refresh — samples and scoring need it.
              </p>
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="hairline-card p-6 md:p-8 space-y-4 bg-white dark:bg-surface-900">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-surface-700 dark:text-surface-200">
                  What a one-sided cap looks like
                </span>
                <Badge variant="danger">High risk</Badge>
              </div>
              <p className="font-serif text-sm leading-relaxed text-surface-800 dark:text-surface-200">
                “The Client’s liability shall not exceed{' '}
                <span className="diff-token-del">$10.00</span>. The Service Provider shall have{' '}
                <span className="diff-token-del">unlimited liability</span>.”
              </p>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                In plain terms: they barely pay if they cause harm; you can be on the hook for
                everything. A fairer version usually caps both sides at a multiple of fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: <Lock className="w-5 h-5" />,
            title: 'Stays on this machine',
            body: 'Files land in local storage. Nothing is sold, and you can wipe it.',
          },
          {
            icon: <BookOpen className="w-5 h-5" />,
            title: 'Plain language',
            body: 'Click a clause and get what it actually does to you, plus questions to ask a lawyer.',
          },
          {
            icon: <Scale className="w-5 h-5" />,
            title: 'A score you can audit',
            body: 'Every deduction points at a sentence. No mystery number.',
          },
        ].map((item) => (
          <div key={item.title} className="hairline-card p-5 space-y-2">
            <div className="text-primary-600 dark:text-primary-400">{item.icon}</div>
            <h3 className="font-heading font-semibold text-sm text-surface-900 dark:text-white">
              {item.title}
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            Four things it actually does
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
            Same workflow you’d expect from a careful junior associate, minus the billable hour.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Search className="w-4 h-4" />, title: 'Read & score', body: 'Splits the file and marks clauses that look one-sided or incomplete.' },
            { icon: <BookOpen className="w-4 h-4" />, title: 'Explain', body: 'Turns legal English into what happens if you miss a deadline or get sued.' },
            { icon: <PenLine className="w-4 h-4" />, title: 'Suggest edits', body: 'Shows original vs rewrite. Keep, skip, or type your own line.' },
            { icon: <FileText className="w-4 h-4" />, title: 'Draft from a template', body: 'Fill names and numbers. The generator uses the server’s template list.' },
          ].map((card) => (
            <div key={card.title} className="hairline-card p-5 space-y-3">
              <div className="text-primary-600">{card.icon}</div>
              <h3 className="font-heading font-semibold text-sm">{card.title}</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {samples.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-surface-900 dark:text-white">
              Sample files on disk
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
              These come from the project’s samples folder, not from canned scores in the browser.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                disabled={isLoading || backendStatus !== 'online'}
                onClick={() => loadSampleContract(sample.id)}
                className="hairline-card p-5 text-left space-y-3 hover:border-primary-400 transition-colors disabled:opacity-60"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="neutral">{sample.category}</Badge>
                  <span className="text-[11px] text-surface-400 uppercase">{sample.file_type}</span>
                </div>
                <h3 className="font-heading font-semibold text-base text-surface-900 dark:text-white">
                  {sample.title}
                </h3>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-3">
                  {sample.description}
                </p>
                <span className="text-xs font-semibold text-primary-600 inline-flex items-center gap-1">
                  Open and score <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-3xl space-y-4">
        <h2 className="font-heading text-2xl font-bold text-surface-900 dark:text-white">
          Straight answers
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={faq.q} className="hairline-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left text-sm font-semibold flex items-center justify-between gap-3"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="hairline-card p-8 md:p-10 text-center space-y-4 bg-surface-900 text-white border-surface-800">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold">Bring a contract. We’ll mark it up.</h2>
        <p className="text-sm text-surface-300 max-w-lg mx-auto">{platform.disclaimer}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button variant="primary" size="lg" onClick={() => setActiveView('workspace')}>
            Go to workspace
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setActiveView('generator')}>
            Start from a template
          </Button>
        </div>
      </section>
    </div>
  );
};
