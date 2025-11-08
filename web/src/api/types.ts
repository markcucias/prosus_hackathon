export type EventItem = {
  event_id: string
  summary: string
  location?: string
  start: string
  end?: string
  status?: string
}

export type Task = {
  id: string
  text: string
  done: boolean
}

export type Session = {
  _id: string
  examId: string
  topic: string
  startAt: string
  endAt: string
  status: 'scheduled'|'running'|'done'|'skipped'
  primerHtml?: string
  tasks?: Task[]
  progressPct?: number
}

export type Exam = {
  _id: string
  title: string
  date: string
  type?: 'quiz' | 'theory' | 'practice' | 'hybrid'
  topics?: string[]
  sessions?: Session[]
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  createdAt?: string
}

export type CalendarSyncResult = {
  scanned: number
  inserted: number
  updated: number
  unchanged: number
}
