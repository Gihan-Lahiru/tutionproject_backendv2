import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PingService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async checkHealth() {
    const startedAt = Date.now();

    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        message: 'Website is running and database is connected',
        database: 'connected',
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      };
    } catch {
      return {
        status: 'error',
        message: 'Website is running but database connection failed',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      };
    }
  }
}