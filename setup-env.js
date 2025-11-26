#!/usr/bin/env node

/**
 * Sikars Environment Configuration Script (Node.js version)
 * Interactive setup for environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Helper functions
const print = {
  header: (text) => {
    console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.blue}${colors.bright}${text}${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
  },
  success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}! ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.blue}${text}${colors.reset}`),
};

// Generate secure random string
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify question
function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Main configuration object
const config = {
  frontend: {},
  backend: {},
};

// Main setup function
async function setup() {
  console.clear();
  print.header('Sikars Environment Configuration');

  console.log('This script will help you configure environment variables');
  console.log('for both the frontend and backend of your Sikars application.\n');

  // Choose what to configure
  console.log('What would you like to configure?');
  console.log('1) Frontend only');
  console.log('2) Backend only');
  console.log('3) Both (recommended)');
  const choice = await question('\nEnter choice [1-3]: ');

  const setupFrontend = choice === '1' || choice === '3';
  const setupBackend = choice === '2' || choice === '3';

  if (!setupFrontend && !setupBackend) {
    print.error('Invalid choice. Exiting.');
    rl.close();
    return;
  }

  // Choose environment type
  console.log('\nWhich environment are you setting up?');
  console.log('1) Development');
  console.log('2) Staging');
  console.log('3) Production');
  const envChoice = await question('\nEnter choice [1-3]: ');

  const envType = envChoice === '1' ? 'development' : envChoice === '2' ? 'staging' : 'production';

  // Setup frontend
  if (setupFrontend) {
    await setupFrontendConfig(envType);
  }

  // Setup backend
  if (setupBackend) {
    await setupBackendConfig(envType);
  }

  // Write configuration files
  if (setupFrontend) {
    writeFrontendEnv(config.frontend, envType);
  }

  if (setupBackend) {
    writeBackendEnv(config.backend, envType);
  }

  // Summary
  print.header('Configuration Complete!');
  print.success('Environment files have been created successfully.');

  console.log('\n' + colors.yellow + 'Important Security Notes:' + colors.reset);
  console.log('  1. Never commit .env files to version control');
  console.log('  2. Keep your secrets secure and rotate them regularly');
  console.log('  3. Use different credentials for each environment');
  console.log('  4. Ensure .env files have restricted permissions');

  console.log('\n' + colors.blue + 'Next Steps:' + colors.reset);
  console.log('  1. Review the generated .env files');
  console.log('  2. Update any placeholder values');
  console.log('  3. Test your configuration: npm run dev');
  console.log('  4. Set up your database: npm run migration:run\n');

  rl.close();
}

// Frontend configuration
async function setupFrontendConfig(envType) {
  print.header('Frontend Configuration');

  const defaultApiUrl =
    envType === 'development'
      ? 'http://localhost:5000'
      : envType === 'staging'
      ? 'https://api-staging.sikars.com'
      : 'https://api.sikars.com';

  config.frontend.REACT_APP_API_URL = (await question(`Backend API URL [${defaultApiUrl}]: `)) || defaultApiUrl;

  const defaultStripeKey = envType === 'development' ? 'pk_test_xxx' : '';
  config.frontend.REACT_APP_STRIPE_PUBLIC_KEY =
    (await question(`Stripe/Payment Public Key [${defaultStripeKey || 'required'}]: `)) || defaultStripeKey;

  config.frontend.REACT_APP_ENV = envType;
  config.frontend.REACT_APP_ENABLE_ANALYTICS = 'true';
  config.frontend.REACT_APP_ENABLE_LOGGING = envType !== 'production' ? 'true' : 'false';

  print.success('Frontend configuration completed');
}

// Backend configuration
async function setupBackendConfig(envType) {
  print.header('Backend Configuration');

  // Server
  print.info('Server Configuration');
  config.backend.PORT = (await question('Server port [5000]: ')) || '5000';
  config.backend.NODE_ENV = envType;

  // Database
  console.log();
  print.info('Database Configuration');
  config.backend.DB_HOST = (await question('Database host [localhost]: ')) || 'localhost';
  config.backend.DB_PORT = (await question('Database port [5432]: ')) || '5432';
  config.backend.DB_NAME = (await question('Database name [sikars]: ')) || 'sikars';
  config.backend.DB_USER = (await question('Database user [postgres]: ')) || 'postgres';
  config.backend.DB_PASSWORD = (await question('Database password: ')) || '';

  config.backend.DATABASE_URL = `postgresql://${config.backend.DB_USER}:${config.backend.DB_PASSWORD}@${config.backend.DB_HOST}:${config.backend.DB_PORT}/${config.backend.DB_NAME}`;

  // Authentication
  console.log();
  print.info('Authentication Configuration');

  if (envType === 'development') {
    config.backend.JWT_SECRET = `dev_secret_${Date.now()}_${generateSecret(16)}`;
    print.warning('Generated JWT secret for development');
  } else {
    const jwtSecret = await question('JWT Secret (leave blank to generate): ');
    config.backend.JWT_SECRET = jwtSecret || generateSecret(64);
    if (!jwtSecret) {
      print.success('Generated secure JWT secret');
    }
  }

  config.backend.JWT_EXPIRES_IN = (await question('JWT expiration time [7d]: ')) || '7d';

  // Payment
  console.log();
  print.info('Payment Configuration (Authorize.net)');
  config.backend.AUTHORIZE_NET_API_LOGIN_ID = (await question('Authorize.net API Login ID: ')) || '';
  config.backend.AUTHORIZE_NET_TRANSACTION_KEY = (await question('Authorize.net Transaction Key: ')) || '';
  config.backend.AUTHORIZE_NET_ENV = envType === 'production' ? 'production' : 'sandbox';

  // Storage
  console.log();
  print.info('Storage Configuration (AWS S3)');
  config.backend.AWS_S3_BUCKET = (await question(`S3 Bucket name [sikars-${envType}]: `)) || `sikars-${envType}`;
  config.backend.AWS_REGION = (await question('AWS Region [us-east-1]: ')) || 'us-east-1';
  config.backend.AWS_ACCESS_KEY_ID = (await question('AWS Access Key ID: ')) || '';
  config.backend.AWS_SECRET_ACCESS_KEY = (await question('AWS Secret Access Key: ')) || '';

  // Email
  console.log();
  print.info('Email Configuration (SendGrid)');
  config.backend.SENDGRID_API_KEY = (await question('SendGrid API Key: ')) || '';
  config.backend.FROM_EMAIL = (await question('From email address [orders@sikars.com]: ')) || 'orders@sikars.com';

  // URLs
  console.log();
  print.info('URL Configuration');
  const defaultFrontendUrl =
    envType === 'development'
      ? 'http://localhost:3000'
      : envType === 'staging'
      ? 'https://staging.sikars.com'
      : 'https://sikars.com';

  config.backend.FRONTEND_URL = (await question(`Frontend URL [${defaultFrontendUrl}]: `)) || defaultFrontendUrl;
  config.backend.TRACKING_BASE_URL =
    (await question(`Tracking base URL [${defaultFrontendUrl}/track]: `)) || `${defaultFrontendUrl}/track`;

  // Additional settings
  config.backend.RATE_LIMIT_WINDOW_MS = '900000';
  config.backend.RATE_LIMIT_MAX_REQUESTS = '100';
  config.backend.BCRYPT_ROUNDS = '10';
  config.backend.LOG_LEVEL = envType === 'production' ? 'info' : 'debug';
  config.backend.LOG_FILE = 'logs/app.log';
  config.backend.CORS_ORIGIN = config.backend.FRONTEND_URL;
  config.backend.SUPPORT_EMAIL = 'support@sikars.com';

  print.success('Backend configuration completed');
}

// Write frontend .env file
function writeFrontendEnv(config, envType) {
  const envContent = `# Sikars Frontend Environment Variables
# Environment: ${envType}
# Generated: ${new Date().toISOString()}

# API Configuration
REACT_APP_API_URL=${config.REACT_APP_API_URL}

# Payment Configuration
REACT_APP_STRIPE_PUBLIC_KEY=${config.REACT_APP_STRIPE_PUBLIC_KEY}

# Environment
REACT_APP_ENV=${config.REACT_APP_ENV}

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=${config.REACT_APP_ENABLE_ANALYTICS}
REACT_APP_ENABLE_LOGGING=${config.REACT_APP_ENABLE_LOGGING}
`;

  const envFile = path.join(process.cwd(), 'sikars-client', `.env.${envType}`);
  const envDir = path.dirname(envFile);

  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }

  fs.writeFileSync(envFile, envContent);

  // Create symlink for development
  if (envType === 'development') {
    const symlinkPath = path.join(process.cwd(), 'sikars-client', '.env');
    try {
      if (fs.existsSync(symlinkPath)) {
        fs.unlinkSync(symlinkPath);
      }
      fs.symlinkSync(`.env.${envType}`, symlinkPath);
      print.success(`Created symlink: frontend/.env -> .env.${envType}`);
    } catch (err) {
      print.warning('Could not create symlink (may require admin privileges)');
      print.info(`Manually copy frontend/.env.${envType} to frontend/.env`);
    }
  }

  // Set permissions (Unix only)
  try {
    fs.chmodSync(envFile, 0o600);
  } catch (err) {
    // Windows doesn't support chmod
  }

  print.success(`Frontend environment file created: ${envFile}`);
}

// Write backend .env file
function writeBackendEnv(config, envType) {
  const envContent = `# Sikars Backend Environment Variables
# Environment: ${envType}
# Generated: ${new Date().toISOString()}

# ================================
# SERVER CONFIGURATION
# ================================
PORT=${config.PORT}
NODE_ENV=${config.NODE_ENV}

# ================================
# DATABASE CONFIGURATION
# ================================
DATABASE_URL=${config.DATABASE_URL}
DB_HOST=${config.DB_HOST}
DB_PORT=${config.DB_PORT}
DB_NAME=${config.DB_NAME}
DB_USER=${config.DB_USER}
DB_PASSWORD=${config.DB_PASSWORD}

# ================================
# AUTHENTICATION
# ================================
JWT_SECRET=${config.JWT_SECRET}
JWT_EXPIRES_IN=${config.JWT_EXPIRES_IN}

# ================================
# PAYMENT PROCESSING
# ================================
AUTHORIZE_NET_API_LOGIN_ID=${config.AUTHORIZE_NET_API_LOGIN_ID}
AUTHORIZE_NET_TRANSACTION_KEY=${config.AUTHORIZE_NET_TRANSACTION_KEY}
AUTHORIZE_NET_ENV=${config.AUTHORIZE_NET_ENV}

# ================================
# FILE STORAGE (AWS S3)
# ================================
AWS_S3_BUCKET=${config.AWS_S3_BUCKET}
AWS_ACCESS_KEY_ID=${config.AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${config.AWS_SECRET_ACCESS_KEY}
AWS_REGION=${config.AWS_REGION}

# ================================
# EMAIL SERVICE
# ================================
SENDGRID_API_KEY=${config.SENDGRID_API_KEY}
FROM_EMAIL=${config.FROM_EMAIL}
SUPPORT_EMAIL=${config.SUPPORT_EMAIL}

# ================================
# URLs
# ================================
FRONTEND_URL=${config.FRONTEND_URL}
TRACKING_BASE_URL=${config.TRACKING_BASE_URL}

# ================================
# SECURITY
# ================================
RATE_LIMIT_WINDOW_MS=${config.RATE_LIMIT_WINDOW_MS}
RATE_LIMIT_MAX_REQUESTS=${config.RATE_LIMIT_MAX_REQUESTS}
BCRYPT_ROUNDS=${config.BCRYPT_ROUNDS}

# ================================
# LOGGING
# ================================
LOG_LEVEL=${config.LOG_LEVEL}
LOG_FILE=${config.LOG_FILE}

# ================================
# CORS
# ================================
CORS_ORIGIN=${config.CORS_ORIGIN}
`;

  const envFile = path.join(process.cwd(), 'backend', `.env.${envType}`);
  const envDir = path.dirname(envFile);

  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }

  fs.writeFileSync(envFile, envContent);

  // Create symlink for development
  if (envType === 'development') {
    const symlinkPath = path.join(process.cwd(), 'backend', '.env');
    try {
      if (fs.existsSync(symlinkPath)) {
        fs.unlinkSync(symlinkPath);
      }
      fs.symlinkSync(`.env.${envType}`, symlinkPath);
      print.success(`Created symlink: backend/.env -> .env.${envType}`);
    } catch (err) {
      print.warning('Could not create symlink (may require admin privileges)');
      print.info(`Manually copy backend/.env.${envType} to backend/.env`);
    }
  }

  // Set permissions (Unix only)
  try {
    fs.chmodSync(envFile, 0o600);
  } catch (err) {
    // Windows doesn't support chmod
  }

  print.success(`Backend environment file created: ${envFile}`);
}

// Run setup
setup().catch((err) => {
  print.error(`Setup failed: ${err.message}`);
  rl.close();
  process.exit(1);
});
