import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';

interface CommentStoreEntry extends Comment {
  author: { id: string; name: string } & any;
}

describe('PostsService - comments with parentId', () => {
  let service: PostsService;
  let posts: Array<Pick<Post, 'id' | 'userId'>>;
  let comments: CommentStoreEntry[];

  beforeEach(async () => {
    posts = [{ id: 'post-1', userId: 'user-1' } as any];
    comments = [];

    const mockPostsRepo = {
      findOne: jest.fn(({ where }: { where: Partial<Post> }) =>
        Promise.resolve(posts.find((p) => p.id === where.id) ?? null),
      ),
    };

    const mockCommentsRepo = {
      create: jest.fn((dto: Partial<Comment>) => ({ ...dto }) as Comment),
      save: jest.fn((comment: Comment) => {
        const saved = {
          ...comment,
          id: comment.id ?? randomUUID(),
          createdAt: new Date(),
          author: { id: comment.userId, name: 'Tester' },
        } as CommentStoreEntry;
        comments.push(saved);
        return Promise.resolve(saved);
      }),
      findOne: jest.fn(({ where }: { where: Partial<Comment> }) =>
        Promise.resolve(comments.find((c) => c.id === where.id) ?? null),
      ),
      createQueryBuilder: jest.fn(() => {
        let postIdFilter: string | undefined;
        const qb: any = {
          leftJoinAndSelect: jest.fn(() => qb),
          where: jest.fn((_: string, params: { postId: string }) => {
            postIdFilter = params.postId;
            return qb;
          }),
          orderBy: jest.fn(() => qb),
          getMany: jest.fn(() =>
            Promise.resolve(comments.filter((c) => c.postId === postIdFilter)),
          ),
        };
        return qb;
      }),
    };

    const mockLikesRepo = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockPostsRepo },
        { provide: getRepositoryToken(Comment), useValue: mockCommentsRepo },
        { provide: getRepositoryToken(Like), useValue: mockLikesRepo },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('createComment', () => {
    it('cria comentário top-level com parentId nulo', async () => {
      const result = await service.createComment(
        'post-1',
        { content: 'Olá' },
        'user-1',
      );
      expect(result.parentId).toBeNull();
      expect(result.content).toBe('Olá');
    });

    it('cria reply quando parentCommentId pertence ao mesmo post', async () => {
      const parent = await service.createComment(
        'post-1',
        { content: 'Comentário pai' },
        'user-1',
      );
      const reply = await service.createComment(
        'post-1',
        { content: 'Resposta', parentCommentId: parent.id },
        'user-1',
      );
      expect(reply.parentId).toBe(parent.id);
    });

    it('rejeita parentCommentId de outro post', async () => {
      posts.push({ id: 'post-2', userId: 'user-1' } as any);
      const otherParent = await service.createComment(
        'post-2',
        { content: 'Em outro post' },
        'user-1',
      );
      await expect(
        service.createComment(
          'post-1',
          { content: 'Resposta inválida', parentCommentId: otherParent.id },
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejeita parentCommentId inexistente', async () => {
      await expect(
        service.createComment(
          'post-1',
          { content: 'Resposta', parentCommentId: randomUUID() },
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('lança NotFound quando o post não existe', async () => {
      await expect(
        service.createComment('inexistente', { content: 'x' }, 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getComments', () => {
    it('retorna parentId em cada item', async () => {
      const parent = await service.createComment(
        'post-1',
        { content: 'pai' },
        'user-1',
      );
      await service.createComment(
        'post-1',
        { content: 'reply', parentCommentId: parent.id },
        'user-1',
      );
      const list = await service.getComments('post-1');
      expect(list).toHaveLength(2);
      for (const c of list) {
        expect(c).toHaveProperty('parentId');
      }
      const replyEntry = list.find((c) => c.content === 'reply')!;
      expect(replyEntry.parentId).toBe(parent.id);
      const parentEntry = list.find((c) => c.content === 'pai')!;
      expect(parentEntry.parentId).toBeNull();
    });
  });
});
