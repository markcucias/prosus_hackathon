import React from 'react'
import clsx from 'clsx'

export default function Button({ children, onClick, variant = 'primary' }: { children: React.ReactNode, onClick?: () => void, variant?: 'primary'|'secondary' }){
  return (
    <button onClick={onClick} className={clsx('px-4 py-2 rounded shadow text-white', variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 text-gray-900')}>
      {children}
    </button>
  )
}
