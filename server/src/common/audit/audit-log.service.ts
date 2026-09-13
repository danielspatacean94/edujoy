import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

export interface CreateAuditLogDto {
  user: AuthenticatedUser | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  entityBefore: Record<string, any> | null;
  entityAfter: Record<string, any> | null;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: MongoRepository<AuditLog>,
  ) {}

  async create(dto: CreateAuditLogDto): Promise<void> {
    const parts = [dto.entityBefore, dto.entityAfter]
      .filter(Boolean)
      .map((o) => JSON.stringify(o))
      .join(' ');

    const log = this.repo.create({
      userId: dto.user?.userId ?? null,
      userEmail: dto.user?.email ?? null,
      userFullName: dto.user?.fullName ?? null,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId,
      entityBefore: dto.entityBefore,
      entityAfter: dto.entityAfter,
      searchText: parts || null,
    });
    await this.repo.save(log);
  }

  async findAll(query: AuditLogQueryDto): Promise<PaginatedResult<AuditLog>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filters: Record<string, any> = {};
    if (query.entityType) filters['entityType'] = query.entityType;
    if (query.entityId) filters['entityId'] = query.entityId;
    if (query.userId) filters['userId'] = query.userId;
    if (query.action) filters['action'] = query.action;

    const escaped = query.search ? query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;
    const searchClause = escaped
      ? {
          $or: [
            { userEmail: { $regex: escaped, $options: 'i' } },
            { userFullName: { $regex: escaped, $options: 'i' } },
            { entityId: { $regex: escaped, $options: 'i' } },
            { entityType: { $regex: escaped, $options: 'i' } },
            { action: { $regex: escaped, $options: 'i' } },
            { searchText: { $regex: escaped, $options: 'i' } },
          ],
        }
      : null;

    const where =
      Object.keys(filters).length && searchClause
        ? { $and: [filters, searchClause] }
        : searchClause ?? filters;

    const [data, total] = await this.repo.findAndCount({
      where: where as any,
      skip,
      take: limit,
      order: { createdAt: 'DESC' } as any,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
