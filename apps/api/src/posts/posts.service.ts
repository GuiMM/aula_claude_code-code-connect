import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import {
  CommentResponseDto,
  PaginatedPostsDto,
  PostDetailDto,
  PostSummaryDto,
} from './dto/post-response.dto';
import { PostsQueryDto } from './dto/posts-query.dto';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likesRepo: Repository<Like>,
  ) {}

  async findAll(
    query: PostsQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedPostsDto> {
    const { q, page = 1, limit = 10 } = query;

    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (q) {
      qb.where(
        `to_tsvector('portuguese', post.title || ' ' || post.description) @@ plainto_tsquery('portuguese', :q)`,
        { q },
      );
    }

    const [posts, total] = await qb.getManyAndCount();

    let likedPostIds = new Set<string>();
    if (currentUserId) {
      const likes = await this.likesRepo.find({
        where: { userId: currentUserId },
        select: ['postId'],
      });
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    return {
      data: posts.map((p) => this.toSummary(p, currentUserId, likedPostIds)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUserId?: string): Promise<PostDetailDto> {
    const post = await this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) throw new NotFoundException('Post não encontrado');

    let likedByMe: boolean | null = null;
    if (currentUserId) {
      const like = await this.likesRepo.findOne({
        where: { postId: id, userId: currentUserId },
      });
      likedByMe = !!like;
    }

    return {
      ...this.toSummary(post, currentUserId, new Set()),
      content: post.content,
      likedByMe,
    };
  }

  async create(dto: CreatePostDto, userId: string): Promise<PostDetailDto> {
    const post = this.postsRepo.create({
      ...dto,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      userId,
    });
    const saved = await this.postsRepo.save(post);
    return this.findOne(saved.id, userId);
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');

    const existing = await this.likesRepo.findOne({
      where: { postId, userId },
    });
    if (existing) throw new ConflictException('Post já curtido');

    await this.likesRepo.save(this.likesRepo.create({ postId, userId }));
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const like = await this.likesRepo.findOne({ where: { postId, userId } });
    if (!like) throw new NotFoundException('Like não encontrado');
    await this.likesRepo.remove(like);
  }

  async getComments(postId: string): Promise<CommentResponseDto[]> {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');

    const comments = await this.commentsRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      author: { id: c.author.id, name: c.author.name },
      createdAt: c.createdAt,
    }));
  }

  async createComment(
    postId: string,
    dto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');

    const comment = this.commentsRepo.create({ ...dto, postId, userId });
    const saved = await this.commentsRepo.save(comment);

    const withAuthor = await this.commentsRepo.findOne({
      where: { id: saved.id },
      relations: ['author'],
    });

    return {
      id: withAuthor!.id,
      content: withAuthor!.content,
      author: { id: withAuthor!.author.id, name: withAuthor!.author.name },
      createdAt: withAuthor!.createdAt,
    };
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');
    if (post.userId !== userId) throw new ForbiddenException();
    await this.postsRepo.remove(post);
  }

  private toSummary(
    post: Post & { likesCount?: number; commentsCount?: number },
    currentUserId: string | undefined,
    likedPostIds: Set<string>,
  ): PostSummaryDto {
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      thumbnailUrl: post.thumbnailUrl,
      author: { id: post.author.id, name: post.author.name },
      likesCount: (post as any).likesCount ?? 0,
      commentsCount: (post as any).commentsCount ?? 0,
      likedByMe: currentUserId ? likedPostIds.has(post.id) : null,
      createdAt: post.createdAt,
    };
  }
}
