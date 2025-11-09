import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Exams from './pages/Exams'
import ExamDetail from './pages/ExamDetail'
import SessionRunner from './pages/SessionRunner'
import Notifications from './pages/Notifications'
import Debug from './pages/Debug'
import Header from './components/Header'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/onboarding" element={<Onboarding/>} />
          <Route path="/exams" element={<Exams/>} />
          <Route path="/exams/:id" element={<ExamDetail/>} />
          <Route path="/sessions/:id" element={<SessionRunner/>} />
          <Route path="/notifications" element={<Notifications/>} />
          <Route path="/debug" element={<Debug/>} />
        </Routes>
      </main>
      <footer className="p-4 text-center text-sm text-gray-500">Study Companion UI</footer>
    </div>
  )
}
