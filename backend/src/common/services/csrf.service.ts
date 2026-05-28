import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  validateToken(cookieToken: string, headerToken: string): boolean {
    if (!cookieToken || !headerToken) return false;
    return cookieToken === headerToken;
  }
}
