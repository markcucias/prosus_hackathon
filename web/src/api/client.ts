import axios from 'axios'
import { EventItem, Exam, Session } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
const api = axios.create({ baseURL: API_BASE, withCredentials: true })

export async function syncCalendar(){
  const r = await api.post('/api/calendar/sync')
  return r.data
}

export async function listUpcomingEvents(): Promise<{ items: EventItem[] }>{
  const r = await api.get('/api/events/upcoming')
  return r.data
}

export async function listExams(): Promise<Exam[]>{
  const r = await api.get('/api/exams')
  return r.data
}

export async function getExam(id: string): Promise<Exam>{
  const r = await api.get(`/api/exams/${id}`)
  return r.data
}

export async function planExam(id: string, body: { type: string, topics: string[] }): Promise<{ sessions: Session[] }>{
  const r = await api.post(`/api/exams/${id}/plan`, body)
  return r.data
}

export async function startSession(id: string): Promise<Session>{
  const r = await api.post(`/api/sessions/${id}/start`)
  return r.data
}

export async function checkIn(id: string, body: { completedTaskIds: string[], note?: string }): Promise<Session>{
  const r = await api.post(`/api/sessions/${id}/checkin`, body)
  return r.data
}

export async function completeSession(id: string): Promise<Session>{
  const r = await api.post(`/api/sessions/${id}/complete`)
  return r.data
}

export async function listNotifications(){
  const r = await api.get('/api/notifications')
  return r.data
}

export default api
