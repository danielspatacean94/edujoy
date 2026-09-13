import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @Roles('admin')
  findAll(@Query() query: PaginationQueryDto) {
    return this.bannersService.findAll(query.page, query.limit, query.search);
  }

  // Open to any authenticated role — consumed by Header to show banners
  // active right now. Not @Roles()-gated, matching the RolesGuard
  // convention: a handler with no declared roles allows any authenticated
  // user through.
  @Get('active')
  findActive() {
    return this.bannersService.findActive();
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }
}
