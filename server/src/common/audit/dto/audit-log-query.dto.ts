import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../dto/pagination.dto';
import { AuditAction } from '../entities/audit-log.entity';

export class AuditLogQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsIn(['INSERT', 'UPDATE', 'SOFT_DELETE'])
  action?: AuditAction;
}
