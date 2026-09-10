import { TriangleAlert } from 'lucide-react'

export function ValidationDiagnostic({
  errors,
}: {
  errors: string[]
}) {
  const count = errors.length

  return (
    <section
      className="rounded-[13px] border border-pm-status-refuted/30 bg-pm-status-refuted-fill p-6"
      role="alert"
    >
      <div className="mb-3 flex items-center gap-2 text-pm-status-refuted">
        <TriangleAlert size={18} strokeWidth={1.75} />
        <h3 className="type-h3">Demo package could not be loaded.</h3>
      </div>
      <p className="text-[14px] text-pm-ink">
        {count} validation error{count === 1 ? '' : 's'}:
      </p>
      <ol className="mt-3 list-disc space-y-2 pl-5 text-[14px] text-pm-ink">
        {errors.map((error) => (
          <li key={error} className="type-trace text-[13px]">
            {error}
          </li>
        ))}
      </ol>
    </section>
  )
}
