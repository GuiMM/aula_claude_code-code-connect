import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT a ser enviado em Authorization: Bearer <token>',
  })
  access_token: string;
}
