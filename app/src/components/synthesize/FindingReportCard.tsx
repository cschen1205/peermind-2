import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { SourceLink } from '@/components/paper/SourceLink'
import { CalibratedComment } from '@/components/synthesize/CalibratedComment'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getImpactAssessment, getVerification } from '@/data/queryPackage'
import {
  IMPACT_LEVEL_LABELS,
  SENSITIVITY_LEVEL_LABELS,
  SEVERITY_LEVEL_LABELS,
} from '@/types/finding'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { FindingRecord } from '@/types/finding'

export function FindingReportCard({
  finding,
  pkg,
  defaultExpanded = false,
  onOpenSource,
}: {
  finding: FindingRecord
  pkg: DemoDataPackage
  defaultExpanded?: boolean
  onOpenSource: (findingId: string) => void
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const openAsk = useDemoStore((s) => s.openAsk)
  const hasVerification = Boolean(getVerification(pkg, finding.id))
  const impact = getImpactAssessment(pkg, finding.id)
  const sourceIds = [
    ...finding.sourceIds,
    ...finding.evidenceFor.flatMap((item) => item.sourceIds),
    ...finding.evidenceAgainst.flatMap((item) => item.sourceIds),
  ]
  const uniqueSources = [...new Set(sourceIds)]

  return (
    <Card className="report-card rounded-[11px] p-[22px] shadow-none ring-0">
      <button
        type="button"
        className="flex w-full flex-wrap items-center gap-2 text-left"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span className="font-mono text-[12px] text-pm-accent">{finding.id}</span>
        <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
          {finding.category}
        </span>
        <StatusPill status={finding.status} kind="status" className="ml-auto" />
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={cn(
            'text-pm-muted transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {!expanded ? (
        <p className="type-quote-sm mt-4 print:hidden">{finding.critique}</p>
      ) : null}

      <div className={cn(!expanded && 'hidden print:block')}>
        <CalibratedComment original={finding.critique} calibrated={finding.calibratedComment} />
        <div className="mt-5 grid gap-3 text-[14px]">
            {finding.evidenceFor.length > 0 ? (
              <p>
                <span className="font-[650]">Evidence: </span>
                {finding.evidenceFor.map((item) => item.summary).join(' ')}
              </p>
            ) : null}
            {finding.evidenceAgainst.length > 0 ? (
              <p>
                <span className="font-[650]">Counter-evidence: </span>
                {finding.evidenceAgainst.map((item) => item.summary).join(' ')}
              </p>
            ) : null}
            {finding.missingEvidence.length > 0 ? (
              <p>
                <span className="font-[650]">Gaps: </span>
                {finding.missingEvidence.join(' ')}
              </p>
            ) : null}
            {impact ? (
              <p>
                <span className="font-[650]">Scope / necessity / sensitivity: </span>
                {IMPACT_LEVEL_LABELS[impact.scopeRelevance]} / {IMPACT_LEVEL_LABELS[impact.necessity]}{' '}
                / {SENSITIVITY_LEVEL_LABELS[impact.sensitivity]}
              </p>
            ) : null}
            <p>
              <span className="font-[650]">Final severity: </span>
              {SEVERITY_LEVEL_LABELS[finding.finalSeverity]}
            </p>
            {finding.limitations.length > 0 ? (
              <p>
                <span className="font-[650]">Limits: </span>
                {finding.limitations.join(' ')}
              </p>
            ) : null}
          </div>

          {uniqueSources.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-pm-muted">Sources</span>
              {uniqueSources.map((id) => (
                <SourceLink key={id} sourceId={id} />
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2 no-print">
            <Link to={`/verify/${finding.id}`}>
              <Button
                variant="secondary"
                size="sm"
                className={cn(!hasVerification && 'opacity-90')}
                onClick={() =>
                  focusSelection({ sourceIds: finding.sourceIds, findingId: finding.id })
                }
              >
                Inspect verification
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenSource(finding.id)}
            >
              Open source
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openAsk('synthesis', [finding.id])}
            >
              Ask about this finding
            </Button>
          </div>
      </div>
    </Card>
  )
}
