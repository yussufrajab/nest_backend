import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let notificationsService: NotificationsService;

  const mockUser = {
    id: 'user-001',
    name: 'Test User',
    username: 'testuser',
    password: 'hashedpassword',
    role: 'HRO',
    active: true,
    institutionId: 'inst-001',
    employeeId: null,
    phoneNumber: null,
    email: 'test@example.com',
    institution: { id: 'inst-001', name: 'Test Institution' },
    employee: null,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockNotificationsService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    notificationsService = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        include: { employee: true, institution: true },
      });
    });

    it('should return null when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException when account is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser('testuser', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { username: 'testuser', password: 'password123' };

    it('should return access token and user data on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        username: mockUser.username,
        role: mockUser.role,
        institutionId: mockUser.institutionId,
        institutionName: mockUser.institution.name,
        employeeId: mockUser.employeeId,
        phoneNumber: mockUser.phoneNumber,
        email: mockUser.email,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        institutionId: mockUser.institutionId,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'New User',
      username: 'newuser',
      password: 'password123',
      role: 'HRO' as const,
      institutionId: 'inst-001',
      employeeId: undefined,
      phoneNumber: undefined,
      email: 'newuser@example.com',
    };

    it('should create a new user and return access token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: registerDto.name,
        username: registerDto.username,
        email: registerDto.email,
      });

      const result = await service.register(registerDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when username already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: registerDto.username },
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getProfile('user-001');

      expect(result).toBeDefined();
      expect((result as any).password).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-001' },
        include: { employee: true, institution: true },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto = { email: 'test@example.com' };

    it('should create reset token and send email', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue({
        id: 'token-001',
        userId: mockUser.id,
        token: '123456',
      });

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.message).toBe('OTP sent successfully');
      expect(prisma.passwordResetToken.create).toHaveBeenCalled();
      expect(notificationsService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        15,
      );
    });

    it('should include OTP in response when not in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue({
        id: 'token-001',
        userId: mockUser.id,
        token: '123456',
      });

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.otp).toBeDefined();
      expect(result.otp).toHaveLength(6);

      process.env.NODE_ENV = originalEnv;
    });

    it('should throw BadRequestException when user not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      otp: '123456',
      newPassword: 'newpassword123',
    };

    it('should reset password successfully', async () => {
      const mockResetToken = {
        id: 'token-001',
        userId: 'user-001',
        token: '123456',
        expiresAt: new Date(Date.now() + 10000),
        isUsed: false,
        user: mockUser,
      };

      (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockResetToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
      (prisma.$transaction as jest.Mock).mockResolvedValue([]);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result.message).toBe('Password reset successfully');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when token is invalid', async () => {
      (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when token has expired', async () => {
      const expiredToken = {
        id: 'token-001',
        userId: 'user-001',
        token: '123456',
        expiresAt: new Date(Date.now() - 10000),
        isUsed: false,
        user: mockUser,
      };

      (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(expiredToken);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout('user-001');
      expect(result.message).toBe('Logged out successfully');
    });
  });
});
