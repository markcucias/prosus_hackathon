import React from 'react'

export default function Card({ title, children }: { title?: string, children: React.ReactNode }){
  return (
    <div className="p-4 bg-white rounded shadow">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div>{children}</div>
    </div>
  )
}
