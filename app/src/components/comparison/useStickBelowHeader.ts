import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

const GAP = 16

export function useStickBelowHeader() {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(GAP)
  const [narrow, setNarrow] = useState(false)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const header = document.querySelector('header')
    const scroller = node.closest('main')
    const media = window.matchMedia('(max-width: 1100px)')

    const update = () => {
      setNarrow(media.matches)
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0
      const scrollportTop = scroller?.getBoundingClientRect().top ?? 0
      const covered = Math.max(0, headerBottom - scrollportTop)
      setOffset(covered + GAP)
    }

    update()
    scroller?.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    media.addEventListener('change', update)
    return () => {
      scroller?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      media.removeEventListener('change', update)
    }
  }, [])

  const style: CSSProperties | undefined = narrow
    ? undefined
    : {
        top: offset,
        maxHeight: `calc(100svh - ${offset}px - 24px)`,
      }

  return { ref, style }
}
