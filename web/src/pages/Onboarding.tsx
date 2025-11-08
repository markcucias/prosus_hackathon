import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function Onboarding(){
  const navigate = useNavigate()
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [email, setEmail] = useState('')

  function handleConnectCalendar(){
    // If backend supports OAuth start URL, open in new window. Otherwise call sync.
    // TODO: replace with real backend integration
    fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001') + '/api/calendar/sync', { method: 'POST' })
      .then(r => r.json())
      .then(() => {
        navigate('/')
      })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Welcome — Onboarding</h1>

      <section className="p-4 bg-white rounded shadow">
        <h2 className="font-semibold">Preferences</h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm text-gray-600">Timezone</div>
            <input value={timezone} onChange={e => setTimezone(e.target.value)} className="mt-1 input" />
          </label>
          <label className="block">
            <div className="text-sm text-gray-600">Pomodoro (min)</div>
            <input type="number" value={pomodoroMinutes} onChange={e => setPomodoroMinutes(Number(e.target.value))} className="mt-1 input" />
          </label>
          <label className="block">
            <div className="text-sm text-gray-600">Break (min)</div>
            <input type="number" value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} className="mt-1 input" />
          </label>
          <label className="block">
            <div className="text-sm text-gray-600">Notification email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 input" />
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleConnectCalendar}>Connect Google Calendar / Sync</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>Skip</Button>
        </div>
      </section>

    </div>
  )
}
