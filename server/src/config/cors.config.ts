import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const getCorsConfig = (): CorsOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Production domains - your actual website domains
  const productionOrigins = [
    'https://askify.tushr.xyz',
    'https://www.askify.tushr.xyz', // www subdomain if used
  ];

  // Development domains - for local testing
  const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  // Custom origins from environment variables (comma-separated)
  const customOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [];

  // Combine origins based on environment
  let allowedOrigins: string[] = [];
  
  if (isProduction) {
    allowedOrigins = [...productionOrigins, ...customOrigins];
  } else if (isDevelopment) {
    allowedOrigins = [...developmentOrigins, ...productionOrigins, ...customOrigins];
  } else {
    // Default to production settings for unknown environments
    allowedOrigins = [...productionOrigins, ...customOrigins];
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.) only in development
      if (!origin && isDevelopment) {
        return callback(null, true);
      }

      // Check if origin is allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-Forwarded-For',
      'X-Real-IP',
    ],
    exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
    maxAge: 86400, // 24 hours - cache preflight requests
    optionsSuccessStatus: 200, // For legacy browser support
  };
};

// Export individual origin lists for testing or other uses
export const PRODUCTION_ORIGINS = [
  'https://askify.tushr.xyz',
  'https://www.askify.tushr.xyz',
];

export const DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];
