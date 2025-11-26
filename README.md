# Sikars Environment Configuration Scripts

This directory contains scripts to help you set up and validate environment variables for your Sikars cigar customization platform.

## 📁 Files Included

1. **setup-env.sh** - Interactive Bash script for environment setup
2. **setup-env.js** - Interactive Node.js script for environment setup (cross-platform)
3. **validate-env.sh** - Bash script to validate your environment configuration
4. **frontend.env.example** - Example frontend environment variables
5. **backend.env.example** - Example backend environment variables

## 🚀 Quick Start

### Option 1: Using Bash Script (Mac/Linux)

```bash
# Make the script executable
chmod +x setup-env.sh

# Run the setup script
./setup-env.sh
```

### Option 2: Using Node.js Script (Cross-platform)

```bash
# Run with Node.js
node setup-env.js
```

### Option 3: Manual Setup

1. Copy the example files:
```bash
# Frontend
cp frontend.env.example frontend/.env

# Backend
cp backend.env.example backend/.env
```

2. Edit the `.env` files with your actual values
3. Validate your configuration:
```bash
chmod +x validate-env.sh
./validate-env.sh
```

## 📋 What the Setup Scripts Do

The interactive setup scripts will:

1. **Ask about your environment:**
   - Frontend only, Backend only, or Both
   - Development, Staging, or Production

2. **Collect necessary configuration:**
   - Server settings (port, URLs)
   - Database credentials
   - Authentication secrets
   - Payment processor keys
   - AWS S3 credentials
   - Email service keys

3. **Generate secure secrets:**
   - JWT tokens
   - Session secrets
   - Encryption keys

4. **Create environment files:**
   - `.env.development`, `.env.staging`, or `.env.production`
   - Automatically creates symlinks for development

5. **Set proper permissions:**
   - Restricts file permissions to owner-only (chmod 600)

## 🔧 Configuration Details

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:5000` |
| `REACT_APP_STRIPE_PUBLIC_KEY` | Payment processor public key | `pk_test_xxx` |
| `REACT_APP_ENV` | Environment type | `development` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics tracking | `true` |
| `REACT_APP_ENABLE_LOGGING` | Enable console logging | `true` |

### Backend Environment Variables

#### Server
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/staging/production)

#### Database
- `DATABASE_URL` - Full PostgreSQL connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

#### Authentication
- `JWT_SECRET` - Secret key for JWT tokens (auto-generated)
- `JWT_EXPIRES_IN` - Token expiration (e.g., 7d)
- `BCRYPT_ROUNDS` - Password hashing rounds

#### Payment Processing
- `AUTHORIZE_NET_API_LOGIN_ID` - Authorize.net login ID
- `AUTHORIZE_NET_TRANSACTION_KEY` - Transaction key
- `AUTHORIZE_NET_ENV` - Environment (sandbox/production)

#### File Storage (AWS S3)
- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region

#### Email Service (SendGrid)
- `SENDGRID_API_KEY` - SendGrid API key
- `FROM_EMAIL` - Sender email address

#### URLs
- `FRONTEND_URL` - Frontend application URL
- `TRACKING_BASE_URL` - Order tracking base URL

## ✅ Validating Your Configuration

After setting up your environment variables, validate them:

```bash
# Make executable
chmod +x validate-env.sh

# Run validation
./validate-env.sh
```

The validation script will:
- Check if all required variables are set
- Validate URL formats
- Check JWT secret strength (production)
- Test database connection (if psql is available)
- Provide a summary of any errors

## 🔒 Security Best Practices

### DO:
✅ Use different credentials for each environment
✅ Rotate secrets regularly
✅ Keep `.env` files out of version control
✅ Use strong, randomly generated secrets
✅ Restrict file permissions (`chmod 600 .env`)
✅ Use environment-specific files (`.env.development`, `.env.production`)

### DON'T:
❌ Commit `.env` files to Git
❌ Share credentials via email or chat
❌ Use the same passwords across environments
❌ Use weak or predictable secrets
❌ Store production credentials in development

## 📝 Example Workflows

### Setting Up Development Environment

```bash
# 1. Run setup script
./setup-env.sh

# Choose:
# - Both frontend and backend
# - Development environment

# 2. The script will prompt for:
# - Database credentials (use local PostgreSQL)
# - Generate JWT secret automatically
# - Use sandbox payment keys
# - Use test email addresses

# 3. Validate configuration
./validate-env.sh

# 4. Start your servers
cd frontend && npm start
cd backend && npm run dev
```

### Setting Up Production Environment

```bash
# 1. Run setup script
./setup-env.sh

# Choose:
# - Both frontend and backend
# - Production environment

# 2. Provide:
# - Production database credentials
# - Strong JWT secret (or auto-generate)
# - Live payment processor keys
# - Production AWS credentials
# - Production email credentials
# - Production URLs

# 3. Validate configuration
./validate-env.sh

# 4. Review and test before deploying
cat backend/.env.production
```

## 🛠 Troubleshooting

### Script Won't Run

```bash
# Make sure it's executable
chmod +x setup-env.sh

# Or run with bash explicitly
bash setup-env.sh
```

### Permission Denied

```bash
# On Windows, use the Node.js version
node setup-env.js
```

### Database Connection Fails

1. Ensure PostgreSQL is running
2. Verify credentials are correct
3. Check if database exists: `psql -l`
4. Create database if needed: `createdb sikars`

### Missing Dependencies

```bash
# Install required packages
npm install

# For bash scripts, ensure you have:
# - bash
# - openssl (for secret generation)
# - psql (optional, for database testing)
```

## 🔄 Updating Configuration

To update your environment variables:

1. Edit the `.env` file directly, OR
2. Run the setup script again (it will overwrite)
3. Restart your application

```bash
# Restart development servers
# Frontend
cd frontend && npm start

# Backend
cd backend && npm run dev
```

## 📚 Additional Resources

- [Environment Variables Best Practices](https://12factor.net/config)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Authorize.net API Documentation](https://developer.authorize.net/)
- [AWS S3 Setup Guide](https://docs.aws.amazon.com/s3/)
- [SendGrid API Documentation](https://docs.sendgrid.com/)

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Validate your configuration with `./validate-env.sh`
3. Review the example `.env` files
4. Check application logs for specific errors
5. Ensure all required services are running (database, etc.)

## 📄 License

These scripts are part of the Sikars project.

---

**Remember:** Never commit your `.env` files to version control! Add them to `.gitignore`.
