export function CalibratedComment({
  original,
  calibrated,
}: {
  original: string
  calibrated?: string
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
      <div>
        <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
          Original critique
        </p>
        <p className="type-quote-sm mt-2">{original}</p>
      </div>
      <div>
        <p className="text-[12px] font-bold tracking-[0.15em] text-pm-accent uppercase">
          Calibrated comment
        </p>
        {calibrated ? (
          <p className="type-quote-sm mt-2">{calibrated}</p>
        ) : (
          <p className="mt-2 text-[14px] text-pm-muted">
            No calibrated comment is prepared for this finding.
          </p>
        )}
      </div>
    </div>
  )
}
