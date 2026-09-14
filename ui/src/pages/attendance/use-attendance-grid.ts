import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { fitAttendanceGrid } from './attendance-grid'

export function useAttendanceGrid(count: number, fullscreen: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 1, height: 1 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element || !fullscreen) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [fullscreen, count])

  const layout = fitAttendanceGrid(count, size.width, size.height)
  const style: CSSProperties | undefined = fullscreen ? {
    '--attendance-columns': layout.columns,
    '--attendance-rows': layout.rows,
    '--attendance-name-size': `${Math.max(8, Math.min(18, layout.cardHeight * 0.11))}px`,
  } as CSSProperties : undefined
  return { ref, style }
}
