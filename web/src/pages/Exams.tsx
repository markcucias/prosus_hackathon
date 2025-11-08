import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { listExams } from '../api/client'
import Card from '../components/Card'
import { Link } from 'react-router-dom'
import { Exam } from '../api/types'

export default function Exams(){
  const { data } = useQuery<Exam[], Error>({ queryKey: ['exams'], queryFn: () => listExams() })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Exams</h1>
      <div className="grid gap-3">
        {data?.map((exam: any) => (
          <Card key={exam._id} title={exam.title}>
            <div className="text-sm text-gray-600">{exam.date}</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/exams/${exam._id}`} className="text-blue-600">Plan</Link>
            </div>
          </Card>
        ))}
        {!data && <div>Loading...</div>}
      </div>
    </div>
  )
}
