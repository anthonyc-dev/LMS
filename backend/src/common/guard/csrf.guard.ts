import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { CsrfService } from '../services/csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip CSRF for WebSocket connections (authenticated via JWT in handshake)
    if (context.getType() === 'ws') {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();

    // skip safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return true;
    }

    const cookieToken = req.cookies?.['csrf_token'] as string | undefined;
    const headerToken = req.headers['x-csrf-token'] as string | undefined;

    console.log('[CSRF Guard] cookieToken:', cookieToken);
    console.log('[CSRF Guard] headerToken:', headerToken);

    const valid = this.csrfService.validateToken(
      cookieToken ?? '',
      headerToken ?? '',
    );

    if (!valid) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
