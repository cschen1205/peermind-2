import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-[8px] bg-[#f8f9fc] px-6 py-8 text-center">
      {icon ? <div className="mb-3 text-pm-muted">{icon}</div> : null}
      <h3 className="type-h3 text-pm-ink">{title}</h3>
      <p className="mt-3 max-w-[52ch] text-[14px] text-pm-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
