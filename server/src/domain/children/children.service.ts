import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Child } from './entities/child.entity';
import { SaveChildDto, ChildResponseDto } from './dto/child.dto';
import { KindergartensService, objectId, searchFilter } from '../kindergartens/kindergartens.service';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
@Injectable()
export class ChildrenService {
  constructor(@InjectRepository(Child) private readonly repo: MongoRepository<Child>, private readonly kindergartens: KindergartensService) {}
  async scope(user: AuthenticatedUser) {
    if (user.role === 'admin') return {};
    if (user.role !== 'teacher' || !user.kindergartenId) throw new ForbiddenException('Ask an administrator to assign your kindergarten.');
    await this.kindergartens.requireActive(user.kindergartenId);
    return { kindergartenId: user.kindergartenId };
  }
  async findAll(query: PaginationQueryDto, user: AuthenticatedUser) {
    const { page = 1, limit = 20, search } = query;
    const where = { deletedAt: null, ...await this.scope(user), ...searchFilter(search) };
    const [rows, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { name: 'ASC' } });
    return { data: rows.map(row => this.toDto(row)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async requireChild(id: string, user: AuthenticatedUser) {
    const row = await this.repo.findOne({ where: { _id: objectId(id), deletedAt: null, ...await this.scope(user) } });
    if (!row) throw new NotFoundException('Child not found');
    return row;
  }
  async findOne(id: string, user: AuthenticatedUser) { return this.toDto(await this.requireChild(id, user)); }
  async destination(dto: SaveChildDto, user: AuthenticatedUser, existing?: string) {
    await this.scope(user);
    if (user.role !== 'admin' && dto.kindergartenId && dto.kindergartenId !== user.kindergartenId) throw new ForbiddenException('Children must belong to your kindergarten.');
    const id = user.role === 'admin' ? dto.kindergartenId ?? existing : user.kindergartenId;
    if (!id) throw new BadRequestException('Choose a kindergarten');
    await this.kindergartens.requireActive(id);
    return id;
  }
  async create(dto: SaveChildDto, user: AuthenticatedUser) {
    const kindergartenId = await this.destination(dto, user);
    return this.toDto(await this.repo.save(this.repo.create({ name: dto.name, age: dto.age, kindergartenId })));
  }
  async update(id: string, dto: SaveChildDto, user: AuthenticatedUser) {
    const row = await this.requireChild(id, user);
    row.kindergartenId = await this.destination(dto, user, row.kindergartenId);
    row.name = dto.name; row.age = dto.age;
    return this.toDto(await this.repo.save(row));
  }
  async remove(id: string, user: AuthenticatedUser) {
    const row = await this.requireChild(id, user); row.deletedAt = new Date(); await this.repo.save(row);
  }
  toDto(row: Child): ChildResponseDto {
    return { id: row._id.toString(), name: row.name, age: row.age, kindergartenId: row.kindergartenId, createdAt: row.createdAt, updatedAt: row.updatedAt };
  }
}
