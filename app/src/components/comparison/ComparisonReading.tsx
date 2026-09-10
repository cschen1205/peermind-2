import { getFinding } from '@/data/queryPackage'
import type { ComparisonResult } from '@/types/comparison'
import type { DemoDataPackage } from '@/types/demoPackage'

export function ComparisonReading({
  pkg,
  result,
}: {
  pkg: DemoDataPackage
  result: ComparisonResult
}) {
  const peerMindOnly = result.themes.filter((theme) => theme.relation === 'peermind_only')
  const examples = peerMindOnly
    .map((theme) => {
      const finding = theme.peerMindFindingIds
        .map((id) => getFinding(pkg, id))
        .find((item) => item !== undefined)
      if (!finding) return undefined
      return { id: finding.id, status: finding.status, critique: finding.critique }
    })
    .filter((item) => item !== undefined)

  return (
    <section className="mt-6 rounded-[11px] border border-pm-line bg-pm-surface p-6">
      <p className="eyebrow">How to read this result</p>
      <h2 className="type-h3 mt-2">PeerMind is better as a verifier, not as a longer comment list</h2>
      <p className="mt-3 max-w-[72ch] text-[14px] leading-relaxed text-pm-ink">
        ChatGPT is one unchecked independent review in this demo. It can misread a table, merge
        distinct claims, or miss appendix evidence. Do not treat the ChatGPT column as ground
        truth, and do not treat extra ChatGPT bullets as PeerMind failures.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-4 max-[1100px]:grid-cols-1">
        <div>
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Shared weaknesses
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">
            {result.summary.sharedCount} load-bearing claims also appear in ChatGPT or OpenReview.
            PeerMind keeps those claims and adds an evidence verdict and impact. Agreement here is
            the comparison, not a ChatGPT score.
          </p>
        </div>
        <div>
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            ChatGPT can be wrong
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">
            In this run ChatGPT bundled scale, uncertainty, and the +9.2 table mismatch into one
            language-model weakness. It also never raised the Figure 2 pair-count discrepancy or
            the language ID/OOD protocol as separate claims. Those gaps are omissions, not extra
            credit.
          </p>
        </div>
        <div>
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            PeerMind-only checks
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">
            {peerMindOnly.length} locked findings were not raised as weaknesses by the uploaded
            reviews. That is where verification adds something a generated review missed or
            misframed.
          </p>
        </div>
      </div>
      {examples.length > 0 ? (
        <ul className="mt-5 grid gap-2">
          {examples.map((example) => (
            <li key={example.id} className="text-[14px] leading-relaxed text-pm-ink">
              <span className="font-mono text-[12px] font-bold text-pm-accent">{example.id}</span>
              {example.status === 'refuted' ? (
                <span className="text-pm-muted"> · a reviewer-style claim that does not survive source audit. </span>
              ) : (
                <span className="text-pm-muted"> · </span>
              )}
              {example.critique}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-5 max-w-[72ch] text-[13px] leading-relaxed text-pm-muted">
        Reviewer-only weaknesses are verified with the same status rules. Open questions stay in
        the second table; they are asks, not proof that PeerMind missed a defect.
      </p>
    </section>
  )
}
