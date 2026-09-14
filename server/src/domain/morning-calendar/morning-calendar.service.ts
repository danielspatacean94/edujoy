import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { GroupsService } from '../groups/groups.service';
import { objectId } from '../kindergartens/kindergartens.service';
import { MorningCalendar, MorningCalendarQuestion } from './entities/morning-calendar.entity';
import { MorningCalendarQueryDto, SaveMorningCalendarDto } from './dto/morning-calendar.dto';

const defaults = (): MorningCalendarQuestion[] => [
  { id: randomUUID(), type: 'weekday', label: 'Ce zi este?', options: ['Luni','Marți','Miercuri','Joi','Vineri'].map(label => ({ id: randomUUID(), label, image: '📅' })) },
  { id: randomUUID(), type: 'weather', label: 'Cum e vremea?', options: [['Soare','☀️'],['Nori','☁️'],['Ploaie','🌧️'],['Zăpadă','❄️']].map(([label,image]) => ({ id: randomUUID(), label, image })) },
  { id: randomUUID(), type: 'season', label: 'Ce anotimp este?', options: [['Primăvara','🌸'],['Vara','☀️'],['Toamna','🍂'],['Iarna','⛄']].map(([label,image]) => ({ id: randomUUID(), label, image })) },
  { id: randomUUID(), type: 'activity', label: 'Ce facem astăzi?', options: [] },
];

@Injectable()
export class MorningCalendarService {
  constructor(@InjectRepository(MorningCalendar) private readonly repo: MongoRepository<MorningCalendar>, private readonly groups: GroupsService) {}
  async find(query: MorningCalendarQueryDto, user: AuthenticatedUser) {
    const scope = await this.groups.scope(user);
    const where = { ...scope, ...(query.groupId ? { groupId: query.groupId } : {}), ...(query.date ? { date: query.date } : {}) };
    const rows = await this.repo.find({ where, order: { date: 'DESC' } });
    return rows.map(row => this.dto(row));
  }
  async findOne(id: string, user: AuthenticatedUser) { const row = await this.repo.findOne({ where: { _id: objectId(id) } }); if (!row) throw new NotFoundException('Calendarul nu a fost găsit.'); await this.groups.requireActive(row.groupId, user); return this.dto(row); }
  async save(dto: SaveMorningCalendarDto, user: AuthenticatedUser) {
    const group = await this.groups.requireActive(dto.groupId, user);
    let row = await this.repo.findOne({ where: { groupId: dto.groupId, date: dto.date } });
    if (!row) row = this.repo.create({ groupId: dto.groupId, kindergartenId: group.kindergartenId, date: dto.date, createdBy: user.userId, status: 'DRAFT' });
    if (row.status === 'IN_PROGRESS') throw new BadRequestException('Calendarul este deja pornit.');
    row.questions = dto.questions.map(question => ({ ...question, id: question.type + '-' + randomUUID(), options: question.options.map(option => ({ ...option, id: randomUUID() })) }));
    return this.dto(await this.repo.save(row));
  }
  async start(id: string, user: AuthenticatedUser) { const row = await this.raw(id, user); row.status = 'IN_PROGRESS'; row.startedAt = new Date(); return this.dto(await this.repo.save(row)); }
  async complete(id: string, user: AuthenticatedUser) { const row = await this.raw(id, user); row.status = 'COMPLETED'; row.completedAt = new Date(); return this.dto(await this.repo.save(row)); }
  async createDefaults(groupId: string, date: string, user: AuthenticatedUser) { return this.save({ groupId, date, questions: defaults() } as SaveMorningCalendarDto, user); }
  private async raw(id: string, user: AuthenticatedUser) { const row = await this.repo.findOne({ where: { _id: objectId(id) } }); if (!row) throw new NotFoundException('Calendarul nu a fost găsit.'); await this.groups.requireActive(row.groupId, user); return row; }
  private dto(row: MorningCalendar) { return { id: row._id.toString(), groupId: row.groupId, kindergartenId: row.kindergartenId, date: row.date, questions: row.questions, status: row.status, startedAt: row.startedAt, completedAt: row.completedAt }; }
}
