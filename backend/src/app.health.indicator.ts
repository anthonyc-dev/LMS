import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class AppHealthIndicator extends HealthIndicator {
  isHealthy(key: string): HealthIndicatorResult {
    return this.getStatus(key, true, {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: Date.now(),
    });
  }
}
