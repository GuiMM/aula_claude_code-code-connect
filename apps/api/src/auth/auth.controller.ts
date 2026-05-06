import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './strategies/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra um novo usuário' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica e devolve um JWT' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  async me(@Request() req: RequestWithUser): Promise<UserResponseDto> {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.toUserResponse(user);
  }
}
