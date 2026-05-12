import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import {
  CommentResponseDto,
  PaginatedPostsDto,
  PostDetailDto,
} from './dto/post-response.dto';
import { PostsQueryDto } from './dto/posts-query.dto';
import { PostsService } from './posts.service';

interface RequestWithUser {
  user: AuthenticatedUser | null;
}

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lista posts com busca full-text e paginação' })
  @ApiResponse({ status: 200, type: PaginatedPostsDto })
  findAll(
    @Query() query: PostsQueryDto,
    @Request() req: RequestWithUser,
  ): Promise<PaginatedPostsDto> {
    return this.postsService.findAll(query, req.user?.userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Detalhe de um post' })
  @ApiResponse({ status: 200, type: PostDetailDto })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<PostDetailDto> {
    return this.postsService.findOne(id, req.user?.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo post' })
  @ApiResponse({ status: 201, type: PostDetailDto })
  create(
    @Body() dto: CreatePostDto,
    @Request() req: RequestWithUser,
  ): Promise<PostDetailDto> {
    return this.postsService.create(dto, req.user!.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um post (apenas o autor)' })
  deletePost(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.postsService.deletePost(id, req.user!.userId);
  }

  @Post(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Curte um post' })
  likePost(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.postsService.likePost(id, req.user!.userId);
  }

  @Delete(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove o like de um post' })
  unlikePost(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.postsService.unlikePost(id, req.user!.userId);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lista comentários de um post' })
  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  getComments(@Param('id') id: string): Promise<CommentResponseDto[]> {
    return this.postsService.getComments(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Comenta em um post' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Request() req: RequestWithUser,
  ): Promise<CommentResponseDto> {
    return this.postsService.createComment(id, dto, req.user!.userId);
  }
}
