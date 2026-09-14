import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Child } from './entities/child.entity';
import { SaveChildDto, ChildResponseDto, ChildQueryDto } from './dto/child.dto';
import { GroupsService } from '../groups/groups.service';
import { KindergartensService, objectId, searchFilter } from '../kindergartens/kindergartens.service';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { S3Service } from '../../common/s3/s3.service';
@Injectable()
export class ChildrenService {
  constructor(@InjectRepository(Child) private readonly repo: MongoRepository<Child>, private readonly kindergartens: KindergartensService, private readonly groups: GroupsService, private readonly s3: S3Service) {}
  async scope(user: AuthenticatedUser) {
    if (user.role === 'admin') return {};
    if (user.role !== 'teacher' || !user.kindergartenId) throw new ForbiddenException('Cere unui administrator să îți atribuie o grădiniță.');
    await this.kindergartens.requireActive(user.kindergartenId);
    return { kindergartenId: user.kindergartenId };
  }
  async findAll(query: ChildQueryDto, user: AuthenticatedUser) {
    const { page = 1, limit = 20, search } = query;
    const scope = query.kindergartenId ? await this.groups.scope(user, query.kindergartenId) : await this.scope(user);
    if (query.groupId) {
      const group = await this.groups.requireActive(query.groupId, user);
      if (query.kindergartenId && group.kindergartenId !== query.kindergartenId) throw new BadRequestException('Grupa nu aparține grădiniței selectate.');
    }
    const where = { deletedAt: null, ...scope, ...(query.groupId ? { groupId: query.groupId } : {}), ...searchFilter(search) };
    const [rows, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { name: 'ASC' } });
    return { data: rows.map(row => this.toDto(row)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async requireChild(id: string, user: AuthenticatedUser) {
    const row = await this.repo.findOne({ where: { _id: objectId(id), deletedAt: null, ...await this.scope(user) } });
    if (!row) throw new NotFoundException('Copilul nu a fost găsit.');
    return row;
  }
  async findOne(id: string, user: AuthenticatedUser) { return this.toDto(await this.requireChild(id, user)); }
  async destination(dto: SaveChildDto, user: AuthenticatedUser, existing?: string) {
    await this.scope(user);
    if (user.role !== 'admin' && dto.kindergartenId && dto.kindergartenId !== user.kindergartenId) throw new ForbiddenException('Poți gestiona doar copiii din grădinița ta.');
    const id = user.role === 'admin' ? dto.kindergartenId ?? existing : user.kindergartenId;
    if (!id) throw new BadRequestException('Alege o grădiniță.');
    await this.kindergartens.requireActive(id);
    return id;
  }
  async create(dto: SaveChildDto, user: AuthenticatedUser) {
    const kindergartenId = await this.destination(dto, user);
    await this.validateGroup(dto.groupId, kindergartenId, user);
    return this.toDto(await this.repo.save(this.repo.create({ name: dto.name, age: dto.age, genre: dto.genre, kindergartenId, groupId: dto.groupId })));
  }
  async validateGroup(id: string, kindergartenId: string, user: AuthenticatedUser) {
    if (!id) throw new BadRequestException('Alege o grupă.');
    const group = await this.groups.requireActive(id, user);
    if (group.kindergartenId !== kindergartenId) throw new BadRequestException('Grupa trebuie să aparțină grădiniței copilului.');
  }
  async update(id: string, dto: SaveChildDto, user: AuthenticatedUser) {
    const row = await this.requireChild(id, user);
    const kindergartenId = await this.destination(dto, user, row.kindergartenId);
    await this.validateGroup(dto.groupId, kindergartenId, user);
    row.kindergartenId = kindergartenId;
    row.groupId = dto.groupId;
    row.name = dto.name; row.age = dto.age; row.genre = dto.genre;
    return this.toDto(await this.repo.save(row));
  }
  async remove(id: string, user: AuthenticatedUser) {
    const row = await this.requireChild(id, user); row.deletedAt = new Date(); await this.repo.save(row);
  }
  async savePhoto(id: string, file: { buffer: Buffer; mimetype: string }, user: AuthenticatedUser) {
    const row = await this.requireChild(id, user);
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Încarcă o imagine validă.');
    const key = `children/${id}/photo.jpg`;
    await this.s3.upload(key, file.buffer, file.mimetype);
    if (row.photoKey && row.photoKey !== key) await this.s3.deleteObject(row.photoKey);
    row.photoKey = key;
    row.photoMimeType = file.mimetype;
    return this.toDto(await this.repo.save(row));
  }
  async photo(id: string, user: AuthenticatedUser) {
    const row = await this.requireChild(id, user);
    if (!row.photoKey) throw new NotFoundException('Copilul nu are o fotografie.');
    return { buffer: await this.s3.getObject(row.photoKey), mimetype: row.photoMimeType ?? 'image/jpeg' };
  }
  toDto(row: Child): ChildResponseDto {
    return { id: row._id.toString(), name: row.name, age: row.age, genre: row.genre ?? null, kindergartenId: row.kindergartenId, groupId: row.groupId ?? null, photoKey: row.photoKey ?? null, createdAt: row.createdAt, updatedAt: row.updatedAt };
  }
}
