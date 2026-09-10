import { useState } from 'react'
import { EvidenceList } from './EvidenceList'
import { PageImageRenderer } from './PageImageRenderer'
import { PdfPagePreview } from './PdfPagePreview'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { PaperMetadata, SourceRecord } from '@/types/paper'

export type PaperPreviewFocus =
  | 'paper'
  | 'claim'
  | 'evidence'
  | 'counter_evidence'
  | 'comparison'

export function PaperPreview({
  paper,
  sourceRecords,
  activeSourceIds,
  highlightSourceIds,
  pkg,
  onSourceSelect,
  hideEyebrow = false,
  showEvidenceList = true,
  className,
}: {
  paper: PaperMetadata
  sourceRecords: SourceRecord[]
  activeSourceIds: string[]
  highlightSourceIds?: string[]
  focusMode?: PaperPreviewFocus
  pkg: DemoDataPackage
  onSourceSelect: (sourceId: string) => void
  hideEyebrow?: boolean
  showEvidenceList?: boolean
  className?: string
}) {
  const uploadedPaperUrl = useDemoStore((s) => s.uploadedPaperUrl)
  const [pdfFailed, setPdfFailed] = useState(false)
  const primaryId = activeSourceIds[0]
  const primary = sourceRecords.find((source) => source.id === primaryId)
  const paperUrl = uploadedPaperUrl ?? paper.pdfAsset
  const page = primary?.page
  const pdfSrc = paperUrl && page ? `${paperUrl}#page=${page}` : paperUrl
  const fillPreview = hideEyebrow || !showEvidenceList
  const usePdfRenderer = paper.previewMode === 'pdf' && Boolean(paperUrl) && !pdfFailed

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      {hideEyebrow ? null : <p className="eyebrow mb-3">Paper preview</p>}
      {usePdfRenderer && paperUrl ? (
        <div
          className={cn(
            'flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-pm-line bg-white',
            fillPreview ? 'min-h-[240px] flex-1' : 'mb-3 h-[min(42vh,380px)]',
            showEvidenceList && fillPreview && 'mb-3',
          )}
        >
          <PdfPagePreview
            file={paperUrl}
            page={page ?? 1}
            sources={sourceRecords}
            activeSourceIds={activeSourceIds}
            highlightSourceIds={highlightSourceIds}
            onError={() => setPdfFailed(true)}
          />
        </div>
      ) : null}
      {!usePdfRenderer && paper.previewMode === 'pdf' && pdfSrc ? (
        <iframe
          key={pdfSrc}
          title={paper.title}
          src={pdfSrc}
          className={cn(
            'w-full rounded-[8px] border border-pm-line bg-white',
            fillPreview ? 'min-h-[240px] flex-1' : 'mb-3 h-[min(42vh,380px)]',
            showEvidenceList && fillPreview && 'mb-3',
          )}
        />
      ) : null}
      {paper.previewMode === 'page_images' ? (
        <PageImageRenderer
          paper={paper}
          sourceRecords={sourceRecords}
          activeSourceIds={activeSourceIds}
        />
      ) : null}
      {showEvidenceList ? (
        <EvidenceList
          sourceRecords={sourceRecords}
          activeSourceIds={activeSourceIds}
          pkg={pkg}
          onSourceSelect={onSourceSelect}
          showEyebrow={false}
          className={fillPreview ? undefined : 'h-[min(58vh,520px)] flex-none'}
        />
      ) : null}
    </div>
  )
}
