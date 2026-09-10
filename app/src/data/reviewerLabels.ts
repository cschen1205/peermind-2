export function parseReviewerLabel(label: string): { source: string; member: string } {
  const trimmed = label.trim()
  const match = trimmed.match(/^(.+?)\s+-\s+(.+)$/)
  if (match) return { source: match[1].trim(), member: match[2].trim() }
  return { source: trimmed, member: trimmed }
}

export function shortReviewerName(member: string, source: string) {
  if (member === source) return source
  return member.replace(/^Reviewer\s+/i, '').trim() || member
}
