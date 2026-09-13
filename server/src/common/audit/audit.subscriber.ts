import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

// Fields stripped from every snapshot regardless of entity type. Credential
// material (password hashes, session tokens) must never be duplicated into
// audit_log — add any other secret-bearing field name here as entities grow.
const EXCLUDED_FIELDS = new Set(['createdAt', 'updatedAt', 'deletedAt', 'password', 'token']);

function serializeEntity(entity: unknown): Record<string, any> | null {
  if (!entity) return null;
  try {
    const obj = JSON.parse(JSON.stringify(entity));
    for (const field of EXCLUDED_FIELDS) delete obj[field];
    return obj;
  } catch {
    return null;
  }
}

function extractId(entity: unknown): string | null {
  if (!entity || typeof entity !== 'object') return null;
  const e = entity as Record<string, any>;
  return e['_id']?.toString() ?? null;
}

function hasRealChanges(
  before: Record<string, any> | null,
  after: Record<string, any> | null,
): boolean {
  const b = before ?? {};
  const a = after ?? {};
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
  for (const k of keys) {
    if (JSON.stringify(b[k] ?? null) !== JSON.stringify(a[k] ?? null)) return true;
  }
  return false;
}

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    private readonly cls: ClsService,
    private readonly auditLogService: AuditLogService,
  ) {
    dataSource.subscribers.push(this);
  }

  private get currentUser(): AuthenticatedUser | null {
    try {
      return this.cls.get<AuthenticatedUser>('user') ?? null;
    } catch {
      return null;
    }
  }

  afterInsert(event: InsertEvent<any>): void {
    if (event.metadata.target === AuditLog) return;

    const entityAfter = serializeEntity(event.entity);
    const entityId = extractId(event.entity);

    this.auditLogService
      .create({
        user: this.currentUser,
        action: 'INSERT',
        entityType: event.metadata.targetName,
        entityId,
        entityBefore: null,
        entityAfter,
      })
      .catch(() => undefined);
  }

  afterUpdate(event: UpdateEvent<any>): void {
    if (event.metadata.target === AuditLog) return;

    const before = serializeEntity(event.databaseEntity);
    const after = serializeEntity(event.entity);
    const entityId = extractId(event.entity) ?? extractId(event.databaseEntity);

    const rawAfter = event.entity as Record<string, any> | null;
    const isSoftDelete =
      rawAfter?.['deletedAt'] != null && (event.databaseEntity as any)?.['deletedAt'] == null;

    if (isSoftDelete) {
      this.auditLogService
        .create({
          user: this.currentUser,
          action: 'SOFT_DELETE',
          entityType: event.metadata.targetName,
          entityId,
          entityBefore: after ?? before,
          entityAfter: null,
        })
        .catch(() => undefined);
    } else {
      if (!hasRealChanges(before, after)) return;
      this.auditLogService
        .create({
          user: this.currentUser,
          action: 'UPDATE',
          entityType: event.metadata.targetName,
          entityId,
          entityBefore: before,
          entityAfter: after,
        })
        .catch(() => undefined);
    }
  }
}
