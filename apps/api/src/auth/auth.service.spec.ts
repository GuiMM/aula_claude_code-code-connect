/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('delega para usersService.create e devolve resposta sem senha', async () => {
      const created: User = {
        id: 'user-1',
        name: 'Ada',
        email: 'ada@example.com',
        password: 'hashed-pass',
      };
      usersService.create.mockResolvedValue(created);

      const dto = {
        name: 'Ada',
        email: 'ada@example.com',
        password: 'plaintext',
      };

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: 'user-1',
        name: 'Ada',
        email: 'ada@example.com',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('propaga ConflictException do usersService', async () => {
      usersService.create.mockRejectedValue(new ConflictException());

      await expect(
        service.register({
          name: 'Ada',
          email: 'ada@example.com',
          password: 'plaintext',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    const validUser: User = {
      id: 'user-1',
      name: 'Ada',
      email: 'ada@example.com',
      password: '',
    };

    beforeEach(async () => {
      validUser.password = await bcrypt.hash('correct-pass', 10);
    });

    it('retorna access_token quando credenciais são válidas', async () => {
      usersService.findByEmail.mockReturnValue(validUser);
      jwtService.signAsync.mockResolvedValue('signed.jwt.token');

      const result = await service.login({
        email: 'ada@example.com',
        password: 'correct-pass',
      });

      expect(result).toEqual({ access_token: 'signed.jwt.token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'ada@example.com',
      });
    });

    it('lança UnauthorizedException quando o usuário não existe', async () => {
      usersService.findByEmail.mockReturnValue(undefined);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'whatever' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('lança UnauthorizedException quando a senha está errada', async () => {
      usersService.findByEmail.mockReturnValue(validUser);

      await expect(
        service.login({
          email: 'ada@example.com',
          password: 'wrong-pass',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
