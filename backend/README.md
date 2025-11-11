# Sikars Backend API

Complete backend implementation for the Sikars Custom Cigar Builder platform.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

### Installation

1. **Clone and install dependencies**
```bash
cd sikars-backend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Set up database**
```bash
# Create database
createdb sikars

# Run schema
psql sikars < src/database/schema.sql
```

4. **Start development server**
```bash
npm run dev
```

Server will run on http://localhost:5000

## 📁 Project Structure

```
sikars-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # PostgreSQL connection
│   │   ├── auth.js      # JWT configuration
│   │   ├── storage.js   # AWS S3 configuration
│   │   └── payment.js   # Authorize.net configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── database/        # Database files
│   └── app.js           # Express app setup
├── logs/                # Application logs
├── server.js            # Server entry point
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Products
- `GET /api/products` - Get all product options
- `GET /api/products/sizes` - Get cigar sizes
- `GET /api/products/binders` - Get binders
- `GET /api/products/flavors` - Get flavors
- `GET /api/products/bands` - Get band styles
- `GET /api/products/boxes` - Get box types

### Orders
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get order details (requires auth)
- `DELETE /api/orders/:id` - Cancel order (requires auth)

### Payments
- `POST /api/payments/process` - Process payment (requires auth)

### Preview
- `POST /api/preview/render-preview` - Generate preview image

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Include token in requests:**
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

## 💾 Database Schema

The database includes the following main tables:
- `users` - User accounts
- `addresses` - Shipping/billing addresses
- `cigar_sizes` - Available cigar sizes
- `binders` - Wrapper types
- `flavors` - Flavor profiles
- `band_styles` - Band designs
- `box_types` - Box options
- `orders` - Order records
- `order_items` - Order line items
- `payments` - Payment transactions

See `src/database/schema.sql` for complete schema.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Environment Variables

Required environment variables (see `.env.example`):

**Server:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

**Database:**
- `DATABASE_URL` - PostgreSQL connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

**Authentication:**
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRES_IN` - Token expiration time

**Payment (Authorize.net):**
- `AUTHORIZE_NET_API_LOGIN_ID`
- `AUTHORIZE_NET_TRANSACTION_KEY`
- `AUTHORIZE_NET_ENV` - sandbox/production

**AWS S3:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `AWS_REGION`

**Email (SendGrid):**
- `SENDGRID_API_KEY`
- `FROM_EMAIL`

## 🔄 API Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    // response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // validation errors (if applicable)
  ]
}
```

## 🛠️ Development

### Running in Development
```bash
npm run dev
```

### Code Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run format
```

## 🚀 Deployment

### Production Build
```bash
NODE_ENV=production npm start
```

### Environment Setup
1. Set all environment variables in production
2. Ensure PostgreSQL database is accessible
3. Configure CORS for your frontend domain
4. Set up SSL/TLS certificates
5. Configure reverse proxy (nginx/Apache)

## 📊 Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@sikars.com

## 📄 License

MIT License

---

**Built with ❤️ for Sikars**
