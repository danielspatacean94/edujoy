import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Kindergarten } from './entities/kindergarten.entity';
import { Child } from '../children/entities/child.entity';
import { User } from '../users/entities/user.entity';
import { SaveKindergartenDto, KindergartenResponseDto } from './dto/kindergarten.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export function objectId(id: string): ObjectId {
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new BadRequestException('Invalid record ID');
  return new ObjectId(id);
}
export function searchFilter(search?: string) {
  return search ? { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {};
}
@Injectable()
export class KindergartensService {
  constructor(@InjectRepository(Kindergarten) private readonly repo: MongoRepository<Kindergarten>,
    @InjectRepository(User) private readonly users: MongoRepository<User>,
    @InjectRepository(Child) private readonly children: MongoRepository<Child>) {}
  async findAll({ page = 1, limit = 20, search }: PaginationQueryDto) {
    const [rows, total] = await this.repo.findAndCount({ where: { deletedAt: null, ...searchFilter(search) }, skip: (page - 1) * limit, take: limit, order: { name: 'ASC' } });
    return { data: rows.map(row => this.toDto(row)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async requireActive(id: string) {
    const row = await this.repo.findOne({ where: { _id: objectId(id), deletedAt: null } });
    if (!row) throw new NotFoundException('Kindergarten not found');
    return row;
  }
  async findOne(id: string) { return this.toDto(await this.requireActive(id)); }
  async create(dto: SaveKindergartenDto) { return this.toDto(await this.repo.save(this.repo.create(dto))); }
  async update(id: string, dto: SaveKindergartenDto) {
    const row = await this.requireActive(id);
    Object.assign(row, dto);
    return this.toDto(await this.repo.save(row));
  }
  async remove(id: string) {
    const row = await this.requireActive(id);
    const [teachers, children] = await Promise.all([
      this.users.count({ where: { kindergartenId: id, deletedAt: null } }),
      this.children.count({ where: { kindergartenId: id, deletedAt: null } }),
    ]);
    if (teachers || children) throw new ConflictException('Move or delete the teachers and children before deleting this kindergarten.');
    row.deletedAt = new Date(); await this.repo.save(row);
  }
  toDto(row: Kindergarten): KindergartenResponseDto {
    return { id: row._id.toString(), name: row.name, location: row.location, createdAt: row.createdAt, updatedAt: row.updatedAt };
  }
}
