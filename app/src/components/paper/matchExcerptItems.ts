function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[\u00ad-]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function matchingItemIndices(
  items: Array<{ str?: string | null }>,
  excerpt?: string,
): Set<number> {
  const hits = new Set<number>()
  const needle = normalize(excerpt ?? '')
  if (needle.length < 12) return hits

  let haystack = ''
  const spans: { index: number; start: number; end: number }[] = []
  items.forEach((item, index) => {
    const piece = normalize(item.str ?? '')
    if (!piece) return
    if (haystack) haystack += ' '
    const start = haystack.length
    haystack += piece
    spans.push({ index, start, end: haystack.length })
  })

  const candidates = [needle, needle.split(' ').slice(0, 14).join(' ')].filter(
    (value, index, all) => value.length >= 12 && all.indexOf(value) === index,
  )

  for (const candidate of candidates) {
    const start = haystack.indexOf(candidate)
    if (start < 0) continue
    const end = start + candidate.length
    for (const span of spans) {
      if (span.end > start && span.start < end) hits.add(span.index)
    }
    if (hits.size > 0) return hits
  }

  return hits
}
