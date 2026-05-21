import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Public } from './common/decorators/public.decorator';


@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly appService: AppService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('app', 1024 * 1024 * 1024),
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
