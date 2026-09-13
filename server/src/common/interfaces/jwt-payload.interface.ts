export interface JwtPayload {
  sub: string;
  email: string;
  role: 'admin' | 'teacher';
  kindergartenId?: string | null;
  tokenVersion: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'teacher';
  kindergartenId?: string | null;
}
