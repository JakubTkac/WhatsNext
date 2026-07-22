import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getInfo() {
    return {
      name: 'WhatsNext API',
      version: '1.0.0',
    };
  }

  async getHealth() {
    await this.dataSource.query('SELECT 1');

    return {
      status: 'ok',
      database: 'up',
    };
  }
}
