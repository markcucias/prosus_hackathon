import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotifications } from '../api/client'
import Card from '../components/Card'

export default function Notifications(){
  const { data } = useQuery(['notifications'], () => listNotifications())

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold">Notifications</h1>
      <div className="space-y-2">
        {data?.map((n: any) => (
          <Card key={n.id} title={n.title}>{n.body}</Card>
        ))}
        {!data && <div>Loading...</div>}
      </div>
    </div>
  )
}
