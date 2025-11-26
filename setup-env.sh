#!/bin/bash

# Sikars Environment Configuration Setup Script
# This script helps you configure environment variables for both frontend and backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

prompt_input() {
    local var_name=$1
    local prompt_text=$2
    local default_value=$3
    local is_secret=${4:-false}
    
    if [ "$is_secret" = true ]; then
        echo -n "$prompt_text"
        [ ! -z "$default_value" ] && echo -n " [default: ****]"
        echo -n ": "
        read -s input_value
        echo ""
    else
        echo -n "$prompt_text"
        [ ! -z "$default_value" ] && echo -n " [default: $default_value]"
        echo -n ": "
        read input_value
    fi
    
    if [ -z "$input_value" ] && [ ! -z "$default_value" ]; then
        input_value=$default_value
    fi
    
    echo "$input_value"
}

# Main setup
clear
print_header "Sikars Environment Configuration Setup"
echo ""
echo "This script will help you configure environment variables"
echo "for both the frontend and backend of your Sikars application."
echo ""

# Ask which environments to configure
echo "Which environment(s) would you like to configure?"
echo "1) Frontend only"
echo "2) Backend only"
echo "3) Both (recommended)"
echo -n "Enter choice [1-3]: "
read setup_choice

# Determine what to set up
setup_frontend=false
setup_backend=false

case $setup_choice in
    1) setup_frontend=true ;;
    2) setup_backend=true ;;
    3) setup_frontend=true; setup_backend=true ;;
    *) print_error "Invalid choice. Exiting."; exit 1 ;;
esac

# Ask for environment type
echo ""
echo "Which environment are you setting up?"
echo "1) Development"
echo "2) Staging"
echo "3) Production"
echo -n "Enter choice [1-3]: "
read env_choice

case $env_choice in
    1) ENV_TYPE="development" ;;
    2) ENV_TYPE="staging" ;;
    3) ENV_TYPE="production" ;;
    *) print_error "Invalid choice. Exiting."; exit 1 ;;
esac

# ================================
# FRONTEND CONFIGURATION
# ================================
if [ "$setup_frontend" = true ]; then
    echo ""
    print_header "Frontend Configuration"
    echo ""
    
    # Determine default API URL based on environment
    case $ENV_TYPE in
        "development") DEFAULT_API_URL="http://localhost:5000" ;;
        "staging") DEFAULT_API_URL="https://api-staging.sikars.com" ;;
        "production") DEFAULT_API_URL="https://api.sikars.com" ;;
    esac
    
    API_URL=$(prompt_input "API_URL" "Backend API URL" "$DEFAULT_API_URL")
    
    if [ "$ENV_TYPE" != "development" ]; then
        STRIPE_KEY=$(prompt_input "STRIPE_KEY" "Stripe/Payment Public Key" "" true)
    else
        STRIPE_KEY=$(prompt_input "STRIPE_KEY" "Stripe/Payment Public Key (test)" "pk_test_xxx")
    fi
    
    # Create frontend .env file
    FRONTEND_ENV_FILE="sikars-client/.env.${ENV_TYPE}"
    
    cat > "$FRONTEND_ENV_FILE" << EOF
# Sikars Frontend Environment Variables
# Environment: ${ENV_TYPE}
# Generated: $(date)

# API Configuration
REACT_APP_API_URL=${API_URL}

# Payment Configuration
REACT_APP_STRIPE_PUBLIC_KEY=${STRIPE_KEY}

# Environment
REACT_APP_ENV=${ENV_TYPE}

# Feature Flags (optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_LOGGING=$([ "$ENV_TYPE" = "production" ] && echo "false" || echo "true")
EOF

    print_success "Frontend environment file created: $FRONTEND_ENV_FILE"
    
    # Create symlink for .env if development
    if [ "$ENV_TYPE" = "development" ]; then
        ln -sf ".env.development" "sikars-client/.env"
        print_success "Created symlink: sikar-client/.env -> .env.development"
    fi
fi

