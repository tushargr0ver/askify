import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsSecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.get('origin');
    const userAgent = req.get('user-agent');
    
    // Log suspicious requests for monitoring
    if (origin && !this.isAllowedOrigin(origin)) {
      console.warn(`🚨 Suspicious request from origin: ${origin}`, {
        ip: req.ip,
        userAgent,
        path: req.path,
        method: req.method,
      });
    }

    // Add additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
  }

  private isAllowedOrigin(origin: string): boolean {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const allowedOrigins = [
      'https://askify.tushr.xyz',
      'https://www.askify.tushr.xyz',
    ];

    // Add development origins if not in production
    if (isDevelopment || !process.env.NODE_ENV) {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      );
    }
    
    return allowedOrigins.includes(origin);
  }
}
