'use client'

import './Skeleton.css'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export default function Skeleton({ className = '', width = '100%', height = '20px' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}