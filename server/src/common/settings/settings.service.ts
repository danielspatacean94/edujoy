import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Settings } from './entities/settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private readonly repo: MongoRepository<Settings>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed(): Promise<void> {
    const existing = await this.repo.findOne({ where: {} as any });
    if (!existing) {
      await this.repo.save(this.repo.create({ global: {} }));
    }
  }

  async get(): Promise<Settings> {
    return this.repo.findOne({ where: {} as any }) as Promise<Settings>;
  }

  async update(dto: UpdateSettingsDto): Promise<Settings> {
    await this.repo.updateOne({} as any, { $set: { global: dto.global } } as any);
    return this.get();
  }
}
