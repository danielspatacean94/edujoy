export class UserResponseDto {
  id: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'teacher';
  kindergartenId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
