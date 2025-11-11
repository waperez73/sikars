# Sikars API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://api.sikars.com
```

## Authentication

Most endpoints require authentication via JWT token.

**Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Profile
```http
GET /api/auth/profile
```

**Headers:** Requires authentication

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "createdAt": "2025-01-03T10:00:00Z"
  }
}
```

---

## Product Endpoints

### Get All Products
```http
GET /api/products
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "sizes": [...],
    "binders": [...],
    "flavors": [...],
    "bandStyles": [...],
    "boxes": [...]
  }
}
```

### Get Cigar Sizes
```http
GET /api/products/sizes
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Robusto",
      "value": "robusto",
      "price": 10.00,
      "length": 5.0,
      "ringGauge": 50,
      "description": "Classic robust size...",
      "image": "/images/robusto.png"
    }
  ]
}
```

---

## Order Endpoints

### Create Order
```http
POST /api/orders
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "items": [
    {
      "cigarSize": "robusto",
      "binder": "habano",
      "flavor": "medium",
      "bandStyle": "beveled",
      "box": "classic",
      "bandText": "Custom Text",
      "engraving": "Special Message",
      "quantity": 2
    }
  ],
  "shippingAddressId": "uuid",
  "billingAddressId": "uuid",
  "shippingMethod": "standard",
  "customerNotes": "Please handle with care"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "orderId": "uuid",
    "orderNumber": "SKR-20250103-A1B2C",
    "status": "pending",
    "total": 152.50,
    "currency": "USD",
    "createdAt": "2025-01-03T10:00:00Z"
  }
}
```

### Get User Orders
```http
GET /api/orders?page=1&limit=10
```

**Headers:** Requires authentication

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "SKR-20250103-A1B2C",
        "status": "confirmed",
        "paymentStatus": "paid",
        "total": 152.50,
        "currency": "USD",
        "createdAt": "2025-01-03T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    }
  }
}
```

### Get Order Details
```http
GET /api/orders/:id
```

**Headers:** Requires authentication

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "orderNumber": "SKR-20250103-A1B2C",
    "status": "confirmed",
    "paymentStatus": "paid",
    "subtotal": 140.00,
    "tax": 11.20,
    "shipping": 9.99,
    "total": 161.19,
    "currency": "USD",
    "items": [
      {
        "id": "uuid",
        "size": { "name": "Robusto", "value": "robusto" },
        "binder": { "name": "Habano", "value": "habano" },
        "flavor": { "name": "Medium", "value": "medium" },
        "bandStyle": { "name": "Beveled", "value": "beveled" },
        "box": { "name": "Classic", "value": "classic" },
        "bandText": "Custom Text",
        "engraving": "Special Message",
        "quantity": 2,
        "unitPrice": 70.00,
        "totalPrice": 140.00
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Miami",
      "state": "FL",
      "zip": "33101"
    }
  }
}
```

---

## Payment Endpoints

### Process Payment
```http
POST /api/payments/process
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "orderId": "uuid",
  "cardNumber": "4111111111111111",
  "expirationDate": "12/25",
  "cvv": "123",
  "cardholderName": "John Doe",
  "billingAddress": {
    "street": "123 Main St",
    "city": "Miami",
    "state": "FL",
    "zip": "33101"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "transactionId": "60123456789",
    "orderId": "uuid",
    "orderNumber": "SKR-20250103-A1B2C"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "No token provided. Please log in."
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Order not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Response when exceeded:**
```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Example Usage (JavaScript)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Register
const register = async () => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    email: 'user@example.com',
    password: 'SecurePass123',
    firstName: 'John',
    lastName: 'Doe'
  });
  
  const { token } = response.data.data;
  localStorage.setItem('token', token);
};

// Get products
const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data.data;
};

// Create order (authenticated)
const createOrder = async (orderData) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_URL}/orders`,
    orderData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data.data;
};
```

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login and save token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }' | jq -r '.data.token')

# Get profile (authenticated)
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Get products
curl http://localhost:5000/api/products
```
