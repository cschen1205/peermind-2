import { Link } from 'react-router-dom'
import { StatusPill } from '@/components/StatusPill'
import { SourceLink } from '@/components/paper/SourceLink'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SENSITIVITY_LABELS } from '@/components/counterfactual/SensitivityResult'
import { getInvestigation } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { FindingRecord } from '@/types/finding'

export function FindingReportCard({
  finding,
  pkg,
}: {
  finding: FindingRecord
  pkg: DemoDataPackage
}) {
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const openAsk = useDemoStore((s) => s.openAsk)
  const hasInvestigation = Boolean(getInvestigation(pkg, finding.id))
  const sourceIds = [
    ...finding.sourceIds,
    ...finding.evidenceFor.flatMap((item) => item.sourceIds),
    ...finding.evidenceAgainst.flatMap((item) => item.sourceIds),
  ]
  const uniqueSources = [...new Set(sourceIds)]

  return (
    <Card className="report-card rounded-[11px] p-[22px] shadow-none ring-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] text-pm-accent">{finding.id}</span>
        <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
          {finding.category}
        </span>
        <StatusPill status={finding.validity} className="ml-auto" />
      </div>
      <p className="type-quote mt-4 text-[22px]">{finding.critique}</p>

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
        <p>
          <span className="font-[650]">Importance: </span>
          {finding.importance.level}. {finding.importance.explanation}
        </p>
        {finding.sensitivity ? (
          <p>
            <span className="font-[650]">Sensitivity: </span>
            {SENSITIVITY_LABELS[finding.sensitivity.status]}. {finding.sensitivity.explanation}
          </p>
        ) : null}
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
        <Link to={`/challenge/${finding.id}`}>
          <Button
            variant="secondary"
            size="sm"
            className={cn(!hasInvestigation && 'opacity-90')}
            onClick={() =>
              focusSelection({ sourceIds: finding.sourceIds, findingId: finding.id })
            }
          >
            Inspect investigation
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          disabled={uniqueSources.length === 0}
          onClick={() => {
            const first = uniqueSources[0]
            if (!first) return
            focusSelection({ sourceIds: uniqueSources, findingId: finding.id })
            document.getElementById(`source-card-${first}`)?.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth',
            })
          }}
        >
          Open source
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openAsk('finding', [finding.id])}
        >
          Ask about this finding
        </Button>
      </div>
    </Card>
  )
}
