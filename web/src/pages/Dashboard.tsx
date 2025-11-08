import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { listUpcomingEvents, syncCalendar } from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import { EventItem } from '../api/types'

export default function Dashboard(){
  const { data, isLoading } = useQuery<{ items: EventItem[] }, Error>({
    queryKey: ['events'],
    queryFn: () => listUpcomingEvents()
  })

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <Card title="Upcoming (90 days)">
          {isLoading && <div>Loading...</div>}
          {!isLoading && data?.items?.length === 0 && <div>No events</div>}
          {!isLoading && data?.items?.map((ev: any) => (
            <div key={ev.event_id} className="py-2 border-b last:border-b-0">
              <div className="font-medium">{ev.summary}</div>
              <div className="text-sm text-gray-500">{ev.start}</div>
            </div>
          ))}
          <div className="mt-3"><Button onClick={() => syncCalendar().then(()=>window.location.reload())}>Sync now</Button></div>
        </Card>
      </div>

      <div className="col-span-4">
        <Card title="Sessions">
          <div>Upcoming sessions will appear here.</div>
        </Card>
      </div>

      <div className="col-span-4">
        <Card title="Notifications">
          <div>No notifications</div>
        </Card>
      </div>
    </div>
  )
}