# ================================
# BACKEND CONFIGURATION
# ================================
if [ "$setup_backend" = true ]; then
    echo ""
    print_header "Backend Configuration"
    echo ""
    
    # Server Configuration
    print_header "Server Configuration"
    PORT=$(prompt_input "PORT" "Server port" "5000")
    
    # Database Configuration
    echo ""
    print_header "Database Configuration"
    DB_HOST=$(prompt_input "DB_HOST" "Database host" "localhost")
    DB_PORT=$(prompt_input "DB_PORT" "Database port" "5432")
    DB_NAME=$(prompt_input "DB_NAME" "Database name" "sikars")
    DB_USER=$(prompt_input "DB_USER" "Database user" "postgres")
    DB_PASSWORD=$(prompt_input "DB_PASSWORD" "Database password" "" true)
    
    # Authentication
    echo ""
    print_header "Authentication Configuration"
    
    if [ "$ENV_TYPE" = "development" ]; then
        JWT_SECRET="dev_secret_$(date +%s)_$(openssl rand -hex 16)"
        print_warning "Generated JWT secret for development"
    else
        JWT_SECRET=$(prompt_input "JWT_SECRET" "JWT Secret (leave blank to generate)" "")
        if [ -z "$JWT_SECRET" ]; then
            JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
            print_success "Generated secure JWT secret"
        fi
    fi
    
    JWT_EXPIRES=$(prompt_input "JWT_EXPIRES" "JWT expiration time" "7d")
    
    # Payment Configuration
    echo ""
    print_header "Payment Configuration (Authorize.net)"
    
    if [ "$ENV_TYPE" = "production" ]; then
        PAYMENT_ENV="production"
    else
        PAYMENT_ENV="sandbox"
    fi
    
    AUTH_NET_LOGIN=$(prompt_input "AUTH_NET_LOGIN" "Authorize.net API Login ID" "")
    AUTH_NET_KEY=$(prompt_input "AUTH_NET_KEY" "Authorize.net Transaction Key" "" true)
    
    # Storage Configuration (AWS S3)
    echo ""
    print_header "Storage Configuration (AWS S3)"
    
    AWS_BUCKET=$(prompt_input "AWS_BUCKET" "S3 Bucket name" "sikars-${ENV_TYPE}")
    AWS_REGION=$(prompt_input "AWS_REGION" "AWS Region" "us-east-1")
    AWS_ACCESS_KEY=$(prompt_input "AWS_ACCESS_KEY" "AWS Access Key ID" "" true)
    AWS_SECRET_KEY=$(prompt_input "AWS_SECRET_KEY" "AWS Secret Access Key" "" true)
    
    # Email Configuration
    echo ""
    print_header "Email Configuration (SendGrid)"
    
    SENDGRID_KEY=$(prompt_input "SENDGRID_KEY" "SendGrid API Key" "" true)
    FROM_EMAIL=$(prompt_input "FROM_EMAIL" "From email address" "orders@sikars.com")
    
    # URL Configuration
    echo ""
    print_header "URL Configuration"
    
    case $ENV_TYPE in
        "development") 
            DEFAULT_FRONTEND_URL="http://localhost:3000"
            DEFAULT_TRACKING_URL="http://localhost:3000/track"
            ;;
        "staging") 
            DEFAULT_FRONTEND_URL="https://staging.sikars.com"
            DEFAULT_TRACKING_URL="https://staging.sikars.com/track"
            ;;
        "production") 
            DEFAULT_FRONTEND_URL="https://sikars.com"
            DEFAULT_TRACKING_URL="https://sikars.com/track"
            ;;
    esac
    
    FRONTEND_URL=$(prompt_input "FRONTEND_URL" "Frontend URL" "$DEFAULT_FRONTEND_URL")
    TRACKING_URL=$(prompt_input "TRACKING_URL" "Tracking base URL" "$DEFAULT_TRACKING_URL")
    
    # Create backend .env file
    BACKEND_ENV_FILE="backend/.env.${ENV_TYPE}"
    
    cat > "$BACKEND_ENV_FILE" << EOF
# Sikars Backend Environment Variables
# Environment: ${ENV_TYPE}
# Generated: $(date)

# ================================
# SERVER CONFIGURATION
# ================================
PORT=${PORT}
NODE_ENV=${ENV_TYPE}

# ================================
# DATABASE CONFIGURATION
# ================================
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# ================================
# AUTHENTICATION
# ================================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES}

# ================================
# PAYMENT PROCESSING
# ================================
AUTHORIZE_NET_API_LOGIN_ID=${AUTH_NET_LOGIN}
AUTHORIZE_NET_TRANSACTION_KEY=${AUTH_NET_KEY}
AUTHORIZE_NET_ENV=${PAYMENT_ENV}

# ================================
# FILE STORAGE (AWS S3)
# ================================
AWS_S3_BUCKET=${AWS_BUCKET}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_KEY}
AWS_REGION=${AWS_REGION}

# ================================
# EMAIL SERVICE
# ================================
SENDGRID_API_KEY=${SENDGRID_KEY}
FROM_EMAIL=${FROM_EMAIL}
SUPPORT_EMAIL=support@sikars.com

# ================================
# URLs
# ================================
FRONTEND_URL=${FRONTEND_URL}
TRACKING_BASE_URL=${TRACKING_URL}

# ================================
# SECURITY
# ================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=10

# ================================
# LOGGING
# ================================
LOG_LEVEL=$([ "$ENV_TYPE" = "production" ] && echo "info" || echo "debug")
LOG_FILE=logs/app.log

# ================================
# CORS
# ================================
CORS_ORIGIN=${FRONTEND_URL}
EOF

    print_success "Backend environment file created: $BACKEND_ENV_FILE"
    
    # Create symlink for .env if development
    if [ "$ENV_TYPE" = "development" ]; then
        ln -sf ".env.development" "backend/.env"
        print_success "Created symlink: backend/.env -> .env.development"
    fi
fi

# ================================
# SUMMARY
# ================================
echo ""
print_header "Configuration Complete!"
echo ""
print_success "Environment files have been created successfully."
echo ""

if [ "$setup_frontend" = true ]; then
    echo "Frontend configuration:"
    echo "  File: $FRONTEND_ENV_FILE"
    echo "  API URL: $API_URL"
    echo ""
fi

if [ "$setup_backend" = true ]; then
    echo "Backend configuration:"
    echo "  File: $BACKEND_ENV_FILE"
    echo "  Server Port: $PORT"
    echo "  Database: $DB_NAME on $DB_HOST:$DB_PORT"
    echo ""
fi

print_warning "Important Security Notes:"
echo "  1. Never commit .env files to version control"
echo "  2. Keep your secrets secure and rotate them regularly"
echo "  3. Use different credentials for each environment"
echo "  4. Ensure .env files have restricted permissions (chmod 600)"
echo ""

# Set appropriate permissions
if [ "$setup_frontend" = true ]; then
    chmod 600 "$FRONTEND_ENV_FILE" 2>/dev/null || true
fi

if [ "$setup_backend" = true ]; then
    chmod 600 "$BACKEND_ENV_FILE" 2>/dev/null || true
fi

print_header "Next Steps"
echo "1. Review the generated .env files"
echo "2. Update any placeholder values"
echo "3. Test your configuration: npm run dev"
echo "4. Set up your database: npm run migration:run"
echo ""

print_success "Setup complete! Happy coding! 🚀"
