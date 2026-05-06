# Plano: Persistência de usuários em PostgreSQL via TypeORM

## Contexto

Hoje `UsersService` ([apps/api/src/users/users.service.ts](apps/api/src/users/users.service.ts)) guarda os usuários em um array em memória (`private readonly users: User[] = []`). A consequência prática é que **todo restart da API apaga os cadastros** e tokens emitidos não correspondem mais a nenhum usuário real, inviabilizando qualquer uso além de testes manuais.

A meta é trocar o array por um banco PostgreSQL persistente, sem alterar contratos REST (`POST /v1/auth/register`, `POST /v1/auth/login`, `GET /v1/auth/me` continuam idênticos para o cliente). Para o ambiente de desenvolvimento, o Postgres roda via Docker Compose com volume nomeado, garantindo que os dados sobrevivam a `docker compose down`.

---

## Escolha do ORM: TypeORM

### Por que TypeORM

1. **Integração nativa com NestJS** — o pacote oficial `@nestjs/typeorm` é mantido pelo time do Nest e expõe `TypeOrmModule.forRootAsync` + `@InjectRepository(User)`, encaixando-se diretamente no sistema de DI/módulos já utilizado.
2. **Paradigma decorator coerente** — o restante da API já é construído sobre decorators (`@Injectable()`, `@Controller()`, `@Module()`, `@ApiProperty()`, `class-validator`). Anotar a entidade `User` com `@Entity()`/`@Column()` mantém um único modelo mental sem misturar paradigmas.
3. **Sem etapa de codegen** — `pnpm install` é suficiente; nenhum `prisma generate` na pipeline de dev.
4. **Repository pattern testável** — `Repository<User>` é fácil de mockar nos `*.spec.ts` via `getRepositoryToken(User)`, preservando a estratégia de testes atual.
5. **`synchronize: true` em dev** — evolução iterativa do schema sem precisar configurar pipeline de migrations agora.

### Alternativas consideradas

| ORM | Por que não foi escolhido |
|-----|---------------------------|
| **Prisma** | Excelente DX, mas exige `schema.prisma` separado e `prisma generate` como passo extra. Não usa decorators — convive mal com o estilo do Nest; a entidade `User` viraria um tipo gerado opaco em vez de uma classe que o Swagger e `class-validator` podem decorar. |
| **MikroORM** | Tipagem TS muito boa e Unit of Work nativo, mas comunidade menor que TypeORM no ecossistema Nest. Ganho marginal não compensa a curva de aprendizado num projeto-curso. |
| **Drizzle** | Leve e SQL-first, mas sem módulo Nest oficial; precisaríamos escrever a integração (provider customizado, transações) manualmente. |
| **Sequelize** | Tipagem TS mais fraca e API mais antiga; não combina com o rest do stack moderno. |
| **Knex** | Query builder, não ORM — não fornece entidade tipada; fica abaixo do nível de abstração desejado no `UsersService`. |

---

## Arquivos a criar

### 1. `docker-compose.yml` (raiz do monorepo)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: code-connect-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: code_connect
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d code_connect"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Volume **nomeado** `postgres_data` (gerenciado pelo Docker, sobrevive a `docker compose down`).

### 2. `apps/api/.env.example` (commitado — referência para equipe)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=code_connect

JWT_SECRET=dev-secret-do-not-use-in-production
JWT_EXPIRES_IN=1h
```

### 3. `apps/api/.env` (não commitado — já coberto pelo `.gitignore` raiz)

Cópia do `.env.example` com os valores de dev (idênticos nesse caso).

---

## Arquivos a modificar

### 4. `apps/api/package.json` — novas dependências

```
pnpm --filter api add @nestjs/typeorm typeorm pg @nestjs/config
```

### 5. `apps/api/src/users/entities/user.entity.ts`

Anotar com decorators TypeORM:

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
```

A constraint `unique` no `email` é a versão SQL do check que antes era feito no array.

### 6. `apps/api/src/users/users.service.ts`

Substituir o array pelo `Repository<User>` injetado:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException('Email já está em uso');
    }
    const user = this.users.create({
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, SALT_ROUNDS),
    });
    return this.users.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }
}
```

**Quebra de contrato (interno):** `findByEmail` e `findById` passam a retornar `Promise<User | null>` em vez de `User | undefined`. Propagado nos consumidores abaixo.

### 7. `apps/api/src/users/users.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 8. `apps/api/src/app.module.ts`

Registrar `ConfigModule` global e `TypeOrmModule.forRootAsync`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User],
        synchronize: true, // dev only
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

### 9. `apps/api/src/auth/auth.service.ts`

`validateCredentials` precisa de `await` em `findByEmail`:

```typescript
private async validateCredentials(email: string, password: string): Promise<User | null> {
  const user = await this.usersService.findByEmail(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}
```

### 10. `apps/api/src/auth/auth.controller.ts`

`me()` vira `async` e usa `await` em `findById`:

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
async me(@Request() req: RequestWithUser): Promise<UserResponseDto> {
  const user = await this.usersService.findById(req.user.userId);
  if (!user) throw new UnauthorizedException();
  return this.authService.toUserResponse(user);
}
```

### 11. `apps/api/src/users/users.service.spec.ts`

Trocar o `providers` para mockar o `Repository<User>` via `getRepositoryToken(User)`:

```typescript
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const mockRepo: Partial<jest.Mocked<Repository<User>>> = {
  create: jest.fn((dto) => ({ ...dto } as User)),
  save: jest.fn(),
  findOne: jest.fn(),
};

// no TestingModule:
{ provide: getRepositoryToken(User), useValue: mockRepo }
```

Os testes existentes continuam cobrindo: criação com hash, ConflictException, findByEmail, findById — apenas adaptados para o contrato assíncrono.

### 12. `apps/api/src/auth/auth.service.spec.ts`

Três mocks de `findByEmail` precisam virar `mockResolvedValue`:

- Linha 92: `usersService.findByEmail.mockReturnValue(validUser)` → `mockResolvedValue(validUser)`
- Linha 108: `mockReturnValue(undefined)` → `mockResolvedValue(null)`
- Linha 117: `mockReturnValue(validUser)` → `mockResolvedValue(validUser)`

---

## Verificação ponta-a-ponta

1. `docker compose up -d` na raiz → `docker compose ps` mostra `postgres` `(healthy)`.
2. `pnpm api:dev` — sem erros; TypeORM cria a tabela `users` automaticamente.
3. `POST /v1/auth/register` → `201` com `{id,name,email}`.
4. Mesmo payload de novo → `409 Conflict`.
5. `POST /v1/auth/login` → `200` com `access_token`.
6. `GET /v1/auth/me` com `Bearer <token>` → `200` com os dados do usuário.
7. `docker compose restart postgres` + login novamente → dados persistem.
8. `pnpm api:test` — todos os testes verdes.
9. `pnpm --filter api lint` — sem warnings.
