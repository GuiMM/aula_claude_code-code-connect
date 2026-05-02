# Plano — Backend de autenticação (NestJS)

## Context

A API em [apps/api/](apps/api/) hoje só tem o scaffolding `Hello World` do Nest. O objetivo é entregar 3 endpoints REST que sustentem o fluxo de autenticação que a UI já tem em [apps/web/](apps/web/):

1. `POST /v1/auth/register` — cadastra usuário (nome, email, senha)
2. `POST /v1/auth/login` — autentica e devolve um JWT
3. `GET /v1/auth/me` — devolve os dados do usuário logado, protegido por AuthGuard

Restrições: armazenamento **apenas em memória** (array dentro do `UsersService`, sem ORM, sem banco). Documentação via **Swagger** com inputs e outputs tipados. AuthGuard seguindo o padrão **Passport + JwtStrategy** da doc oficial do Nest. Segredo do JWT em uma constante hardcoded (com comentário marcando que em produção deve vir de env). Testes unitários para `AuthService` e `UsersService`.

## Dependências a instalar

```bash
pnpm --filter api add @nestjs/swagger @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer
pnpm --filter api add -D @types/passport-jwt @types/bcrypt
```

`uuid` não é necessário — usar `crypto.randomUUID()` (Node 20+, exigido pelo Nest 11).

## Estrutura de arquivos

### Novos
```
apps/api/src/
  users/
    users.module.ts
    users.service.ts
    users.service.spec.ts
    dto/create-user.dto.ts
    entities/user.entity.ts
  auth/
    auth.module.ts
    auth.service.ts
    auth.service.spec.ts
    auth.controller.ts
    constants.ts
    dto/
      login.dto.ts
      auth-response.dto.ts
      user-response.dto.ts
    strategies/jwt.strategy.ts
    guards/jwt-auth.guard.ts
```

### Modificados
- [apps/api/src/main.ts](apps/api/src/main.ts) — adicionar `setGlobalPrefix('v1')`, `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`), e setup do Swagger (`DocumentBuilder` + `addBearerAuth()`, exposto em `/docs`).
- [apps/api/src/app.module.ts](apps/api/src/app.module.ts) — limpar `controllers`/`providers` e importar `UsersModule` e `AuthModule`.

### Removidos
- [apps/api/src/app.controller.ts](apps/api/src/app.controller.ts)
- [apps/api/src/app.service.ts](apps/api/src/app.service.ts)
- [apps/api/test/app.controller.spec.ts](apps/api/test/app.controller.spec.ts) — testa endpoint removido
- [apps/api/test/app.e2e-spec.ts](apps/api/test/app.e2e-spec.ts) — testa `GET /` removido (e2e dos novos endpoints fica para depois)

## Detalhes de implementação

### `users/entities/user.entity.ts`
```ts
export class User {
  id: string;
  name: string;
  email: string;
  password: string; // hash bcrypt
}
```

### `users/dto/create-user.dto.ts`
- `name`: `@IsString` `@IsNotEmpty` `@MinLength(2)` + `@ApiProperty`
- `email`: `@IsEmail` + `@ApiProperty`
- `password`: `@IsString` `@MinLength(8)` + `@ApiProperty({ minLength: 8 })`

### `users/users.service.ts`
- `private readonly users: User[] = []`
- `async create(dto)`: chama `findByEmail`; se já existir → `ConflictException('Email já está em uso')`. Faz `bcrypt.hash(dto.password, 10)`, gera `crypto.randomUUID()`, dá `push` no array, retorna o `User`.
- `findByEmail(email)`: `this.users.find(u => u.email === email)`
- `findById(id)`: `this.users.find(u => u.id === id)`

### `users/users.module.ts`
- `providers: [UsersService]`, `exports: [UsersService]`.

### `auth/constants.ts`
```ts
// TODO: mover para variável de ambiente em produção
export const jwtConstants = {
  secret: 'dev-secret-do-not-use-in-production',
  expiresIn: '1h',
};
```

