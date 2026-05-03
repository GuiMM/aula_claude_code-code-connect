import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let store: User[];

  beforeEach(async () => {
    store = [];

    const mockRepo = {
      create: jest.fn((dto: Partial<User>) => ({ ...dto }) as User),
      save: jest.fn((user: User) => {
        const saved = { ...user, id: randomUUID() };
        store.push(saved);
        return Promise.resolve(saved);
      }),
      findOne: jest.fn(({ where }: { where: Partial<User> }) => {
        const [[key, val]] = Object.entries(where);
        return Promise.resolve(
          store.find((u) => u[key as keyof User] === val) ?? null,
        );
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('cria usuário com id e senha em hash', async () => {
      const user = await service.create({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'plaintext-pass',
      });

      expect(user.id).toEqual(expect.any(String));
      expect(user.id).toHaveLength(36);
      expect(user.name).toBe('Ada Lovelace');
      expect(user.email).toBe('ada@example.com');
      expect(user.password).not.toBe('plaintext-pass');
      expect(await bcrypt.compare('plaintext-pass', user.password)).toBe(true);
    });

    it('lança ConflictException quando o email já existe', async () => {
      await service.create({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'plaintext-pass',
      });

      await expect(
        service.create({
          name: 'Outra Ada',
          email: 'ada@example.com',
          password: 'outra-senha',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('retorna o usuário criado', async () => {
      const created = await service.create({
        name: 'Grace',
        email: 'grace@example.com',
        password: 'cobol-rocks',
      });

      expect(await service.findByEmail('grace@example.com')).toBe(created);
    });

    it('retorna null quando o email não existe', async () => {
      expect(await service.findByEmail('ghost@example.com')).toBeNull();
    });
  });

  describe('findById', () => {
    it('retorna o usuário criado', async () => {
      const created = await service.create({
        name: 'Linus',
        email: 'linus@example.com',
        password: 'kernel-panic',
      });

      expect(await service.findById(created.id)).toBe(created);
    });

    it('retorna null quando o id não existe', async () => {
      expect(await service.findById('nope')).toBeNull();
    });
  });
});
