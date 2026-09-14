import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { GroupsService } from '../groups/groups.service';
import { Child } from '../children/entities/child.entity';
import { Group } from '../groups/entities/group.entity';
import { Attendance, AttendanceStatus, ChildAttendanceStatus } from './entities/attendance.entity';
import { AttendanceDetailDto, AttendanceQueryDto, AttendanceSummaryDto, CreateAttendanceDto } from './dto/attendance.dto';
import { objectId } from '../kindergartens/kindergartens.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private readonly repo: MongoRepository<Attendance>,
    @InjectRepository(Child) private readonly children: MongoRepository<Child>,
    @InjectRepository(Group) private readonly groupsRepo: MongoRepository<Group>,
    private readonly groups: GroupsService,
  ) {}

  async findAll(query: AttendanceQueryDto, user: AuthenticatedUser) {
    const scope = await this.groups.scope(user, query.kindergartenId);
    const [groupRows, records] = await Promise.all([
      this.groupsRepo.find({ where: { deletedAt: null, ...scope }, order: { name: 'ASC' } }),
      this.repo.find({ where: { date: query.date, ...scope } }),
    ]);
    const recordByGroup = new Map(records.map(record => [record.groupId, record]));
    const data = await Promise.all(groupRows.map(async group => {
      const record = recordByGroup.get(group._id.toString());
      const children = await this.activeChildren(group._id.toString());
      return this.toSummary(group, query.date, record, children.length);
    }));
    return { date: query.date, data };
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const record = await this.findRecord(id, user);
    const group = await this.groups.requireActive(record.groupId, user);
    const children = await this.activeChildren(record.groupId);
    return this.toDetail(group, record, children);
  }

  async create(dto: CreateAttendanceDto, user: AuthenticatedUser) {
    const group = await this.groups.requireActive(dto.groupId, user);
    const existing = await this.repo.findOne({ where: { groupId: dto.groupId, date: dto.date } });
    if (existing) throw new ConflictException('Prezența pentru această grupă și zi există deja.');
    const record = await this.repo.save(this.repo.create({
      groupId: dto.groupId,
      kindergartenId: group.kindergartenId,
      date: dto.date,
      status: AttendanceStatus.PENDING,
      checkedChildIds: [],
      childStatuses: {},
      createdBy: user.userId,
    }));
    return this.findOne(record._id.toString(), user);
  }

  async start(id: string, user: AuthenticatedUser) {
    const record = await this.findRecord(id, user);
    if (record.status === AttendanceStatus.FINISHED) throw new ConflictException('Această prezență este deja finalizată.');
    if (record.status === AttendanceStatus.PENDING) {
      const children = await this.activeChildren(record.groupId);
      record.childOrder = children.map(child => child._id.toString());
      for (let i = record.childOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [record.childOrder[i], record.childOrder[j]] = [record.childOrder[j], record.childOrder[i]];
      }
      record.status = AttendanceStatus.IN_PROGRESS;
      record.startedAt = new Date();
      await this.repo.save(record);
    }
    return this.findOne(id, user);
  }

  async setChildStatus(id: string, childId: string, status: ChildAttendanceStatus, user: AuthenticatedUser) {
    const record = await this.findRecord(id, user);
    if (record.status !== AttendanceStatus.IN_PROGRESS) throw new BadRequestException('Pornește prezența înainte de a bifa copiii.');
    const child = await this.children.findOne({ where: { _id: objectId(childId), deletedAt: null } });
    if (!child || child.groupId !== record.groupId) throw new NotFoundException('Copilul nu aparține acestei grupe.');
    if (![ChildAttendanceStatus.PRESENT, ChildAttendanceStatus.ABSENT].includes(status)) throw new BadRequestException('Alege Prezent sau Absent.');
    record.childStatuses = { ...(record.childStatuses ?? {}), [childId]: status };
    record.checkedChildIds = Object.entries(record.childStatuses).filter(([, value]) => value === ChildAttendanceStatus.PRESENT).map(([id]) => id);
    const children = await this.activeChildren(record.groupId);
    if (children.length > 0 && children.every(child => record.childStatuses[child._id.toString()] === ChildAttendanceStatus.PRESENT)) {
      record.status = AttendanceStatus.FINISHED;
      record.finishedAt = new Date();
    }
    await this.repo.save(record);
    return this.findOne(id, user);
  }

  async finish(id: string, user: AuthenticatedUser) {
    const record = await this.findRecord(id, user);
    if (record.status === AttendanceStatus.PENDING) throw new BadRequestException('Pornește prezența înainte de a o finaliza.');
    if (record.status === AttendanceStatus.IN_PROGRESS) {
      const children = await this.activeChildren(record.groupId);
      record.childStatuses = { ...(record.childStatuses ?? {}) };
      for (const child of children) {
        const childId = child._id.toString();
        record.childStatuses[childId] ??= record.checkedChildIds.includes(childId)
          ? ChildAttendanceStatus.PRESENT
          : ChildAttendanceStatus.ABSENT;
      }
      record.checkedChildIds = Object.entries(record.childStatuses)
        .filter(([, value]) => value === ChildAttendanceStatus.PRESENT).map(([childId]) => childId);
      record.status = AttendanceStatus.FINISHED;
      record.finishedAt = new Date();
      await this.repo.save(record);
    }
    return this.findOne(id, user);
  }

  async reset(id: string, user: AuthenticatedUser) {
    const record = await this.findRecord(id, user);
    this.requireToday(record.date);
    record.status = AttendanceStatus.PENDING;
    record.checkedChildIds = [];
    record.childOrder = [];
    record.childStatuses = {};
    record.startedAt = null;
    record.finishedAt = null;
    await this.repo.save(record);
    return this.findOne(id, user);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const record = await this.findRecord(id, user);
    this.requireToday(record.date);
    await this.repo.delete(record._id);
  }

  private async findRecord(id: string, user: AuthenticatedUser) {
    const record = await this.repo.findOne({ where: { _id: objectId(id) } });
    if (!record) throw new NotFoundException('Prezența nu a fost găsită.');
    await this.groups.requireActive(record.groupId, user);
    return record;
  }

  private requireToday(date: string) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (date !== today) throw new BadRequestException('Poți modifica doar prezența de astăzi.');
  }

  private async activeChildren(groupId: string) {
    const children = await this.children.find({ where: { groupId } });
    return children.filter(child => !child.deletedAt);
  }

  private toSummary(group: Group, date: string, record: Attendance | undefined, childrenCount: number): AttendanceSummaryDto {
    return {
      id: record?._id.toString() ?? null,
      groupId: group._id.toString(),
      groupName: group.name,
      date,
      status: record?.status ?? null,
      childrenCount,
      checkedCount: record ? Object.keys(record.childStatuses ?? {}).length : 0,
    };
  }

  private toDetail(group: Group, record: Attendance, children: Child[]): AttendanceDetailDto {
    const childStatuses = record.childStatuses ?? {};
    const positions = new Map((record.childOrder ?? []).map((id, index) => [id, index]));
    children = [...children].sort((a, b) =>
      (positions.get(a._id.toString()) ?? positions.size) - (positions.get(b._id.toString()) ?? positions.size));
    return {
      ...this.toSummary(group, record.date, record, children.length),
      startedAt: record.startedAt,
      finishedAt: record.finishedAt,
      children: children.map(child => ({ id: child._id.toString(), name: child.name, age: child.age, genre: child.genre ?? null, photoKey: child.photoKey ?? null, status: childStatuses[child._id.toString()] ?? (record.checkedChildIds.includes(child._id.toString()) ? ChildAttendanceStatus.PRESENT : null) })),
    };
  }
}
