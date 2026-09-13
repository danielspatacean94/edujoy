from pathlib import Path

def write(path, text):
    p = Path(path); p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text.strip() + '\n', encoding='utf-8')
def edit(path, old, new):
    p = Path(path); s = p.read_text(encoding='utf-8'); assert old in s, (path, old); p.write_text(s.replace(old,new), encoding='utf-8')

# Replace the skeleton's generic role with the concrete teaching role.
for root in ['server/src', 'ui/src']:
    for p in Path(root).rglob('*'):
        if p.suffix in ['.ts', '.tsx']:
            s=p.read_text(encoding='utf-8'); p.write_text(s.replace("'operator'", "'teacher'").replace('value="operator">Operator', 'value="teacher">Teacher'), encoding='utf-8')

for kind, fields in [('Kindergarten', '  @Column()\n  name: string;\n  @Column()\n  location: string;'), ('Child', '  @Column()\n  name: string;\n  @Column()\n  age: number;\n  @Column()\n  kindergartenId: string;')]:
    folder = 'kindergartens' if kind == 'Kindergarten' else 'children'
    write(f'server/src/domain/{folder}/entities/{kind.lower()}.entity.ts', f'''
import {{ Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn }} from 'typeorm';
import {{ ObjectId }} from 'mongodb';
@Entity('{kind.lower()}')
export class {kind} {{
  @ObjectIdColumn() _id: ObjectId;
{fields}
  @Column({{ nullable: true, default: null }}) deletedAt: Date | null = null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}}
''')
    extra = '  @IsString() @Length(1, 250) @Transform(({ value }) => typeof value === "string" ? value.trim() : value) location: string;' if kind == 'Kindergarten' else '  @IsInt() @Min(0) @Max(18) age: number;\n  @IsOptional() @IsMongoId() kindergartenId?: string;'
    write(f'server/src/domain/{folder}/dto/{kind.lower()}.dto.ts', f'''
import {{ IsString, Length, IsInt, Min, Max, IsOptional, IsMongoId }} from 'class-validator';
import {{ Transform }} from 'class-transformer';
export class Save{kind}Dto {{
  @IsString() @Length(1, 120) @Transform(({{ value }}) => typeof value === 'string' ? value.trim() : value) name: string;
{extra}
}}
export class {kind}ResponseDto {{
  id: string;
  name: string;
  {'location: string;' if kind == 'Kindergarten' else 'age: number; kindergartenId: string;'}
  createdAt: Date;
  updatedAt: Date;
}}
''')

write('server/src/domain/kindergartens/kindergartens.service.ts', '''
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
  return search ? { name: { $regex: search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), $options: 'i' } } : {};
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
''')
write('server/src/domain/children/children.service.ts', '''
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
''')
for folder, kind in [('kindergartens', 'Kindergarten'), ('children','Child')]:
    cls= 'Kindergartens' if folder=='kindergartens' else 'Children'
    child=folder=='children'
    args=', @CurrentUser() user: AuthenticatedUser' if child else ''
    call=', user' if child else ''
    write(f'server/src/domain/{folder}/{folder}.controller.ts', f'''
import {{ Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards }} from '@nestjs/common';
import {{ {cls}Service }} from './{folder}.service';
import {{ Save{kind}Dto }} from './dto/{kind.lower()}.dto';
import {{ PaginationQueryDto }} from '../../common/dto/pagination.dto';
import {{ JwtAuthGuard }} from '../../common/guards/jwt-auth.guard';
import {{ RolesGuard }} from '../../common/guards/roles.guard';
import {{ Roles }} from '../../common/decorators/roles.decorator';
import {{ CurrentUser }} from '../../common/decorators/current-user.decorator';
import {{ AuthenticatedUser }} from '../../common/interfaces/jwt-payload.interface';
@Controller('{folder}')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles({'"admin", "teacher"' if child else '"admin"'})
export class {cls}Controller {{
  constructor(private readonly service: {cls}Service) {{}}
  @Get() findAll(@Query() query: PaginationQueryDto{args}) {{ return this.service.findAll(query{call}); }}
  @Get(':id') findOne(@Param('id') id: string{args}) {{ return this.service.findOne(id{call}); }}
  @Post() create(@Body() dto: Save{kind}Dto{args}) {{ return this.service.create(dto{call}); }}
  @Put(':id') update(@Param('id') id: string, @Body() dto: Save{kind}Dto{args}) {{ return this.service.update(id, dto{call}); }}
  @Delete(':id') remove(@Param('id') id: string{args}) {{ return this.service.remove(id{call}); }}
}}
''')
    write(f'server/src/domain/{folder}/{folder}.module.ts', f'''
import {{ Module }} from '@nestjs/common';
import {{ TypeOrmModule }} from '@nestjs/typeorm';
import {{ {kind} }} from './entities/{kind.lower()}.entity';
import {{ {cls}Service }} from './{folder}.service';
import {{ {cls}Controller }} from './{folder}.controller';
{ "import { KindergartensModule } from '../kindergartens/kindergartens.module';" if child else "import { User } from '../users/entities/user.entity'; import { Child } from '../children/entities/child.entity';" }
@Module({{
  imports: [TypeOrmModule.forFeature([{kind}{'' if child else ', User, Child'}]){', KindergartensModule' if child else ''}],
  providers: [{cls}Service], controllers: [{cls}Controller], exports: [{cls}Service],
}})
export class {cls}Module {{}}
''')

