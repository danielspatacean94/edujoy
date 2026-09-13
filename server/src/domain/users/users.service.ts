import { KindergartensService, objectId } from '../kindergartens/kindergartens.service';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: MongoRepository<User>,
    private readonly configService: ConfigService,
    private readonly kindergartens: KindergartensService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string): Promise<PaginatedResult<UserResponseDto>> {
    const skip = (page - 1) * limit;
    const baseFilter = { deletedAt: null, role: 'teacher' };
    const where = search
      ? {
          $and: [
            baseFilter,
            {
              $or: [
                { email: { $regex: escapeRegex(search), $options: 'i' } },
                { fullName: { $regex: escapeRegex(search), $options: 'i' } },
              ],
            },
          ],
        }
      : baseFilter;
    const [users, total] = await this.userRepo.findAndCount({
      where: where as any,
      skip,
      take: limit,
    });
    return { data: users.map(this.toDto), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({
      where: { _id: objectId(id), deletedAt: null } as any,
    });
    if (!user) throw new NotFoundException('Utilizatorul nu a fost găsit.');
    return this.toDto(user);
  }

  async getMe(id: string): Promise<MeResponseDto> {
    const user = await this.userRepo.findOne({
      where: { _id: objectId(id), deletedAt: null } as any,
    });
    if (!user) throw new NotFoundException('Utilizatorul nu a fost găsit.');
    return { ...this.toDto(user), passwordExpiresAt: user.passwordExpiresAt ?? null };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email: email.trim().toLowerCase(), deletedAt: null } as any });
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    dto.email = dto.email.trim().toLowerCase();
    if (!dto.fullName?.trim()) throw new BadRequestException('Numele este obligatoriu.');
    if (!dto.password) throw new BadRequestException('Parola temporară este obligatorie.');
    if ((dto.role ?? 'teacher') === 'teacher') {
      if (!dto.kindergartenId) throw new BadRequestException('Educatorii trebuie să fie atribuiți unei grădinițe.');
      await this.kindergartens.requireActive(dto.kindergartenId);
    }
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Adresa de e-mail este deja folosită.');

    const hashed = dto.password ? await bcrypt.hash(dto.password, 10) : null;
    const user = this.userRepo.create({
      kindergartenId: (dto.role ?? 'teacher') === 'teacher' ? dto.kindergartenId : null,
      email: dto.email,
      fullName: dto.fullName.trim(),
      password: hashed,
      role: dto.role ?? 'teacher',
      passwordExpiresAt: new Date(),
    });
    const saved = await this.userRepo.save(user);
    return this.toDto(saved);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({
      where: { _id: objectId(id), deletedAt: null } as any,
    });
    if (!user) throw new NotFoundException('Utilizatorul nu a fost găsit.');

    if (dto.fullName !== undefined && !dto.fullName.trim()) throw new BadRequestException('Numele este obligatoriu.');
    const role = dto.role ?? user.role;
    const kindergartenId = dto.kindergartenId ?? user.kindergartenId;
    if (role === 'teacher') {
      if (!kindergartenId) throw new BadRequestException('Educatorii trebuie să fie atribuiți unei grădinițe.');
      await this.kindergartens.requireActive(kindergartenId);
    }
    user.kindergartenId = role === 'teacher' ? kindergartenId : null;
    if (dto.fullName !== undefined) user.fullName = dto.fullName.trim();
    if (dto.role !== undefined) user.role = dto.role;

    const saved = await this.userRepo.save(user);
    return this.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { _id: objectId(id), deletedAt: null } as any,
    });
    if (!user) throw new NotFoundException('Utilizatorul nu a fost găsit.');
    user.deletedAt = new Date();
    await this.userRepo.save(user);
  }

  async findRawById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { _id: objectId(id), deletedAt: null } as any });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { _id: new ObjectId(userId) } as any,
    });
    if (!user) throw new NotFoundException('Utilizatorul nu a fost găsit.');
    if (!user.password) throw new BadRequestException('Acest cont nu permite autentificarea cu parolă.');

    const matches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!matches) throw new UnauthorizedException('Parola actuală este incorectă.');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Parola nouă trebuie să fie diferită de cea actuală.');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.passwordExpiresAt = this.computePasswordExpiry();
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;

    await this.userRepo.save(user);
  }

  async resetPassword(id: string): Promise<{ password: string }> {
    const user = await this.userRepo.findOne({
      where: { _id: objectId(id), deletedAt: null } as any,
    });
    if (!user) throw new NotFoundException('Utilizatorul nu a fost găsit.');

    const plain = this.generatePassword();
    user.password = await bcrypt.hash(plain, 10);
    user.passwordExpiresAt = new Date(); // already expired -> forced change on next login
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;

    await this.userRepo.save(user);

    return { password: plain };
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    return Array.from(randomBytes(16))
      .map((b) => chars[b % chars.length])
      .join('');
  }

  private computePasswordExpiry(): Date | null {
    const days = parseInt(
      this.configService.get<string>('PASSWORD_EXPIRY_DAYS') ?? '',
      10,
    );
    if (!days || isNaN(days)) return null;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }

  async seedAdmin(): Promise<void> {
    const existing = await this.userRepo.findOne({
      where: { role: 'admin' } as any,
    });
    if (existing) return;

    const adminEmail = this.configService.getOrThrow<string>('ADMIN_EMAIL').trim().toLowerCase();
    const adminPassword =
      this.configService.getOrThrow<string>('ADMIN_PASSWORD');
    const adminName = this.configService.get<string>('ADMIN_NAME') ?? null;

    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = this.userRepo.create({
      email: adminEmail,
      fullName: adminName,
      password: hashed,
      role: 'admin',
    });
    await this.userRepo.save(admin);
    console.log(`Seeded default admin: ${adminEmail}`);
  }

  toDto(user: User): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName ?? null,
      role: user.role,
      kindergartenId: user.kindergartenId ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
