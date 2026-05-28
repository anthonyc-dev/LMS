import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CsrfService } from '../services/csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // skip safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return true;
    }

    const cookieToken = req.cookies['csrf_token'];
    const headerToken = req.headers['x-csrf-token'];

    const valid = this.csrfService.validateToken(cookieToken, headerToken);

    if (!valid) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
