import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
  };

  const mockUser = {
    id: 'user-001',
    name: 'Test User',
    username: 'testuser',
    role: 'HRO',
    institutionId: 'inst-001',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should return access token on successful login', async () => {
      const mockResult = {
        access_token: 'mock-jwt-token',
        user: mockUser,
      };
      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'New User',
      username: 'newuser',
      password: 'password123',
      role: 'HRO' as const,
      institutionId: 'inst-001',
    };

    it('should return access token on successful registration', async () => {
      const mockResult = {
        access_token: 'mock-jwt-token',
        user: { ...mockUser, username: 'newuser' },
      };
      mockAuthService.register.mockResolvedValue(mockResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException for duplicate username', async () => {
      mockAuthService.register.mockRejectedValue(new BadRequestException('Username already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should return success message', async () => {
      const mockResult = { message: 'OTP sent successfully' };
      mockAuthService.forgotPassword.mockResolvedValue(mockResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(mockResult);
      expect(service.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });

    it('should throw BadRequestException when user not found', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new BadRequestException('User not found'));

      await expect(controller.forgotPassword(forgotPasswordDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      otp: '123456',
      newPassword: 'newpassword123',
    };

    it('should return success message', async () => {
      const mockResult = { message: 'Password reset successfully' };
      mockAuthService.resetPassword.mockResolvedValue(mockResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(mockResult);
      expect(service.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      mockAuthService.resetPassword.mockRejectedValue(new BadRequestException('Invalid OTP'));

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: 'user-001',
        name: 'Test User',
        username: 'testuser',
        role: 'HRO',
        institution: { id: 'inst-001', name: 'Test Institution' },
      };
      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile({ id: 'user-001' });

      expect(result).toEqual(mockProfile);
      expect(service.getProfile).toHaveBeenCalledWith('user-001');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthService.getProfile.mockRejectedValue(new UnauthorizedException());

      await expect(controller.getProfile({ id: 'non-existent' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const mockResult = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(mockResult);

      const result = await controller.logout({ id: 'user-001' });

      expect(result).toEqual(mockResult);
      expect(service.logout).toHaveBeenCalledWith('user-001');
    });
  });
});
