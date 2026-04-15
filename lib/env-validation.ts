/**
 * Environment Variable Validation
 * Ensures all required environment variables are set on application startup
 */

interface EnvConfig {
  required: string[];
  optional: string[];
  defaults?: Record<string, string>;
}

const envConfig: EnvConfig = {
  required: [
    'MONGODB_URI',
    'NEXT_PUBLIC_APP_URL',
  ],
  optional: [
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'OPENAI_API_KEY',
    'SENTRY_DSN',
    'REDIS_URL',
    'UPSTASH_REDIS_REST_URL',
    'SENDGRID_API_KEY',
    'STRIPE_SECRET_KEY',
  ],
  defaults: {
    NODE_ENV: 'development',
    MONGODB_DB_NAME: 'lms',
    SKIP_DB_BUILD: 'false',
  },
};

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of envConfig.required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check optional but recommended variables
  const importantOptional = ['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'];
  for (const key of importantOptional) {
    if (!process.env[key]) {
      warnings.push(`${key} is recommended but not set`);
    }
  }

  // Set defaults
  if (envConfig.defaults) {
    for (const [key, defaultValue] of Object.entries(envConfig.defaults)) {
      if (!process.env[key]) {
        process.env[key] = defaultValue;
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue || '';
}

export function getEnvAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  const num = value ? parseInt(value, 10) : defaultValue;
  if (isNaN(num!)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return num!;
}

export function getEnvAsBoolean(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

// Validate on module load (in production, this should be done at startup)
if (process.env.NODE_ENV !== 'production' || process.env.SKIP_ENV_VALIDATION !== 'true') {
  const result = validateEnvironment();
  if (!result.valid) {
    console.error('❌ Missing required environment variables:', result.missing);
    console.error('Please check your .env file or environment configuration');
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
    }
  }
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:', result.warnings);
  }
}

