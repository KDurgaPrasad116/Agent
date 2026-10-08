import React, { useState } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { ScoreRing } from '../ui/ScoreRing';
import { Badge, RiskBadge } from '../ui/Badge';
import {
  ShieldAlert,
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ScorePanel: React.FC = () => {
  const { analyzeData, setSelectedClauseId, setWorkspaceTab } = useLexClearStore();
  const [showRadar, setShowRadar] = useState(true);
  const [showDerivation, setShowDerivation] = useState(true);

  if (!analyzeData) return null;

  const { overall_score, risk_band, breakdown } = analyzeData;

  // Dynamic criteria mapping directly from backend evaluation payload
  const criteriaList = Object.entries(breakdown.criteria || {}).map(([key, data]) => ({
    key,
    label: (data.criterion || key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    weight: data.weight || 0,
    data,
  }));

  const criteriaCount = Math.max(3, criteriaList.length);
  const radarScores = criteriaList.map((c) => c.data?.score ?? 50);
  const size = 180;
  const center = size / 2;
  const radius = center - 25;

  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 * index) / criteriaCount - Math.PI / 2;
    const r = (score / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = radarScores
    .map((score, i) => {
      const { x, y } = getCoordinates(i, score);
      return `${x},${y}`;
    })
    .join(' ');

  const baselinePoints = criteriaList
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 100);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Overall Score Banner */}
      <div className="flex items-center justify-between pb-5 border-b border-surface-200 dark:border-surface-800">
        <ScoreRing score={overall_score} size={92} strokeWidth={8} />

        <div className="text-right space-y-1">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider block">
            Document Health
          </span>
          <RiskBadge scoreOrBand={overall_score} showScore />
          <div className="text-[11px] font-mono text-surface-400">
            {breakdown.total_deductions_count} total deductions recorded
          </div>
        </div>
      </div>

      {/* 5 Evaluation Pillars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider">
            5 Evaluation Pillars
          </span>
          <span className="text-[11px] font-mono text-surface-400">Sum = 100%</span>
        </div>

        <div className="space-y-2.5">
          {criteriaList.map(({ key, label, weight, data }) => {
            const score = data?.score ?? 100;
            const barColor =
              score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

            return (
              <div key={key} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-surface-700 dark:text-surface-300">
                    {label}{' '}
                    <span className="text-[11px] text-surface-400 font-mono">
                      ({Math.round(weight * 100)}%)
                    </span>
                  </span>
                  <span className="font-mono font-bold text-surface-900 dark:text-white">
                    {score.toFixed(1)} / 100
                  </span>
                </div>
                <div className="w-full bg-surface-200 dark:bg-surface-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(4, score)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Radar Chart */}
      <div className="hairline-card p-4 space-y-3 bg-surface-50/60 dark:bg-surface-950/40">
        <button
          onClick={() => setShowRadar(!showRadar)}
          className="flex items-center justify-between w-full text-xs font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider"
        >
          <span>Pillars Radar Polygon</span>
          {showRadar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showRadar && (
          <div className="flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
              {/* Baseline Ring */}
              <polygon
                points={baselinePoints}
                className="fill-surface-200/40 dark:fill-surface-800/30 stroke-surface-300 dark:stroke-surface-700 stroke-1"
              />
              {/* Actual Document Polygon */}
              <polygon
                points={polygonPoints}
                className="fill-primary-500/30 stroke-primary-600 dark:stroke-primary-400 stroke-2"
              />
              {/* Points */}
              {radarScores.map((score, i) => {
                const { x, y } = getCoordinates(i, score);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={3.5}
                    className="fill-primary-600 dark:fill-primary-400 stroke-white dark:stroke-surface-900 stroke-1"
                  />
                );
              })}
            </svg>

            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-surface-500 pt-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-300 dark:bg-surface-700" /> 100.0 Baseline
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" /> Current Audit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Mathematical Derivation Ledger */}
      <div className="hairline-card p-4 space-y-3 bg-surface-50/60 dark:bg-surface-950/40">
        <button
          onClick={() => setShowDerivation(!showDerivation)}
          className="flex items-center justify-between w-full text-xs font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-primary-500" />
            Mathematical Derivation Ledger
          </span>
          {showDerivation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDerivation && (
          <div className="space-y-2 pt-1 font-mono text-[11px] text-surface-600 dark:text-surface-300 leading-relaxed">
            <div className="p-2.5 rounded-lg bg-surface-100 dark:bg-surface-900 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-800">
              <span className="text-[10px] text-surface-400 block pb-1">CANONICAL FORMULA:</span>
              {breakdown.formula}
            </div>

            <div className="space-y-1.5 pl-1">
              {breakdown.step_by_step_derivation.map((step, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-primary-500 font-bold">›</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
