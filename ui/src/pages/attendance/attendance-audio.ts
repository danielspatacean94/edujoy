import { attendanceAnnouncement, type ChildGenre } from '@shared/types/child'
import type { ChildAttendanceStatus } from '@/services/attendance.service'

export function announceAttendance(
  name: string,
  status: ChildAttendanceStatus,
  genre: ChildGenre | null | undefined,
) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const speech = new SpeechSynthesisUtterance(
    attendanceAnnouncement(name, status, genre),
  )
  speech.lang = 'ro-RO'
  speech.rate = 0.78
  speech.pitch = 1.3
  speech.volume = 1
  const romanianVoices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith('ro'))
  const femaleVoice = romanianVoices.find((voice) =>
    /female|feme|maria|ioana|elena|andreea|carmen|irina|ana|monica|raluca|simona|cristina|diana|sorina/i.test(
      voice.name,
    ),
  )
  if (femaleVoice || romanianVoices[0])
    speech.voice = femaleVoice || romanianVoices[0]
  window.speechSynthesis.speak(speech)
}

export function playCompletionSound(delay = 0) {
  const sound = new Audio('/finish.mp3')
  sound.volume = 1
  const play = () => {
    void sound.play().catch(() => null)
  }
  if (delay > 0) window.setTimeout(play, delay)
  else play()
}

export function playAttendanceStartSound() {
  const sound = new Audio('/attendance-start.mp3')
  sound.volume = 1
  void sound.play().catch(() => null)
}
