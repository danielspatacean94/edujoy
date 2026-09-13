import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

interface PackageJson {
  name: string;
  version: string;
}

const pkg: PackageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
);

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSettings() {
    const settings = await this.settingsService.get();
    return {
      appName: pkg.name,
      version: pkg.version,
      nodeEnv: process.env.NODE_ENV ?? 'development',
      global: settings.global,
    };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const settings = await this.settingsService.update(dto);
    return {
      appName: pkg.name,
      version: pkg.version,
      nodeEnv: process.env.NODE_ENV ?? 'development',
      global: settings.global,
    };
  }
}
