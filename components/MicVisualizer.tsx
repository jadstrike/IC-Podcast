'use client'
import { useEffect, useRef } from 'react'

interface MicVisualizerProps {
  count?: number
}

export default function MicVisualizer({ count = 36 }: MicVisualizerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    for (let i = 0; i < count; i++) {
      const bar = document.createElement('div')
      bar.className = 'bar'
      bar.style.animationDelay = (Math.random() * 1).toFixed(2) + 's'
      bar.style.animationDuration = (0.55 + Math.random() * 0.8).toFixed(2) + 's'
      el.appendChild(bar)
    }
  }, [count])

  return <div ref={ref} className="vis" />
}
