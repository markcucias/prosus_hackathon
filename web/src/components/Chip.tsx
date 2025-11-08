import React from 'react'

export default function Chip({ children, color = 'gray' }: { children: React.ReactNode, color?: string }){
  const bg = `bg-${color}-100`
  const text = `text-${color}-800`
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${bg} ${text}`}>{children}</span>
  )
}
