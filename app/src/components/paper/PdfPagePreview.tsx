import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { matchingItemIndices } from './matchExcerptItems'
import { highlightClass } from '@/styles/graphStyles'
import { cn } from '@/lib/utils'
import type { SourceRecord } from '@/types/paper'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export function PdfPagePreview({
  file,
  page,
  sources,
  activeSourceIds,
  highlightSourceIds,
  onError,
}: {
  file: string
  page: number
  sources: SourceRecord[]
  activeSourceIds: string[]
  highlightSourceIds?: string[]
  onError?: () => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(480)
  const [textItems, setTextItems] = useState<Array<{ str?: string | null }>>([])
  const selectedId = activeSourceIds[0]
  const watchIds = highlightSourceIds ?? activeSourceIds

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const sync = () => setWidth(el.clientWidth)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const pageSources = useMemo(
    () =>
      sources.filter(
        (source) =>
          watchIds.includes(source.id) && (source.page == null || source.page === page),
      ),
    [page, sources, watchIds],
  )

  const overlayRegions = useMemo(
    () =>
      pageSources.flatMap((source) =>
        (source.highlightRegions ?? [])
          .filter((region) => region.page === page)
          .map((region) => ({
            ...region,
            sourceId: source.id,
            selected: source.id === selectedId,
          })),
      ),
    [page, pageSources, selectedId],
  )

  const selectedHits = useMemo(
    () =>
      matchingItemIndices(
        textItems,
        pageSources.find((source) => source.id === selectedId && !source.highlightRegions?.length)
          ?.excerpt,
      ),
    [pageSources, selectedId, textItems],
  )

  const otherHits = useMemo(() => {
    const hits = new Set<number>()
    for (const source of pageSources) {
      if (source.id === selectedId || source.highlightRegions?.length) continue
      for (const index of matchingItemIndices(textItems, source.excerpt)) hits.add(index)
    }
    return hits
  }, [pageSources, selectedId, textItems])

  return (
    <div ref={boxRef} className="min-h-0 flex-1 overflow-auto">
      <Document
        file={file}
        loading={<p className="p-4 text-[13px] text-pm-muted">Loading manuscript page…</p>}
        error={<p className="p-4 text-[13px] text-pm-muted">Could not render this PDF page.</p>}
        onLoadError={onError}
      >
        <div className="relative mx-auto w-fit">
          <Page
            key={`${file}-${page}-${selectedId}-${[...selectedHits, ...otherHits].join(',')}`}
            pageNumber={page}
            width={Math.max(240, width - 2)}
            renderAnnotationLayer={false}
            onGetTextSuccess={(data) =>
              setTextItems(data.items.map((item) => ({ str: 'str' in item ? item.str : '' })))
            }
            customTextRenderer={({ str, itemIndex }) => {
              if (selectedHits.has(itemIndex)) {
                return `<mark class="pm-pdf-hl-selected">${str}</mark>`
              }
              if (otherHits.has(itemIndex)) {
                return `<mark class="pm-pdf-hl">${str}</mark>`
              }
              return str
            }}
          />
          {overlayRegions.length > 0 ? (
            <div className="pointer-events-none absolute inset-0">
              {overlayRegions.map((region) => (
                <div
                  key={region.id}
                  className={cn(
                    'absolute rounded-[3px]',
                    highlightClass(region.role, region.selected),
                  )}
                  style={{
                    left: `${region.x * 100}%`,
                    top: `${region.y * 100}%`,
                    width: `${region.width * 100}%`,
                    height: `${region.height * 100}%`,
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </Document>
    </div>
  )
}