### `auth/dto/login.dto.ts`
- `email`: `@IsEmail` + `@ApiProperty`
- `password`: `@IsString` `@IsNotEmpty` + `@ApiProperty`

### `auth/dto/auth-response.dto.ts`
- `access_token: string` com `@ApiProperty`.

### `auth/dto/user-response.dto.ts`
- `id`, `name`, `email` — sem `password`. Todos com `@ApiProperty`. Esse é o tipo retornado por `register` e `me`.

### `auth/strategies/jwt.strategy.ts`
Padrão Passport literal da doc:
```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### `auth/guards/jwt-auth.guard.ts`
```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### `auth/auth.service.ts`
- `register(dto: CreateUserDto): Promise<UserResponseDto>` — delega para `usersService.create`, devolve `{ id, name, email }` (sem senha).
- `validateUser(email, pass)` — `findByEmail` + `bcrypt.compare`. Retorna `User | null`.
- `login(dto: LoginDto): Promise<AuthResponseDto>` — chama `validateUser`; se `null` → `UnauthorizedException('Credenciais inválidas')`. Caso contrário, `jwtService.signAsync({ sub: user.id, email: user.email })` e retorna `{ access_token }`.

### `auth/auth.controller.ts`
- `@ApiTags('auth')` + `@Controller('auth')` (junto com prefixo global `v1`, vira `/v1/auth/...`).
- `POST register` — `@HttpCode(201)`, `@ApiResponse({ status: 201, type: UserResponseDto })`, `@ApiResponse({ status: 409 })`.
- `POST login` — `@HttpCode(200)`, `@ApiResponse({ status: 200, type: AuthResponseDto })`, `@ApiResponse({ status: 401 })`.
- `GET me` — `@UseGuards(JwtAuthGuard)`, `@ApiBearerAuth()`, `@ApiResponse({ status: 200, type: UserResponseDto })`, `@ApiResponse({ status: 401 })`. Lê `req.user.userId`, faz `usersService.findById`, retorna `{ id, name, email }`.

### `auth/auth.module.ts`
```ts
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

## Testes (`*.spec.ts`)

### `users.service.spec.ts`
- `create` cria usuário com `id` (uuid v4) e senha **hashed** (não igual ao plaintext).
- `create` lança `ConflictException` quando email já existe.
- `findByEmail` retorna o usuário criado; retorna `undefined` para email desconhecido.
- `findById` análogo.

### `auth.service.spec.ts`
- `register` delega para `usersService.create` e retorna objeto **sem** `password`.
- `login` retorna `{ access_token }` com credenciais válidas (mocka `JwtService.signAsync`).
- `login` lança `UnauthorizedException` quando o usuário não existe.
- `login` lança `UnauthorizedException` quando a senha está errada.

Mockar `UsersService` e `JwtService` com providers customizados em cada `Test.createTestingModule`.

## Verificação end-to-end

1. `pnpm --filter api lint` — sem erros de tipo/lint.
2. `pnpm --filter api test` — todos os specs passam.
3. `pnpm api:dev` — servidor sobe na porta 3000 sem warnings.
4. `http://localhost:3000/docs` — Swagger UI carrega com os 3 endpoints e schemas das DTOs visíveis.
5. Fluxo manual (Swagger UI ou curl):
   - `POST /v1/auth/register` com `{ name, email, password }` válidos → **201** + `{ id, name, email }`.
   - `POST /v1/auth/register` com email repetido → **409**.
   - `POST /v1/auth/register` com payload inválido (ex.: senha curta) → **400** com mensagens do `class-validator`.
   - `POST /v1/auth/login` com credenciais corretas → **200** + `{ access_token }`.
   - `POST /v1/auth/login` com senha errada → **401**.
   - `GET /v1/auth/me` sem header → **401**.
   - `GET /v1/auth/me` com `Authorization: Bearer <token>` → **200** + dados do usuário (sem `password`).
