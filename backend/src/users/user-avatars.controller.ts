import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UserAvatarsController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id/avatar')
  @ApiOperation({ summary: 'Get a public user avatar' })
  @ApiOkResponse({
    description: 'The avatar image.',
    content: {
      'image/png': {
        schema: { type: 'string', format: 'binary' },
      },
      'image/jpeg': {
        schema: { type: 'string', format: 'binary' },
      },
      'image/webp': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'The user id is invalid.' })
  @ApiNotFoundResponse({
    description: 'The user or profile image does not exist.',
  })
  async getAvatar(
    @Param() params: UserIdParamDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const avatar = await this.usersService.getAvatar(params.id);

    response.set({
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'Content-Length': avatar.bytes.length.toString(),
      'Content-Type': avatar.contentType,
    });

    return new StreamableFile(avatar.bytes);
  }
}
