import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Como usar async/await no TypeScript' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Um guia prático sobre programação assíncrona' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: '```typescript\nconst x = await fetch(...);\n```' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;
}
