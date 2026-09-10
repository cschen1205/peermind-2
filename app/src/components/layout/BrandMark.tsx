import { Link } from 'react-router-dom'

export function BrandMark({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 text-pm-ink no-underline">
      <span
        className="grid size-[34px] place-items-center rounded-[10px] bg-pm-accent text-[21px] font-bold text-white"
        aria-hidden="true"
      >
        P
      </span>
      <span className="text-[23px] font-[750] tracking-[-0.06em]">PeerMind</span>
    </Link>
  )
}
