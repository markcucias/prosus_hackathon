import React from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold">Study Companion</Link>
          <nav className="hidden md:flex gap-3">
            <Link to="/exams" className="text-sm text-gray-600">Exams</Link>
            <Link to="/notifications" className="text-sm text-gray-600">Notifications</Link>
            <Link to="/debug" className="text-sm text-gray-600">Debug</Link>
          </nav>
        </div>
        <div className="text-sm text-gray-600">Last sync: --</div>
      </div>
    </header>
  )
}
