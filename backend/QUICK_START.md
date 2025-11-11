# 🚀 Sikars Backend - Quick Start Guide

## Step-by-Step Setup

### 1. Prerequisites Check
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
psql --version  # PostgreSQL should be installed
```

### 2. Database Setup

```bash
# Create database
createdb sikars

# Connect to database
psql sikars

# Run schema (from psql prompt)
\i src/database/schema.sql

# Or from command line:
psql sikars < src/database/schema.sql

# Verify tables were created
psql sikars -c "\dt"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum required settings for development:**
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sikars
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT (generate a random string)
JWT_SECRET=your-super-secret-key-change-this

# Frontend URL
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 5. Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Sikars API Server running on port 5000
📍 Environment: development
🔗 API URL: http://localhost:5000
✅ Database connected successfully
```

### 6. Test the API

```bash
# Health check
curl http://localhost:5000/health

# Get products
curl http://localhost:5000/api/products

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

## 🔗 Connecting to Frontend

Update your React frontend's API URL:

```javascript
// In your frontend .env file
REACT_APP_API_URL=http://localhost:5000
```

Then in your frontend code:
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// For authenticated requests
const token = localStorage.getItem('token');
API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## 📝 Common Commands

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)

# Production
npm start            # Start production server

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Code quality
npm run lint         # Check code style
npm run format       # Format code with Prettier
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Connection refused
```
**Solution:** Make sure PostgreSQL is running:
```bash
# On macOS
brew services start postgresql

# On Linux
sudo systemctl start postgresql

# Check status
pg_isready
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Either kill the process using port 5000 or change the PORT in .env

```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### JWT Token Expired
**Solution:** Re-login to get a new token

### CORS Error
**Solution:** Make sure CORS_ORIGIN in .env matches your frontend URL

## 📚 Next Steps

1. **Configure Payment Gateway**
   - Sign up for Authorize.net sandbox account
   - Add credentials to .env

2. **Set up AWS S3**
   - Create S3 bucket
   - Add AWS credentials to .env

3. **Configure Email**
   - Sign up for SendGrid
   - Add API key to .env

4. **Review Database Schema**
   - Check `src/database/schema.sql`
   - Understand table relationships

5. **Explore API Documentation**
   - See README.md for all endpoints
   - Test with Postman or similar tool

## 🎯 Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000"

echo "Testing Sikars API..."
echo ""

echo "1. Health Check:"
curl -s "$API_URL/health" | jq
echo ""

echo "2. Get Products:"
curl -s "$API_URL/api/products/sizes" | jq
echo ""

echo "3. Register User:"
curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }' | jq
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## ✅ Checklist

Before moving to production:

- [ ] Database schema deployed
- [ ] All environment variables configured
- [ ] Payment gateway tested
- [ ] Email service working
- [ ] File upload working (S3)
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Logging set up
- [ ] Backups automated
- [ ] Error monitoring configured (Sentry)

---

Need help? Check the full README.md or create an issue!
