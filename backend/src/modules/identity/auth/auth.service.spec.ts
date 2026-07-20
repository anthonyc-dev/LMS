import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { TokenService } from 'src/common/services/token.service';
import { RefreshTokenService } from 'src/common/services/refresh-token.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock dependencies
const mockUsersService = {
  findById: jest.fn(),
};

const mockRefreshTokenRepo = {
  find: jest.fn(),
  update: jest.fn(),
};

const mockSessionRepo = {
  save: jest.fn(),
  update: jest.fn(),
};

const mockUserRepo = {
  update: jest.fn(),
  findOne: jest.fn(),
};

const mockTokenService = {
  verifyRefreshToken: jest.fn(),
  generateTokens: jest.fn(),
};

const mockRefreshTokenService = {
  saveRefreshToken: jest.fn(),
};

const mockJwtService = {};
const mockHttpService = {};

describe('AuthService - Refresh Token Logic', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepo,
        },
        { provide: getRepositoryToken(Session), useValue: mockSessionRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: TokenService, useValue: mockTokenService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('refreshTokens', () => {
    const mockUserId = 'user-1';
    const mockUser = {
      id: mockUserId,
      email: 'test@test.com',
    } as unknown as User;
    const mockSession = {
      id: 'session-1',
      lastUsedAt: new Date(),
    } as unknown as Session;
    const mockRawToken = 'raw-refresh-token';
    const mockHashedToken = 'hashed-refresh-token';

    it('should successfully rotate tokens if valid active token is provided', async () => {
      // Setup
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        sub: mockUserId,
      });
      mockUsersService.findById.mockResolvedValue(mockUser);

      const activeToken = {
        id: 'token-1',
        token: mockHashedToken,
        expiresAt: new Date(Date.now() + 100000), // future
        session: mockSession,
      };
      mockRefreshTokenRepo.find.mockResolvedValue([activeToken]);

      (bcrypt.compare as jest.Mock).mockImplementation((raw, hash) =>
        Promise.resolve(raw === mockRawToken && hash === mockHashedToken),
      );

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        refreshTokenHash: 'new-hash',
      });

      // Execute
      const result = await service.refreshTokens(mockRawToken);

      // Assert
      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { id: activeToken.id },
        { isRevoked: true },
      );
      expect(mockSessionRepo.save).toHaveBeenCalled();
      expect(mockRefreshTokenService.saveRefreshToken).toHaveBeenCalledWith(
        mockUser,
        'new-hash',
        mockSession,
      );
    });

    it('should throw UnauthorizedException and revoke session if reused (revoked) token is detected', async () => {
      // Setup
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        sub: mockUserId,
      });
      mockUsersService.findById.mockResolvedValue(mockUser);

      // Active tokens return empty (token was already revoked)
      mockRefreshTokenRepo.find.mockResolvedValueOnce([]);

      const revokedToken = {
        id: 'token-2',
        token: mockHashedToken,
        isRevoked: true,
        session: mockSession,
      };

      // All tokens return the revoked token
      mockRefreshTokenRepo.find.mockResolvedValueOnce([revokedToken]);

      (bcrypt.compare as jest.Mock).mockImplementation((raw, hash) =>
        Promise.resolve(raw === mockRawToken && hash === mockHashedToken),
      );

      // Execute & Assert
      await expect(service.refreshTokens(mockRawToken)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockSessionRepo.update).toHaveBeenCalledWith(
        { id: mockSession.id },
        { isRevoked: true },
      );
      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { session: { id: mockSession.id } },
        { isRevoked: true },
      );
    });
  });
});
