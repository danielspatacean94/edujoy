export class NotificationResponseDto {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}
