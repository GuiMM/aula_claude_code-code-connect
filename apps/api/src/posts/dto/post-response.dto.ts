import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class PostSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiPropertyOptional({ nullable: true }) thumbnailUrl: string | null;
  @ApiProperty({ type: PostAuthorDto }) author: PostAuthorDto;
  @ApiProperty() likesCount: number;
  @ApiProperty() commentsCount: number;
  @ApiPropertyOptional({ nullable: true }) likedByMe: boolean | null;
  @ApiProperty() createdAt: Date;
}

export class PostDetailDto extends PostSummaryDto {
  @ApiProperty() content: string;
}

export class CommentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() content: string;
  @ApiProperty({ type: PostAuthorDto }) author: PostAuthorDto;
  @ApiProperty() createdAt: Date;
}

export class PaginatedPostsDto {
  @ApiProperty({ type: [PostSummaryDto] }) data: PostSummaryDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
