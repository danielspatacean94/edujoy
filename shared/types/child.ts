export const CHILD_GENRES = ['male', 'female'] as const;
export type ChildGenre = typeof CHILD_GENRES[number];
export const CHILD_GENRE_LABELS: Record<ChildGenre, string> = {
  male: 'Băiețel',
  female: 'Fetiță',
};

export function attendanceAnnouncement(name: string, status: 'PRESENT' | 'ABSENT', genre: ChildGenre | null | undefined): string {
  const word = status === 'PRESENT' ? 'prezent' : 'absent';
  return `${name}, ${word}${genre === 'female' ? 'ă' : ''}`;
}
