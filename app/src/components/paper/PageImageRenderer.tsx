import { EmptyState } from '@/components/EmptyState'
import type { PaperMetadata, SourceRecord } from '@/types/paper'

export function PageImageRenderer({
  paper,
}: {
  paper: PaperMetadata
  sourceRecords: SourceRecord[]
  activeSourceIds: string[]
}) {
  return (
    <EmptyState
      title="Page images are not attached"
      description={
        paper.previewMode === 'page_images'
          ? 'This package asks for page images, but no rendered assets are bundled. Excerpts are shown instead.'
          : 'Page-image preview is available when the package includes pre-rendered pages.'
      }
    />
  )
}
