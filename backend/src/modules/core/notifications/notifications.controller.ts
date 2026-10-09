import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ParseUUIDPipe } from '@nestjs/common';
import type { RequestWithUser } from 'src/common/guard/auth.guard';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  findAll(
    @Req() request: RequestWithUser,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationsService.findForUser(request.user.sub, query);
  }

  @Patch('read-all')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  markAllAsRead(@Req() request: RequestWithUser) {
    return this.notificationsService.markAllAsRead(request.user.sub);
  }

  @Patch(':id/read')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  markAsRead(
    @Req() request: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.notificationsService.markAsRead(request.user.sub, id);
  }

  @Patch('dismiss-all')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  dismissAll(@Req() request: RequestWithUser) {
    return this.notificationsService.dismissAll(request.user.sub);
  }

  @Patch(':id/dismiss')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async dismiss(
    @Req() request: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.notificationsService.dismiss(request.user.sub, id);
  }
}
