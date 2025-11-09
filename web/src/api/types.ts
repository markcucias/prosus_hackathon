export type EventItem = {
  event_id: string
  summary: string
  location?: string
  start: string
  end?: string
  status?: string
}

export type Exam = {
  _id: string
  title: string
  date: string
  type?: 'quiz'|'theory'|'practice'|'hybrid'
  sessions?: Session[]
}

export type Session = {
  _id: string
  examId: string
  topic: string
  startAt: string
  endAt: string
  status: 'scheduled'|'running'|'done'|'skipped'
  primerHtml?: string
  tasks?: { id: string, text: string, done: boolean }[]
  progressPct?: number
}
