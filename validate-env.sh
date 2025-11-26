#!/bin/bash

# Sikars Environment Variables Validation Script
# This script checks if all required environment variables are properly configured

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if a variable is set
check_var() {
    local var_name=$1
    local var_value="${!var_name}"
    local is_required=${2:-true}
    
    if [ -z "$var_value" ]; then
        if [ "$is_required" = true ]; then
            print_error "$var_name is not set (REQUIRED)"
            return 1
        else
            print_warning "$var_name is not set (optional)"
            return 0
        fi
    else
        # Hide sensitive values
        if [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"KEY"* ]]; then
            print_success "$var_name is set (****)"
        else
            print_success "$var_name is set ($var_value)"
        fi
        return 0
    fi
}

# Check if file exists
check_file() {
    local file_path=$1
    if [ -f "$file_path" ]; then
        print_success "Found: $file_path"
        return 0
    else
        print_error "Missing: $file_path"
        return 1
    fi
}

# Main validation
clear
print_header "Sikars Environment Validation"
echo ""

# Ask which environment to validate
echo "Which environment would you like to validate?"
echo "1) Frontend"
echo "2) Backend"
echo "3) Both"
echo -n "Enter choice [1-3]: "
read validate_choice

validate_frontend=false
validate_backend=false

case $validate_choice in
    1) validate_frontend=true ;;
    2) validate_backend=true ;;
    3) validate_frontend=true; validate_backend=true ;;
    *) print_error "Invalid choice. Exiting."; exit 1 ;;
esac

errors=0

# ================================
# VALIDATE FRONTEND
# ================================
if [ "$validate_frontend" = true ]; then
    echo ""
    print_header "Validating Frontend Environment"
    echo ""
    
    # Check if .env file exists
    if check_file "sikars-client/.env"; then
        # Load environment variables
        export $(cat sikars-client/.env | grep -v '^#' | xargs)
        
        echo ""
        echo "Checking required variables..."
        check_var "REACT_APP_API_URL" || ((errors++))
        check_var "REACT_APP_ENV" || ((errors++))
        
        echo ""
        echo "Checking optional variables..."
        check_var "REACT_APP_STRIPE_PUBLIC_KEY" false
        check_var "REACT_APP_ENABLE_ANALYTICS" false
        
        # Validate URL format
        if [[ ! "$REACT_APP_API_URL" =~ ^https?:// ]]; then
            print_error "REACT_APP_API_URL should start with http:// or https://"
            ((errors++))
        fi
    else
        print_error "Frontend .env file not found!"
        ((errors++))
    fi
fi

# ================================
# VALIDATE BACKEND
# ================================
if [ "$validate_backend" = true ]; then
    echo ""
    print_header "Validating Backend Environment"
    echo ""
    
    # Check if .env file exists
    if check_file "backend/.env"; then
        # Load environment variables
        export $(cat backend/.env | grep -v '^#' | xargs)
        
        echo ""
        echo "Server Configuration:"
        check_var "PORT" || ((errors++))
        check_var "NODE_ENV" || ((errors++))
        
        echo ""
        echo "Database Configuration:"
        check_var "DATABASE_URL" || ((errors++))
        check_var "DB_HOST" || ((errors++))
        check_var "DB_PORT" || ((errors++))
        check_var "DB_NAME" || ((errors++))
        check_var "DB_USER" || ((errors++))
        check_var "DB_PASSWORD" || ((errors++))
        
        echo ""
        echo "Authentication:"
        check_var "JWT_SECRET" || ((errors++))
        check_var "JWT_EXPIRES_IN" || ((errors++))
        
        # Check JWT secret strength (production only)
        if [ "$NODE_ENV" = "production" ]; then
            jwt_length=${#JWT_SECRET}
            if [ "$jwt_length" -lt 32 ]; then
                print_warning "JWT_SECRET should be at least 32 characters long for production"
            fi
        fi
        
        echo ""
        echo "Payment Processing:"
        check_var "AUTHORIZE_NET_API_LOGIN_ID" || ((errors++))
        check_var "AUTHORIZE_NET_TRANSACTION_KEY" || ((errors++))
        check_var "AUTHORIZE_NET_ENV" || ((errors++))
        
        echo ""
        echo "File Storage:"
        check_var "AWS_S3_BUCKET" || ((errors++))
        check_var "AWS_ACCESS_KEY_ID" || ((errors++))
        check_var "AWS_SECRET_ACCESS_KEY" || ((errors++))
        check_var "AWS_REGION" || ((errors++))
        
        echo ""
        echo "Email Service:"
        check_var "SENDGRID_API_KEY" || ((errors++))
        check_var "FROM_EMAIL" || ((errors++))
        
        echo ""
        echo "URLs:"
        check_var "FRONTEND_URL" || ((errors++))
        check_var "TRACKING_BASE_URL" || ((errors++))
        
        # Validate URL formats
        if [[ ! "$FRONTEND_URL" =~ ^https?:// ]]; then
            print_error "FRONTEND_URL should start with http:// or https://"
            ((errors++))
        fi
        
        if [[ ! "$TRACKING_BASE_URL" =~ ^https?:// ]]; then
            print_error "TRACKING_BASE_URL should start with http:// or https://"
            ((errors++))
        fi
        
        # Test database connection (optional)
        echo ""
        echo "Testing database connection..."
        if command -v psql &> /dev/null; then
            if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
                print_success "Database connection successful"
            else
                print_error "Cannot connect to database"
                ((errors++))
            fi
        else
            print_warning "psql not found, skipping database connection test"
        fi
    else
        print_error "Backend .env file not found!"
        ((errors++))
    fi
fi

# ================================
# SUMMARY
# ================================
echo ""
print_header "Validation Summary"
echo ""

if [ $errors -eq 0 ]; then
    print_success "All checks passed! Your environment is properly configured."
    echo ""
    echo "You're ready to run:"
    if [ "$validate_frontend" = true ]; then
        echo "  cd frontend && npm start"
    fi
    if [ "$validate_backend" = true ]; then
        echo "  cd backend && npm run dev"
    fi
    exit 0
else
    print_error "Found $errors error(s) in your configuration."
    echo ""
    echo "Please fix the errors above and run this script again."
    echo "For help, refer to:"
    echo "  - docs/DEVELOPMENT.md"
    echo "  - .env.example files"
    exit 1
fi
