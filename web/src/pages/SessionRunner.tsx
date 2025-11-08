import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { startSession, checkIn, completeSession } from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'

export default function SessionRunner(){
  const { id } = useParams()
  const [session, setSession] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  async function handleStart(){
    const s = await startSession(id!)
    setSession(s)
    // no real timer here; example
  }

  async function handleCheckin(){
    await checkIn(id!, { completedTaskIds: session?.tasks?.filter((t:any)=>t.done).map((t:any)=>t.id) || [], note: '' })
  }

  async function handleComplete(){
    await completeSession(id!)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Session</h1>
      <Card>
        {!session && <Button onClick={handleStart}>Start Session</Button>}
        {session && (
          <div>
            <div dangerouslySetInnerHTML={{ __html: session.primerHtml || '<p>No primer</p>' }} />
            <div className="mt-2">
              {session.tasks?.map((t: any) => (
                <div key={t.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={t.done} onChange={() => { t.done = !t.done; setSession({...session}) }} />
                  <div>{t.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCheckin}>Check-in</Button>
              <Button variant="secondary" onClick={handleComplete}>Complete</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
