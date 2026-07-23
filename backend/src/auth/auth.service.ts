import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly bcryptRounds: number;
  private readonly tokenLifetimeSeconds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.bcryptRounds = readIntegerConfig(
      configService,
      'BCRYPT_ROUNDS',
      4,
      15,
    );
    this.tokenLifetimeSeconds = readIntegerConfig(
      configService,
      'JWT_EXPIRES_IN_SECONDS',
      300,
      604800,
    );
  }

  async register(request: RegisterRequestDto): Promise<AuthResponseDto> {
    const passwordHash = await hash(request.password, this.bcryptRounds);
    const user = await this.usersService.create({
      email: normalizeEmail(request.email),
      displayName: request.displayName.trim(),
      passwordHash,
    });

    return this.createAuthResponse(user);
  }

  async login(request: LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(
      normalizeEmail(request.email),
    );

    if (!user) {
      await hash(request.password, this.bcryptRounds);
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await compare(request.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createAuthResponse(user);
  }

  async changePassword(
    userId: string,
    request: ChangePasswordRequestDto,
  ): Promise<void> {
    const user = await this.usersService.findByIdWithPassword(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const passwordMatches = await compare(
      request.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Current password is incorrect.');
    }

    if (request.currentPassword === request.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const passwordHash = await hash(request.newPassword, this.bcryptRounds);
    await this.usersService.updatePasswordHash(userId, passwordHash);
  }

  toUserResponse(user: User): AuthUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    };
  }

  private async createAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = { sub: user.id };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: this.tokenLifetimeSeconds,
      user: this.toUserResponse(user),
    };
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readIntegerConfig(
  configService: ConfigService,
  name: string,
  minimum: number,
  maximum: number,
): number {
  const value = Number(configService.getOrThrow<string>(name));

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}.`,
    );
  }

  return value;
}
