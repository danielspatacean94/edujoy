import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Group } from './entities/group.entity';
import { Child } from '../children/entities/child.entity';
import { KindergartensService, objectId, searchFilter } from '../kindergartens/kindergartens.service';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { SaveGroupDto, GroupQueryDto, GroupResponseDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly repo: MongoRepository<Group>,
    @InjectRepository(Child) private readonly children: MongoRepository<Child>,
    private readonly kindergartens: KindergartensService,
  ) {}

  async scope(user: AuthenticatedUser, kindergartenId?: string) {
    if (user.role !== 'admin') {
      if (user.role !== 'teacher' || !user.kindergartenId) throw new ForbiddenException('Cere unui administrator să îți atribuie o grădiniță.');
      if (kindergartenId && kindergartenId !== user.kindergartenId) throw new ForbiddenException('Poți gestiona doar grupele din grădinița ta.');
      kindergartenId = user.kindergartenId;
    }
    if (!kindergartenId) return {};
    await this.kindergartens.requireActive(kindergartenId);
    return { kindergartenId };
  }

  async findAll(query: GroupQueryDto, user: AuthenticatedUser) {
    const { page = 1, limit = 20, search } = query;
    const where = { deletedAt: null, ...await this.scope(user, query.kindergartenId), ...searchFilter(search) };
    const [rows, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { name: 'ASC', _id: 'ASC' } });
    const data = await Promise.all(rows.map(async row => this.toDto(row, await this.countActiveChildren(row._id.toString()))));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async requireActive(id: string, user: AuthenticatedUser) {
    const row = await this.repo.findOne({ where: { _id: objectId(id), deletedAt: null, ...await this.scope(user) } });
    if (!row) throw new NotFoundException('Grupa nu a fost găsită.');
    await this.kindergartens.requireActive(row.kindergartenId);
    return row;
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const row = await this.requireActive(id, user);
    return this.toDto(row, await this.countActiveChildren(row._id.toString()));
  }

  async create(dto: SaveGroupDto, user: AuthenticatedUser) {
    const scope = await this.scope(user, dto.kindergartenId);
    if (!scope.kindergartenId) throw new BadRequestException('Alege o grădiniță.');
    return this.toDto(await this.repo.save(this.repo.create({ name: dto.name, kindergartenId: scope.kindergartenId })));
  }

  async update(id: string, dto: SaveGroupDto, user: AuthenticatedUser) {
    const row = await this.requireActive(id, user);
    const scope = await this.scope(user, dto.kindergartenId ?? row.kindergartenId);
    if (scope.kindergartenId !== row.kindergartenId) await this.requireEmpty(id);
    row.name = dto.name;
    row.kindergartenId = scope.kindergartenId!;
    return this.toDto(await this.repo.save(row));
  }

  async requireEmpty(id: string) {
    if (await this.countActiveChildren(id)) {
      throw new ConflictException('Mută sau șterge copiii din grupă înainte de a o șterge sau de a-i schimba grădinița.');
    }
  }

  private async countActiveChildren(groupId: string) {
    const children = await this.children.find({ where: { groupId } });
    return children.filter(child => !child.deletedAt).length;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const row = await this.requireActive(id, user);
    await this.requireEmpty(id);
    row.deletedAt = new Date();
    await this.repo.save(row);
  }

  toDto(row: Group, childrenCount = 0): GroupResponseDto {
    return { id: row._id.toString(), name: row.name, kindergartenId: row.kindergartenId, childrenCount, createdAt: row.createdAt, updatedAt: row.updatedAt };
  }
}
