import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { employee: true, institution: true },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      institutionId: user.institutionId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        institutionId: user.institutionId,
        institutionName: user.institution?.name,
        employeeId: user.employeeId,
        phoneNumber: user.phoneNumber,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    if (registerDto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: registerDto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        id: uuidv4(),
        name: registerDto.name,
        username: registerDto.username,
        password: hashedPassword,
        role: registerDto.role,
        institutionId: registerDto.institutionId,
        employeeId: registerDto.employeeId,
        phoneNumber: registerDto.phoneNumber,
        email: registerDto.email,
      },
      include: { institution: true },
    });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      institutionId: user.institutionId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        institutionId: user.institutionId,
        institutionName: user.institution?.name,
        employeeId: user.employeeId,
        phoneNumber: user.phoneNumber,
        email: user.email,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true, institution: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found with this email');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token: otp,
        expiresAt,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      return {
        message: 'OTP sent successfully',
        otp,
      };
    }

    return { message: 'OTP sent successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: resetPasswordDto.otp,
        isUsed: false,
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      10,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async logout(userId: string) {
    return { message: 'Logged out successfully' };
  }
}
