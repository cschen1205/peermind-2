import { cn } from '@/lib/utils'
import {
  IMPACT_LEVEL_LABELS,
  SENSITIVITY_LEVEL_LABELS,
  type ImpactLevel,
  type SensitivityLevel,
} from '@/types/finding'
import type { ImpactAssessment } from '@/types/verification'

const LEVEL_TONE: Record<SensitivityLevel, string> = {
  high: 'bg-pm-status-verified-fill text-pm-status-verified',
  moderate: 'bg-pm-status-supported-fill text-pm-status-supported',
  low: 'bg-pm-status-unverified-fill text-pm-status-unverified',
  unknown: 'bg-pm-status-unverified-fill text-pm-status-unverified',
  not_identifiable: 'bg-pm-status-unverified-fill text-pm-status-unverified',
}

function LevelPill({
  label,
  level,
}: {
  label: string
  level: ImpactLevel | SensitivityLevel
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[5px] px-2 py-1 text-[12px] font-bold tracking-[0.02em]',
        LEVEL_TONE[level],
      )}
    >
      {label}
    </span>
  )
}

function levelLabel(level: ImpactLevel | SensitivityLevel): string {
  if (level === 'not_identifiable') return SENSITIVITY_LEVEL_LABELS.not_identifiable
  return IMPACT_LEVEL_LABELS[level]
}

function JudgmentRow({
  title,
  level,
  explanation,
}: {
  title: string
  level: ImpactLevel | SensitivityLevel
  explanation: string
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-4 max-[760px]:grid-cols-1">
      <div className="grid gap-2">
        <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">{title}</p>
        <LevelPill label={levelLabel(level)} level={level} />
      </div>
      <p className="text-[15px] leading-relaxed text-pm-ink">{explanation}</p>
    </div>
  )
}

export function ScopeNecessity({ assessment }: { assessment: ImpactAssessment }) {
  return (
    <div className="grid gap-5">
      <JudgmentRow
        title="Scope relevance"
        level={assessment.scopeRelevance}
        explanation={assessment.scopeExplanation}
      />
      <JudgmentRow
        title="Necessity"
        level={assessment.necessity}
        explanation={assessment.necessityExplanation}
      />
      <JudgmentRow
        title="Sensitivity"
        level={assessment.sensitivity}
        explanation={assessment.sensitivityExplanation}
      />
    </div>
  )
}
