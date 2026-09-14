import { isAxiosError } from 'axios'

export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message))
      return message.filter((item) => typeof item === 'string').join('. ')
  } else if (error instanceof Error) {
    return error.message
  }
  return 'A apărut o eroare. Încearcă din nou.'
}
