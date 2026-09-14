import { apiClient } from './api'
export type CalendarOption = { id?: string; label: string; image: string }
export type CalendarQuestion = { id?: string; type: 'weekday'|'weather'|'season'|'activity'; label: string; options: CalendarOption[] }
export type MorningCalendar = { id: string; groupId: string; date: string; questions: CalendarQuestion[]; status: 'DRAFT'|'IN_PROGRESS'|'COMPLETED'; startedAt?: string|null; completedAt?: string|null }
export const morningCalendarService = {
  async list(groupId?: string, date?: string) { return (await apiClient.get<MorningCalendar[]>('/morning-calendars', { params: { ...(groupId ? { groupId } : {}), ...(date ? { date } : {}) } })).data },
  async save(groupId: string, date: string, questions: CalendarQuestion[]) { return (await apiClient.post<MorningCalendar>('/morning-calendars', { groupId, date, questions })).data },
  async start(id: string) { return (await apiClient.post<MorningCalendar>(`/morning-calendars/${id}/start`)).data },
  async complete(id: string) { return (await apiClient.post<MorningCalendar>(`/morning-calendars/${id}/complete`)).data },
}
