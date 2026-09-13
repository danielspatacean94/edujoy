import { BadRequestException, Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ChildrenService } from './children.service';
import { SaveChildDto, ChildQueryDto } from './dto/child.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "teacher")
export class ChildrenController {
  constructor(private readonly service: ChildrenService) {}
  @Get() findAll(@Query() query: ChildQueryDto, @CurrentUser() user: AuthenticatedUser) { return this.service.findAll(query, user); }
  @Get(':id/photo')
  async photo(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Res() response: Response): Promise<void> {
    const photo = await this.service.photo(id, user);
    response.setHeader('Content-Type', photo.mimetype);
    response.setHeader('Content-Length', photo.buffer.length);
    response.setHeader('Cache-Control', 'private, max-age=3600');
    response.send(photo.buffer);
  }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.findOne(id, user); }
  @Post() create(@Body() dto: SaveChildDto, @CurrentUser() user: AuthenticatedUser) { return this.service.create(dto, user); }
  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 150 * 1024 } }))
  uploadPhoto(@Param('id') id: string, @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined, @CurrentUser() user: AuthenticatedUser) {
    if (!file) throw new BadRequestException('Alege o fotografie.');
    return this.service.savePhoto(id, file, user);
  }
  @Put(':id') update(@Param('id') id: string, @Body() dto: SaveChildDto, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, dto, user); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.remove(id, user); }
}
