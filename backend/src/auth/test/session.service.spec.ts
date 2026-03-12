import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../../sessions/session.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../../common/logger/logger.service';

describe('SessionService', () => {
  let service: SessionService;

  const mockPrismaService = {
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockLoggerService = {
    activity: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a session and invalidate old ones', async () => {
    const mockSession = {
      id: 'session-1',
      firebaseUid: 'firebase-123',
      token: 'token-123',
    };

    mockPrismaService.session.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.session.create.mockResolvedValue(mockSession);

    const result = await service.createSession({
      firebaseUid: 'firebase-123',
      email: 'test@example.com',
      token: 'token-123',
    });

    expect(mockPrismaService.session.updateMany).toHaveBeenCalledWith({
      where: {
        firebaseUid: 'firebase-123',
        isActive: true,
      },
      data: { isActive: false },
    });

    expect(mockPrismaService.session.create).toHaveBeenCalled();
    expect(result).toEqual(mockSession);
  });

  it('should validate an active session', async () => {
    const mockSession = {
      id: 'session-1',
      isActive: true,
      expiresAt: new Date(Date.now() + 3600000),
    };

    mockPrismaService.session.findFirst.mockResolvedValue(mockSession);
    mockPrismaService.session.update.mockResolvedValue({});

    const result = await service.validateSession('valid-token');

    expect(result).toBe(true);
    expect(mockPrismaService.session.update).toHaveBeenCalled();
  });

  it('should invalidate expired session', async () => {
    mockPrismaService.session.findFirst.mockResolvedValue(null);

    const result = await service.validateSession('expired-token');

    expect(result).toBe(false);
  });

  it('should invalidate all user sessions', async () => {
    mockPrismaService.session.findMany.mockResolvedValue([
      { id: 'session-1' },
      { id: 'session-2' },
    ]);
    mockPrismaService.session.updateMany.mockResolvedValue({ count: 2 });

    await service.invalidateAllUserSessions('firebase-123');

    expect(mockPrismaService.session.updateMany).toHaveBeenCalledWith({
      where: {
        firebaseUid: 'firebase-123',
        isActive: true,
      },
      data: { isActive: false },
    });
  });

  it('should cleanup expired sessions', async () => {
    mockPrismaService.session.updateMany.mockResolvedValue({ count: 5 });

    const result = await service.cleanupExpiredSessions();

    expect(result).toBe(5);
    expect(mockPrismaService.session.updateMany).toHaveBeenCalledWith({
      where: {
        expiresAt: { lt: expect.any(Date) },
        isActive: true,
      },
      data: { isActive: false },
    });
  });
});