edit('server/src/common/database/database.module.ts', "import { Module }", "import { Kindergarten } from '../../domain/kindergartens/entities/kindergarten.entity';\nimport { Child } from '../../domain/children/entities/child.entity';\nimport { Module }")
edit('server/src/common/database/database.module.ts', 'Notification, Banner]', 'Notification, Banner, Kindergarten, Child]')
edit('server/src/app.module.ts', "import { Module,", "import { KindergartensModule } from './domain/kindergartens/kindergartens.module';\nimport { ChildrenModule } from './domain/children/children.module';\nimport { Module,")
edit('server/src/app.module.ts', '    BannersModule,', '    BannersModule,\n    KindergartensModule,\n    ChildrenModule,')
edit('server/src/domain/users/users.module.ts', "import { Module }", "import { KindergartensModule } from '../kindergartens/kindergartens.module';\nimport { Module }")
edit('server/src/domain/users/users.module.ts', 'imports: [', 'imports: [KindergartensModule, ')
edit('server/src/domain/users/entities/user.entity.ts', '  @CreateDateColumn()', '  @Column({ nullable: true, default: null })\n  kindergartenId: string | null;\n\n  @CreateDateColumn()')
for path in ['server/src/domain/users/dto/user-response.dto.ts','server/src/common/interfaces/jwt-payload.interface.ts']:
    edit(path, "  role: 'admin' | 'teacher';", "  role: 'admin' | 'teacher';\n  kindergartenId?: string | null;")
for path in ['server/src/domain/users/dto/create-user.dto.ts', 'server/src/domain/users/dto/update-user.dto.ts']:
    edit(path, "import {", "import { IsMongoId, Length, ValidateIf,")
    edit(path, '  @IsOptional()\n  @IsString()\n  fullName?: string;', '  @ValidateIf((_, value) => value !== undefined)\n  @IsString()\n  @Length(1, 120)\n  fullName?: string;\n\n  @ValidateIf((_, value) => value !== undefined)\n  @IsMongoId()\n  kindergartenId?: string;')
edit('server/src/domain/users/dto/create-user.dto.ts','@MinLength(6)', '@MinLength(8)')
edit('server/src/domain/users/users.service.ts', "import {\n", "import { KindergartensService, objectId } from '../kindergartens/kindergartens.service';\nimport {\n")
edit('server/src/domain/users/users.service.ts', '    private readonly configService: ConfigService,', '    private readonly configService: ConfigService,\n    private readonly kindergartens: KindergartensService,')
edit('server/src/domain/users/users.service.ts', '    const existing = await this.findByEmail(dto.email);', '''    dto.email = dto.email.trim().toLowerCase();
    if (!dto.fullName?.trim()) throw new BadRequestException('Name is required');
    if (!dto.password) throw new BadRequestException('A temporary password is required');
    if ((dto.role ?? 'teacher') === 'teacher') {
      if (!dto.kindergartenId) throw new BadRequestException('Teachers need a kindergarten');
      await this.kindergartens.requireActive(dto.kindergartenId);
    }
    const existing = await this.findByEmail(dto.email);''')
edit('server/src/domain/users/users.service.ts', '      email: dto.email,', "      kindergartenId: (dto.role ?? 'teacher') === 'teacher' ? dto.kindergartenId : null,\n      email: dto.email,")
edit('server/src/domain/users/users.service.ts', '    if (dto.fullName !== undefined) user.fullName = dto.fullName;', '''    if (dto.fullName !== undefined && !dto.fullName.trim()) throw new BadRequestException('Name is required');
    const role = dto.role ?? user.role;
    const kindergartenId = dto.kindergartenId ?? user.kindergartenId;
    if (role === 'teacher') {
      if (!kindergartenId) throw new BadRequestException('Teachers need a kindergarten');
      await this.kindergartens.requireActive(kindergartenId);
    }
    user.kindergartenId = role === 'teacher' ? kindergartenId : null;
    if (dto.fullName !== undefined) user.fullName = dto.fullName.trim();''')
edit('server/src/domain/users/users.service.ts', 'new ObjectId(id)', 'objectId(id)')
edit('server/src/domain/users/users.service.ts', 'where: { _id: objectId(id) }', 'where: { _id: objectId(id), deletedAt: null }')
edit('server/src/domain/users/users.service.ts', '      role: user.role,', '      role: user.role,\n      kindergartenId: user.kindergartenId ?? null,')
edit('server/src/domain/users/users.service.ts', 'where: { email, deletedAt: null }', 'where: { email: email.trim().toLowerCase(), deletedAt: null }')
edit('server/src/domain/users/users.controller.ts', '  @Get()\n', "  @Get()\n  @Roles('admin')\n")
edit('server/src/common/auth/strategies/jwt.strategy.ts', '      role: user.role,', '      role: user.role,\n      kindergartenId: user.kindergartenId ?? null,')
for path in ['ui/src/types/index.ts', 'ui/src/services/users.service.ts']:
    edit(path, "  role: 'admin' | 'teacher'", "  kindergartenId?: string | null\n  role: 'admin' | 'teacher'")
edit('ui/src/services/users.service.ts', "  role?: 'admin' | 'teacher'", "  kindergartenId?: string\n  role?: 'admin' | 'teacher'")
