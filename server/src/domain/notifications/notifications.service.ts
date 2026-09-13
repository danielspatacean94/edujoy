import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Notification } from './entities/notification.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message?: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: MongoRepository<Notification>,
  ) {}

  // Called by other services to notify a user — not exposed over HTTP.
  async create(params: CreateNotificationParams): Promise<void> {
    const notif = this.notifRepo.create({
      userId: params.userId,
      title: params.title,
      message: params.message ?? null,
      link: params.link ?? null,
      isRead: false,
    });
    await this.notifRepo.save(notif);
  }

  async findRecent(userId: string, limit = 20): Promise<NotificationResponseDto[]> {
    const notifs = await this.notifRepo.find({
      where: { userId, deletedAt: null } as any,
      order: { createdAt: 'DESC' } as any,
      take: limit,
    });
    return notifs.map(this.toDto);
  }

  // The default view shown by the header bell — today's notifications only.
  async findForToday(userId: string): Promise<NotificationResponseDto[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const notifs = await this.notifRepo.find({
      where: { userId, createdAt: { $gte: start, $lte: end }, deletedAt: null } as any,
      order: { createdAt: 'DESC' } as any,
    });
    return notifs.map(this.toDto);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notifRepo.updateOne(
      { _id: new ObjectId(id), userId } as any,
      { $set: { isRead: true } },
    );
  }

  async markAllRead(userId: string): Promise<void> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    await this.notifRepo.updateMany(
      { userId, createdAt: { $gte: start, $lte: end }, isRead: false, deletedAt: null } as any,
      { $set: { isRead: true } },
    );
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    await this.notifRepo.updateOne(
      { _id: new ObjectId(id), userId } as any,
      { $set: { deletedAt: new Date() } },
    );
  }

  private toDto = (n: Notification): NotificationResponseDto => ({
    id: n._id.toString(),
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt,
  });
}
