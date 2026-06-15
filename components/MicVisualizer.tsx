'use client'
import { useEffect, useRef } from 'react'

interface MicVisualizerProps {
  count?: number
  stream?: MediaStream | null
}

export default function MicVisualizer({ count = 36, stream }: MicVisualizerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLDivElement[]>([])

  // Build bars whenever count changes
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    barsRef.current = []
    for (let i = 0; i < count; i++) {
      const bar = document.createElement('div')
      bar.className = 'bar'
      bar.style.animationDelay = (Math.random() * 1).toFixed(2) + 's'
      bar.style.animationDuration = (0.55 + Math.random() * 0.8).toFixed(2) + 's'
      el.appendChild(bar)
      barsRef.current.push(bar)
    }
  }, [count])

  // Drive bars from real audio when a stream is provided
  useEffect(() => {
    if (!stream) return

    const ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256          // 128 frequency bins
    analyser.smoothingTimeConstant = 0.75
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)
    const bars = barsRef.current

    // Pause CSS keyframe animation while we drive transforms manually
    bars.forEach(bar => { bar.style.animationPlayState = 'paused' })

    let rafId: number
    function tick() {
      analyser.getByteFrequencyData(data)
      const binCap = Math.floor(data.length * 0.6) // focus on voice freq range
      bars.forEach((bar, i) => {
        const bin = Math.floor((i / bars.length) * binCap)
        const amplitude = data[bin] / 255            // 0..1
        const scale = (0.3 + amplitude * 1.1).toFixed(2) // matches CSS: 0.3..1.4
        bar.style.transform = `scaleY(${scale})`
      })
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      source.disconnect()
      ctx.close()
      bars.forEach(bar => {
        bar.style.animationPlayState = ''
        bar.style.transform = ''
      })
    }
  }, [stream])

  return <div ref={ref} className="vis" />
}
