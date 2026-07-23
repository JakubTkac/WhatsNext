import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ApiInfoResponseDto,
  HealthResponseDto,
} from './common/dto/system-response.dto';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getInfo(): ApiInfoResponseDto {
    return {
      name: 'WhatsNext API',
      version: '1.0.0',
    };
  }

  async getHealth(): Promise<HealthResponseDto> {
    await this.dataSource.query('SELECT 1');

    return {
      status: 'ok',
      database: 'up',
    };
  }
}
