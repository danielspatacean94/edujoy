import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: MongoRepository<Banner>,
  ) {}

  async findAll(page = 1, limit = 20, search?: string): Promise<PaginatedResult<BannerResponseDto>> {
    const skip = (page - 1) * limit;
    const baseFilter = { deletedAt: null };
    const where = search
      ? { $and: [baseFilter, { message: { $regex: escapeRegex(search), $options: 'i' } }] }
      : baseFilter;
    const [banners, total] = await this.bannerRepo.findAndCount({
      where: where as any,
      order: { startDate: 'DESC' } as any,
      skip,
      take: limit,
    });
    return { data: banners.map(this.toDto), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Open to any authenticated role (see BannersController) — every banner
  // applies app-wide, there's no per-user/tenant scoping in this skeleton
  // (unlike itp-manager's station-scoped variant this was lifted from).
  async findActive(): Promise<BannerResponseDto[]> {
    const now = new Date();
    const banners = await this.bannerRepo.find({
      where: { deletedAt: null, startDate: { $lte: now }, endDate: { $gte: now } } as any,
      order: { startDate: 'ASC' } as any,
    });
    return banners.map(this.toDto);
  }

  async create(dto: CreateBannerDto): Promise<BannerResponseDto> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.validateDateRange(startDate, endDate);

    const banner = this.bannerRepo.create({
      message: dto.message,
      startDate,
      endDate,
      style: dto.style,
    });
    const saved = await this.bannerRepo.save(banner);
    return this.toDto(saved);
  }

  async update(id: string, dto: UpdateBannerDto): Promise<BannerResponseDto> {
    const banner = await this.bannerRepo.findOne({
      where: { _id: new ObjectId(id), deletedAt: null } as any,
    });
    if (!banner) throw new NotFoundException('Anunțul nu a fost găsit.');

    if (dto.message !== undefined) banner.message = dto.message;
    if (dto.startDate !== undefined) banner.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) banner.endDate = new Date(dto.endDate);
    if (dto.style !== undefined) banner.style = dto.style;

    this.validateDateRange(banner.startDate, banner.endDate);

    const saved = await this.bannerRepo.save(banner);
    return this.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const banner = await this.bannerRepo.findOne({
      where: { _id: new ObjectId(id), deletedAt: null } as any,
    });
    if (!banner) throw new NotFoundException('Anunțul nu a fost găsit.');
    banner.deletedAt = new Date();
    await this.bannerRepo.save(banner);
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new BadRequestException('Data de început trebuie să fie înaintea datei de sfârșit.');
    }
  }

  private toDto(banner: Banner): BannerResponseDto {
    return {
      id: banner._id.toString(),
      message: banner.message,
      startDate: banner.startDate,
      endDate: banner.endDate,
      style: banner.style,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}
