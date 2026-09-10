import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { FindingReportCard } from '@/components/report/FindingReportCard'
import { TrustProfile } from '@/components/report/TrustProfile'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { trustProfileCounts } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { FindingValidity } from '@/types/finding'

type ReportFilter = 'all' | FindingValidity

const FILTERS: { id: ReportFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified' },
  { id: 'supported', label: 'Supported' },
  { id: 'refuted', label: 'Refuted' },
  { id: 'unverified', label: 'Unverified' },
  { id: 'human_required', label: 'Human Required' },
]

export function ReportPage() {
  const pkg = useDemoStore((s) => s.package)
  const lockedRun = useDemoStore((s) => s.lockedRun)
  const lockRun = useDemoStore((s) => s.lockRun)
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ReportFilter>('all')
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!pkg) return null

  const counts = trustProfileCounts(pkg.findings)
  const findings =
    filter === 'all' ? pkg.findings : pkg.findings.filter((item) => item.validity === filter)

  function handleLock() {
    lockRun()
    setConfirmOpen(false)
    navigate('/compare')
  }

  return (
    <WorkflowLayout stage="report">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">05 / Report</p>
          <h1 className="type-h1">Evidence before confidence</h1>
        </div>
        <Button variant="secondary" className="no-print" onClick={() => window.print()}>
          Export
        </Button>
      </div>

      <Card className="grid gap-5 p-6 shadow-none ring-0">
        <div>
          <p className="eyebrow mb-3">Paper</p>
          <h2 className="type-h3">{pkg.paper.title}</h2>
          <p className="mt-2 text-[14px] text-pm-muted">
            {(pkg.paper.authors ?? []).join(', ')}
            {pkg.paper.venue ? ` · ${pkg.paper.venue}` : ''}
            {pkg.paper.year ? ` · ${pkg.paper.year}` : ''}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Review summary</p>
          <p className="max-w-[80ch] text-[15px] leading-relaxed text-pm-ink">{pkg.report.summary}</p>
        </div>
      </Card>

      <div className="mt-8">
        <TrustProfile counts={counts} />
      </div>

      <div className="mt-8">
        <p className="eyebrow mb-3">Filter</p>
        <div className="flex flex-wrap gap-2 no-print">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'rounded-[5px] px-2 py-1 text-[12px] font-bold',
                filter === item.id
                  ? 'bg-pm-accent-soft text-pm-accent'
                  : 'bg-pm-status-unverified-fill text-pm-muted-2',
              )}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          {findings.length === 0 ? (
            <p className="text-[14px] text-pm-muted">No findings match this filter.</p>
          ) : (
            findings.map((finding) => (
              <FindingReportCard key={finding.id} finding={finding} pkg={pkg} />
            ))
          )}
        </div>
      </div>

      <Card className="mt-8 p-6 shadow-none ring-0 no-print">
        <p className="eyebrow mb-3">PeerMind run lock</p>
        {lockedRun ? (
          <div>
            <p className="flex items-center gap-2 text-[15px] font-[650]">
              <Lock size={16} strokeWidth={1.75} />
              Locked
            </p>
            <p className="type-trace mt-2 text-pm-muted">{lockedRun.runId}</p>
            <p className="mt-1 text-[13px] text-pm-muted">{lockedRun.lockedAt}</p>
            <Button className="mt-4" onClick={() => navigate('/compare')}>
              Compare reviews →
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-[52ch] text-[14px] text-pm-muted">
              Lock this run before loading independent comparison reviews. The generated review
              will not change after lock.
            </p>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              <Lock size={16} strokeWidth={1.75} />
              Lock and Compare
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lock this run?</DialogTitle>
            <DialogDescription>
              Independent reviews are loaded only after the PeerMind run is locked. The generated
              review will not change.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLock}>Lock and Compare</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkflowLayout>
  )
}
