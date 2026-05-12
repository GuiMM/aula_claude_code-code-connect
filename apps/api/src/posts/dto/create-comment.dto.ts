import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Ótimo post! Aprendi muito.' })
  @IsString()
  @MinLength(1)
  content: string;
}
