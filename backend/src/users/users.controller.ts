import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';
import { UsersService } from './users.service';

@ApiTags('profile')
@ApiBearerAuth('access-token')
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({
    description: 'Profile and read-only activity summary returned.',
    type: ProfileResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  @ApiNotFoundResponse({
    description: 'The authenticated user no longer exists.',
  })
  getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully.',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Profile data is invalid.' })
  @ApiConflictResponse({ description: 'The email is already registered.' })
  @ApiPayloadTooLargeResponse({
    description: 'The profile request exceeds the upload limit.',
  })
  @ApiNotFoundResponse({
    description: 'The authenticated user no longer exists.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: UpdateProfileRequestDto,
  ): Promise<ProfileResponseDto> {
    return this.usersService.updateProfile(user.id, request);
  }
}
