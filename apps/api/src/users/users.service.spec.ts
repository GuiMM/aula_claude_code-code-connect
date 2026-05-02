import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
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

      expect(service.findByEmail('grace@example.com')).toBe(created);
    });

    it('retorna undefined quando o email não existe', () => {
      expect(service.findByEmail('ghost@example.com')).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('retorna o usuário criado', async () => {
      const created = await service.create({
        name: 'Linus',
        email: 'linus@example.com',
        password: 'kernel-panic',
      });

      expect(service.findById(created.id)).toBe(created);
    });

    it('retorna undefined quando o id não existe', () => {
      expect(service.findById('nope')).toBeUndefined();
    });
  });
});
