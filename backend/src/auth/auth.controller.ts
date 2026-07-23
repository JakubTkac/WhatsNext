import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a user account' })
  @ApiCreatedResponse({
    description: 'Account created',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Registration data is invalid.' })
  @ApiConflictResponse({ description: 'The email is already registered.' })
  register(@Body() request: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(request);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiOkResponse({
    description: 'Credentials accepted.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Login data is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Email or password is incorrect.' })
  login(@Body() request: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(request);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiOkResponse({
    description: 'Authenticated user returned successfully.',
    type: AuthUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  getCurrentUser(@CurrentUser() user: AuthenticatedUser): AuthUserResponseDto {
    return user;
  }
}
