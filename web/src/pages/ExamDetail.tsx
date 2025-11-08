import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getExam, planExam } from '../api/client'
import { useQuery, useMutation } from '@tanstack/react-query'
import Card from '../components/Card'
import Button from '../components/Button'
import { Exam, Session } from '../api/types'

export default function ExamDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: exam } = useQuery<Exam, Error>({ queryKey: ['exam', id], queryFn: () => getExam(id!), enabled: !!id })
  const [step, setStep] = useState(1)
  const [type, setType] = useState('theory')
  const [topicsText, setTopicsText] = useState('')

  const mutation = useMutation<{ sessions: Session[] }, Error, { type: string, topics: string[] }>({
    mutationFn: (body: { type: string, topics: string[] }) => planExam(id!, body),
    onSuccess() {
      navigate('/sessions')
    }
  })

  function handleSubmitPlan(){
    const topics = topicsText.split('\n').map(t => t.trim()).filter(Boolean)
    mutation.mutate({ type, topics })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Plan for exam</h1>
      <Card>
        <div className="text-sm text-gray-600">{exam?.title}</div>
        {step === 1 && (
          <div className="space-y-2">
            <div>Type</div>
            <select value={type} onChange={e => setType(e.target.value)} className="input">
              <option value="quiz">Quiz</option>
              <option value="theory">Theory</option>
              <option value="practice">Practice</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <div className="flex gap-2"><Button onClick={() => setStep(2)}>Next</Button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <div>Topics (one per line)</div>
            <textarea value={topicsText} onChange={e => setTopicsText(e.target.value)} className="input h-32" />
            <div className="flex gap-2"><Button onClick={() => setStep(1)} variant="secondary">Back</Button><Button onClick={() => setStep(3)}>Next</Button></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <div>Proposed schedule will be created (server-side)</div>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep(2)}>Back</Button><Button onClick={handleSubmitPlan}>Submit Plan</Button></div>
          </div>
        )}
      </Card>
    </div>
  )
}
