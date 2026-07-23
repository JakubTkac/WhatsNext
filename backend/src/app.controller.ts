import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import {
  ApiInfoResponseDto,
  HealthResponseDto,
} from './common/dto/system-response.dto';
import { AppService } from './app.service';

@Public()
@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiOkResponse({ type: ApiInfoResponseDto })
  getInfo(): ApiInfoResponseDto {
    return this.appService.getInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check API and database health' })
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth(): Promise<HealthResponseDto> {
    return this.appService.getHealth();
  }
}
