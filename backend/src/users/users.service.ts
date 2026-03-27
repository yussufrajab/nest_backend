import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { institutionId?: string; role?: string }) {
    const users = await this.prisma.user.findMany({
      where: filters,
      include: { institution: true, employee: true },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      active: user.active,
      institutionId: user.institutionId,
      institution: user.institution ? { id: user.institution.id, name: user.institution.name } : null,
      employeeId: user.employeeId,
      phoneNumber: user.phoneNumber,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { institution: true, employee: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      active: user.active,
      institutionId: user.institutionId,
      institution: { id: user.institution.id, name: user.institution.name },
      employeeId: user.employeeId,
      employee: user.employee
        ? {
            id: user.employee.id,
            name: user.employee.name,
            zanId: user.employee.zanId,
            payrollNumber: user.employee.payrollNumber,
          }
        : null,
      phoneNumber: user.phoneNumber,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    if (createUserDto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: createUserDto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        id: uuidv4(),
        ...createUserDto,
        password: hashedPassword,
      },
      include: { institution: true, employee: true },
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      active: user.active,
      institutionId: user.institutionId,
      institution: { id: user.institution.id, name: user.institution.name },
      employeeId: user.employeeId,
      phoneNumber: user.phoneNumber,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const data: any = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { institution: true, employee: true },
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      active: user.active,
      institutionId: user.institutionId,
      institution: { id: user.institution.id, name: user.institution.name },
      employeeId: user.employeeId,
      phoneNumber: user.phoneNumber,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async delete(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.user.delete({
      where: { id },
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
    };
  }

  async resetPassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
    };
  }

  async unlock(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { active: true },
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      active: user.active,
    };
  }
}
