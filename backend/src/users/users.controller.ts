import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'HHRMD')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }

  @Post(':id/reset-password')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Post(':id/unlock')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async unlock(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.unlock(id);
  }
}
