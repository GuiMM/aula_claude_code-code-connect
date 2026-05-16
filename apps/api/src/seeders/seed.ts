import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Comment } from '../posts/entities/comment.entity';
import { Like } from '../posts/entities/like.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'code_connect',
  entities: [User, Post, Comment, Like],
  synchronize: false,
});

const USERS = [
  { name: 'Ana Beatriz', email: 'ana@codeconnect.dev', password: 'senha123' },
  { name: 'Carlos Henrique', email: 'carlos@codeconnect.dev', password: 'senha123' },
  { name: 'Fernanda Lima', email: 'fernanda@codeconnect.dev', password: 'senha123' },
];

const POSTS = [
  {
    title: 'Guia completo de async/await no TypeScript',
    description: 'Aprenda a lidar com código assíncrono de forma elegante usando async/await, Promises e tratamento de erros.',
    content: `## Introdução\n\nO \`async/await\` revolucionou a forma de escrever código assíncrono em JavaScript e TypeScript.\n\n\`\`\`typescript\nasync function fetchUser(id: string): Promise<User> {\n  const response = await fetch(\`/api/users/\${id}\`);\n  if (!response.ok) throw new Error('Usuário não encontrado');\n  return response.json();\n}\n\`\`\`\n\n## Tratamento de erros\n\nSempre use \`try/catch\` em funções \`async\`:\n\n\`\`\`typescript\ntry {\n  const user = await fetchUser('123');\n  console.log(user.name);\n} catch (error) {\n  console.error('Erro:', error);\n}\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
    authorIndex: 0,
  },
  {
    title: 'Arquitetura limpa com NestJS',
    description: 'Como organizar seu projeto NestJS seguindo os princípios da Clean Architecture e SOLID.',
    content: `## Módulos e injeção de dependência\n\nO NestJS foi projetado para arquitetura modular:\n\n\`\`\`typescript\n@Module({\n  imports: [TypeOrmModule.forFeature([User])],\n  controllers: [UsersController],\n  providers: [UsersService],\n  exports: [UsersService],\n})\nexport class UsersModule {}\n\`\`\`\n\n## Separação de responsabilidades\n\nMantenha controllers finos e services ricos em lógica de negócio.`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=450&fit=crop',
    authorIndex: 1,
  },
  {
    title: 'Tailwind CSS: do zero ao avançado',
    description: 'Um tour completo pelo Tailwind CSS v4, incluindo configuração, custom tokens e componentes reutilizáveis.',
    content: `## Por que Tailwind?\n\nTailwind é utility-first: você compõe classes diretamente no HTML.\n\n\`\`\`html\n<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">\n  Clique aqui\n</button>\n\`\`\`\n\n## Custom tokens\n\nDefina seus próprios tokens em \`tailwind.config.ts\` ou direto no CSS com variáveis customizadas.`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800&h=450&fit=crop',
    authorIndex: 2,
  },
  {
    title: 'TypeORM: Relacionamentos e Queries avançadas',
    description: 'Dominando relacionamentos ManyToMany, QueryBuilder e otimização de queries no TypeORM.',
    content: `## QueryBuilder\n\nPara queries complexas, use o QueryBuilder:\n\n\`\`\`typescript\nconst posts = await this.postsRepo\n  .createQueryBuilder('post')\n  .leftJoinAndSelect('post.author', 'author')\n  .where('post.title ILIKE :q', { q: \`%\${query}%\` })\n  .orderBy('post.createdAt', 'DESC')\n  .take(10)\n  .getMany();\n\`\`\``,
    thumbnailUrl: null,
    authorIndex: 0,
  },
  {
    title: 'Testes unitários com Jest e TypeScript',
    description: 'Como escrever testes unitários eficientes, usar mocks e coverage no ecossistema TypeScript.',
    content: `## Estrutura de um teste\n\n\`\`\`typescript\ndescribe('UsersService', () => {\n  let service: UsersService;\n\n  beforeEach(async () => {\n    const module = await Test.createTestingModule({\n      providers: [UsersService, { provide: getRepositoryToken(User), useValue: mockRepo }],\n    }).compile();\n    service = module.get(UsersService);\n  });\n\n  it('deve criar um usuário', async () => {\n    const result = await service.create({ name: 'Ana', email: 'ana@test.com', password: '123' });\n    expect(result.email).toBe('ana@test.com');\n  });\n});\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
    authorIndex: 1,
  },
  {
    title: 'Docker Compose para desenvolvimento local',
    description: 'Configure PostgreSQL, Redis e sua API com Docker Compose para um ambiente de dev reproduzível.',
    content: `## docker-compose.yml básico\n\n\`\`\`yaml\nservices:\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_DB: myapp\n      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: postgres\n    ports:\n      - "5432:5432"\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n\nvolumes:\n  postgres_data:\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=450&fit=crop',
    authorIndex: 2,
  },
  {
    title: 'Autenticação JWT do zero no NestJS',
    description: 'Implementando login seguro com JWT, refresh tokens e proteção de rotas no NestJS.',
    content: `## Gerando o token\n\n\`\`\`typescript\nasync login(dto: LoginDto): Promise<{ access_token: string }> {\n  const user = await this.usersService.findByEmail(dto.email);\n  const valid = await bcrypt.compare(dto.password, user.password);\n  if (!valid) throw new UnauthorizedException();\n  return { access_token: this.jwtService.sign({ sub: user.id, email: user.email }) };\n}\n\`\`\``,
    thumbnailUrl: null,
    authorIndex: 0,
  },
  {
    title: 'Git: fluxo de trabalho com Conventional Commits',
    description: 'Padronize seus commits usando Conventional Commits, commitlint e geração automática de changelog.',
    content: `## Estrutura\n\n\`\`\`\n<type>(scope): <description>\n\n[body]\n[footer]\n\`\`\`\n\n## Tipos comuns\n\n- \`feat\`: nova feature\n- \`fix\`: correção de bug\n- \`refactor\`: refatoração\n- \`test\`: testes\n- \`docs\`: documentação\n\n## Exemplo\n\n\`\`\`\nfeat(auth): add JWT refresh token support\n\nAdds refresh token endpoint and rotation logic.\n\nBREAKING CHANGE: /auth/login now returns refresh_token field\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=450&fit=crop',
    authorIndex: 1,
  },
  {
    title: 'PostgreSQL Full-Text Search na prática',
    description: 'Como usar tsvector, tsquery e índices GIN para busca full-text performática no PostgreSQL.',
    content: `## Criando o índice\n\n\`\`\`sql\nCREATE INDEX idx_posts_search ON posts\nUSING GIN(to_tsvector('portuguese', title || ' ' || description));\n\`\`\`\n\n## Consultando\n\n\`\`\`sql\nSELECT * FROM posts\nWHERE to_tsvector('portuguese', title || ' ' || description)\n  @@ plainto_tsquery('portuguese', 'typescript async');\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop',
    authorIndex: 2,
  },
  {
    title: 'React Hooks: guia prático e avançado',
    description: 'useState, useEffect, useCallback, useMemo, useRef e hooks customizados explicados com exemplos reais.',
    content: `## useState\n\n\`\`\`tsx\nconst [count, setCount] = useState(0);\n\`\`\`\n\n## useEffect\n\n\`\`\`tsx\nuseEffect(() => {\n  fetchData().then(setData);\n  return () => controller.abort(); // cleanup\n}, [id]);\n\`\`\`\n\n## Hook customizado\n\n\`\`\`tsx\nfunction usePosts(query: string) {\n  const [posts, setPosts] = useState([]);\n  useEffect(() => { fetchPosts(query).then(setPosts); }, [query]);\n  return posts;\n}\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    authorIndex: 0,
  },
  {
    title: 'Acessibilidade web: WCAG 2.2 na prática',
    description: 'Tornando sua aplicação acessível: contraste, aria-labels, navegação por teclado e testes com axe-core.',
    content: `## Contraste mínimo\n\nTexto normal precisa de razão de contraste 4.5:1, texto grande 3:1.\n\n## ARIA\n\n\`\`\`html\n<button aria-label="Fechar modal" aria-expanded="false">\n  <svg>...</svg>\n</button>\n\`\`\`\n\n## Testes automatizados\n\n\`\`\`typescript\nimport { axe } from 'jest-axe';\n\nit('deve passar nas regras de acessibilidade', async () => {\n  const { container } = render(<LoginForm />);\n  const results = await axe(container);\n  expect(results).toHaveNoViolations();\n});\n\`\`\``,
    thumbnailUrl: null,
    authorIndex: 1,
  },
  {
    title: 'Monorepos com pnpm workspaces',
    description: 'Configure um monorepo escalável com pnpm workspaces, compartilhamento de tipos e scripts unificados.',
    content: `## pnpm-workspace.yaml\n\n\`\`\`yaml\npackages:\n  - 'apps/*'\n  - 'packages/*'\n\`\`\`\n\n## Scripts da raiz\n\n\`\`\`json\n{\n  "scripts": {\n    "dev": "pnpm --parallel -r run dev",\n    "build": "pnpm -r run build",\n    "test": "pnpm -r run test"\n  }\n}\n\`\`\`\n\n## Filtrar por workspace\n\n\`\`\`bash\npnpm --filter api add express\npnpm --filter web add react\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=450&fit=crop',
    authorIndex: 2,
  },
  {
    title: 'Vite: configuração e otimizações',
    description: 'Domine o Vite 6: plugins, code splitting, lazy loading e configuração de ambientes.',
    content: `## vite.config.ts\n\n\`\`\`typescript\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n  build: {\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ['lodash', 'axios'],\n        },\n      },\n    },\n  },\n});\n\`\`\`\n\n## Lazy loading\n\n\`\`\`typescript\nconst AdminPage = lazy(() => import('./pages/AdminPage'));\n\`\`\``,
    thumbnailUrl: null,
    authorIndex: 0,
  },
  {
    title: 'Swagger + NestJS: documentação automática de APIs',
    description: 'Gere documentação OpenAPI automaticamente com decorators NestJS e @nestjs/swagger.',
    content: `## Setup básico\n\n\`\`\`typescript\nconst config = new DocumentBuilder()\n  .setTitle('CodeConnect API')\n  .setVersion('1.0')\n  .addBearerAuth()\n  .build();\n\nconst document = SwaggerModule.createDocument(app, config);\nSwaggerModule.setup('docs', app, document);\n\`\`\`\n\n## Decorators\n\n\`\`\`typescript\n@ApiProperty({ example: 'ana@example.com', description: 'Email do usuário' })\nemail: string;\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop',
    authorIndex: 1,
  },
  {
    title: 'Padrões de design: Factory e Strategy em TypeScript',
    description: 'Implementando os padrões Factory Method e Strategy em TypeScript com exemplos práticos.',
    content: `## Factory Method\n\n\`\`\`typescript\ninterface Notifier {\n  send(message: string): void;\n}\n\nclass EmailNotifier implements Notifier {\n  send(message: string) { /* envia email */ }\n}\n\nclass SmsNotifier implements Notifier {\n  send(message: string) { /* envia SMS */ }\n}\n\nfunction createNotifier(type: 'email' | 'sms'): Notifier {\n  return type === 'email' ? new EmailNotifier() : new SmsNotifier();\n}\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=450&fit=crop',
    authorIndex: 2,
  },
  {
    title: 'CI/CD com GitHub Actions para projetos Node.js',
    description: 'Configure pipelines de CI/CD automatizados com GitHub Actions: testes, lint, build e deploy.',
    content: `## Workflow básico\n\n\`\`\`yaml\nname: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16\n        env:\n          POSTGRES_PASSWORD: postgres\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '22'\n      - run: npm ci\n      - run: npm test\n\`\`\``,
    thumbnailUrl: null,
    authorIndex: 0,
  },
  {
    title: 'Zustand: gerenciamento de estado simples no React',
    description: 'Por que Zustand é melhor que Redux para a maioria dos projetos React em 2025.',
    content: `## Criando uma store\n\n\`\`\`typescript\nimport { create } from 'zustand';\n\ninterface AuthStore {\n  user: User | null;\n  setUser: (user: User | null) => void;\n}\n\nexport const useAuthStore = create<AuthStore>((set) => ({\n  user: null,\n  setUser: (user) => set({ user }),\n}));\n\`\`\`\n\n## Usando no componente\n\n\`\`\`tsx\nconst user = useAuthStore((state) => state.user);\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=800&h=450&fit=crop',
    authorIndex: 1,
  },
  {
    title: 'SQL avançado: Window Functions e CTEs',
    description: 'Domine OVER(), PARTITION BY, ROW_NUMBER e CTEs recursivas para consultas analíticas poderosas.',
    content: `## Window Functions\n\n\`\`\`sql\nSELECT\n  name,\n  salary,\n  AVG(salary) OVER (PARTITION BY department) AS dept_avg,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees;\n\`\`\`\n\n## CTE Recursiva\n\n\`\`\`sql\nWITH RECURSIVE subordinates AS (\n  SELECT id, name, manager_id FROM employees WHERE id = 1\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id\n  FROM employees e\n  JOIN subordinates s ON e.manager_id = s.id\n)\nSELECT * FROM subordinates;\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    authorIndex: 2,
  },
  {
    title: 'Segurança em APIs REST: JWT, CORS e Rate Limiting',
    description: 'Boas práticas de segurança para APIs em produção: headers, throttling, validação de input e HTTPS.',
    content: `## Helmet no NestJS\n\n\`\`\`typescript\nimport helmet from 'helmet';\napp.use(helmet());\n\`\`\`\n\n## Rate Limiting\n\n\`\`\`typescript\nimport { ThrottlerModule } from '@nestjs/throttler';\n\nThrottlerModule.forRoot([{\n  ttl: 60000, // 1 minuto\n  limit: 100, // máx 100 req/min\n}])\n\`\`\`\n\n## CORS\n\n\`\`\`typescript\napp.enableCors({\n  origin: process.env.FRONTEND_URL,\n  credentials: true,\n});\n\`\`\``,
    thumbnailUrl: null,
    authorIndex: 0,
  },
  {
    title: 'TypeScript Generics: poder e flexibilidade',
    description: 'Entenda Generics do TypeScript com exemplos reais: funções genéricas, constraintse utility types.',
    content: `## Função genérica\n\n\`\`\`typescript\nfunction first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n\`\`\`\n\n## Com constraint\n\n\`\`\`typescript\nfunction getId<T extends { id: string }>(entity: T): string {\n  return entity.id;\n}\n\`\`\`\n\n## Utility Types\n\n\`\`\`typescript\ntype UserUpdate = Partial<Pick<User, 'name' | 'email'>>;\n\`\`\``,
    thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop',
    authorIndex: 1,
  },
];

