import { CONFERENCE_STYLE_LABELS } from '@/data/reviewStyles'
import type { ReviewRating, SynthesisDefinition } from '@/types/demoPackage'
import type { PaperMetadata } from '@/types/paper'

function slugFromPaper(paper: PaperMetadata) {
  const raw = paper.id || paper.title
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'paper'
}

function formatRating(rating: ReviewRating) {
  return `${rating.label}: ${rating.score} / ${rating.scale} — ${rating.scaleLabel}`
}

function prose(text: string) {
  return text.trim()
}

function bullets(items: string[]) {
  return items.map((item) => `- ${item.trim()}`).join('\n')
}

function numbered(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item.trim()}`).join('\n')
}

function section(title: string, body: string | undefined) {
  if (!body?.trim()) return ''
  return `## ${title}\n\n${body.trim()}\n`
}

export function conferenceReviewFileName(paper: PaperMetadata) {
  return `${slugFromPaper(paper)}-calibrated-review.md`
}

export function conferenceReviewMarkdown(
  paper: PaperMetadata,
  synthesis: SynthesisDefinition,
): string {
  const authors = (paper.authors ?? []).join(', ')
  const venueLine = [paper.venue, paper.year].filter(Boolean).join(' · ')
  const header = [
    '# Calibrated conference review',
    '',
    `**Paper:** ${paper.title}`,
    authors ? `**Authors:** ${authors}` : '',
    venueLine ? `**Venue:** ${venueLine}` : '',
    `**Conference style:** ${CONFERENCE_STYLE_LABELS[synthesis.conferenceStyle]}`,
  ]
    .filter((line) => line !== '')
    .join('\n')

  const scores =
    synthesis.ratings && synthesis.ratings.length > 0
      ? section('Official review scores', bullets(synthesis.ratings.map(formatRating)))
      : ''

  const parts = [
    header,
    '',
    scores,
    section('Summary', prose(synthesis.summary)),
    synthesis.strengths.length > 0 ? section('Strengths', bullets(synthesis.strengths)) : '',
    synthesis.majorWeaknesses.length > 0
      ? section('Major weaknesses', numbered(synthesis.majorWeaknesses))
      : '',
    synthesis.minorWeaknesses.length > 0
      ? section('Minor weaknesses', numbered(synthesis.minorWeaknesses))
      : '',
    synthesis.authorQuestions.length > 0
      ? section('Questions for authors', numbered(synthesis.authorQuestions))
      : '',
    synthesis.evidenceNotes && synthesis.evidenceNotes.length > 0
      ? section('Comments', bullets(synthesis.evidenceNotes))
      : '',
    synthesis.recommendation ? section('Overall assessment', prose(synthesis.recommendation)) : '',
    synthesis.confidence ? section('Confidence', prose(synthesis.confidence)) : '',
  ]

  return parts.filter(Boolean).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

export function downloadTextFile(fileName: string, text: string, mimeType = 'text/markdown') {
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
