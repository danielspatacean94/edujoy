import {
  Controller,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Put,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Teacher directory is available only to administrators.
  @Get()
  @Roles('admin')
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('admin')
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/reset-password')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