async function seed() {
  await dataSource.initialize();
  console.log('✅ Conectado ao banco de dados');

  const userRepo = dataSource.getRepository(User);
  const postRepo = dataSource.getRepository(Post);
  const commentRepo = dataSource.getRepository(Comment);
  const likeRepo = dataSource.getRepository(Like);

  const users: User[] = [];
  for (const userData of USERS) {
    let user = await userRepo.findOne({ where: { email: userData.email } });
    if (!user) {
      const hashed = await bcrypt.hash(userData.password, 10);
      user = userRepo.create({ ...userData, password: hashed });
      user = await userRepo.save(user);
      console.log(`👤 Usuário criado: ${user.name}`);
    } else {
      console.log(`👤 Usuário já existe: ${user.name}`);
    }
    users.push(user);
  }

  const existingPosts = await postRepo.count();
  if (existingPosts > 0) {
    console.log(`📝 Posts já existem (${existingPosts}), pulando seed de posts`);
    await dataSource.destroy();
    return;
  }

  const createdPosts: Post[] = [];
  for (const postData of POSTS) {
    const author = users[postData.authorIndex];
    const post = postRepo.create({
      title: postData.title,
      description: postData.description,
      content: postData.content,
      thumbnailUrl: postData.thumbnailUrl,
      userId: author.id,
    });
    const saved = await postRepo.save(post);
    createdPosts.push(saved);
  }
  console.log(`📝 ${createdPosts.length} posts criados`);

  const commentTexts = [
    'Excelente conteúdo! Aprendi muito.',
    'Muito bem explicado, obrigado!',
    'Esse post me ajudou demais no projeto.',
    'Salvei nos favoritos, vai ser muito útil.',
    'Poderia fazer um post sobre o próximo nível disso?',
    'Implementei aqui e funcionou perfeitamente!',
    'Conteúdo de qualidade, parabéns!',
  ];

  let commentCount = 0;
  let likeCount = 0;

  for (let i = 0; i < createdPosts.length; i++) {
    const post = createdPosts[i];
    const numLikes = Math.floor(Math.random() * (users.length + 1));
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    for (let j = 0; j < numLikes; j++) {
      await likeRepo.save(likeRepo.create({ postId: post.id, userId: shuffledUsers[j].id }));
      likeCount++;
    }

    if (i % 3 === 0) {
      const commentUser = users[i % users.length];
      await commentRepo.save(
        commentRepo.create({
          postId: post.id,
          userId: commentUser.id,
          content: commentTexts[i % commentTexts.length],
        }),
      );
      commentCount++;
    }
  }

  console.log(`❤️  ${likeCount} likes criados`);
  console.log(`💬 ${commentCount} comentários criados`);
  console.log('🌱 Seed concluído com sucesso!');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
