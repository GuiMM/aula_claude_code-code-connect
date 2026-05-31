import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Ótimo post! Aprendi muito.' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ description: 'ID do comentário pai (para respostas)' })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
