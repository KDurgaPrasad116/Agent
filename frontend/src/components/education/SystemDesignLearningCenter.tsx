import React, { useMemo, useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { ScoreRing } from '../ui/ScoreRing';

export const SystemDesignLearningCenter: React.FC = () => {
  const { platform } = useLexClearStore();
  const weightEntries = Object.entries(platform.weights || {});
  const [scores, setScores] = useState<Record<string, number>>({});

  const criteria = useMemo(() => {
    if (!weightEntries.length) {
      return [
        { key: 'clarity', weight: 0.25 },
        { key: 'completeness', weight: 0.2 },
        { key: 'fairness', weight: 0.2 },
        { key: 'legal_risk', weight: 0.25 },
        { key: 'compliance', weight: 0.1 },
      ];
    }
    return weightEntries.map(([key, weight]) => ({ key, weight: Number(weight) }));
  }, [platform.weights]);

  const overall = criteria.reduce((sum, c) => {
    const score = scores[c.key] ?? 80;
    return sum + score * c.weight;
  }, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
      <div className="space-y-3">
        <h2 className="font-heading text-3xl font-bold text-surface-900 dark:text-white">
          How the score is built
        </h2>
        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
          A document starts at 100. The server knocks points off when a clause looks unclear,
          incomplete, unfair, legally risky, or out of step with common rules. Weights below are
          whatever the API is using right now{platform.version ? ` (v${platform.version})` : ''}.
        </p>
      </div>

      <div className="hairline-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold">Try the mix yourself</h3>
          <ScoreRing score={overall} size={88} strokeWidth={7} />
        </div>
        {criteria.map((c) => (
          <label key={c.key} className="block space-y-1">
            <span className="text-xs font-medium capitalize flex justify-between">
              <span>{c.key.replace(/_/g, ' ')}</span>
              <span className="text-surface-400">{Math.round(c.weight * 100)}% of the total</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={scores[c.key] ?? 80}
              onChange={(e) => setScores((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))}
              className="w-full"
            />
          </label>
        ))}
      </div>

      <ol className="space-y-4 text-sm text-surface-700 dark:text-surface-300">
        <li>
          <strong>1. Ingest.</strong> PDF, Word, or text is turned into one string. Nothing fancy —
          if the parser can’t read it, you’ll get an error instead of a fake score.
        </li>
        <li>
          <strong>2. Split.</strong> Headings and clause numbers become separate sections so a $10
          liability cap doesn’t get lost in a 40-page blob.
        </li>
        <li>
          <strong>3. Score.</strong> Rule checks fire on each section. You can open the ledger on
          the workspace score tab and see the same math.
        </li>
        <li>
          <strong>4. Rewrite (optional).</strong> Suggested language is just a suggestion. Keeping
          it rescores the file on the server.
        </li>
      </ol>

      <p className="text-xs text-surface-500 border-t border-surface-200 dark:border-surface-800 pt-4">
        {platform.disclaimer}
      </p>
    </div>
  );
};
