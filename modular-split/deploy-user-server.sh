#!/bin/bash

# GoHighLevel MCP Server - Per-User Deployment Script
# Usage: ./deploy-user-server.sh <user_id> <api_key> <location_id> [region]

set -e

USER_ID=$1
GHL_API_KEY=$2
GHL_LOCATION_ID=$3
REGION=${4:-"sjc"}  # Default to San Jose

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate inputs
if [ -z "$USER_ID" ] || [ -z "$GHL_API_KEY" ] || [ -z "$GHL_LOCATION_ID" ]; then
    print_error "Missing required parameters!"
    echo "Usage: $0 <user_id> <api_key> <location_id> [region]"
    echo ""
    echo "Examples:"
    echo "  $0 john pk_live_abc123... loc_xyz789..."
    echo "  $0 acme-corp pk_live_def456... loc_abc123... iad"
    echo ""
    echo "Available regions: sjc, iad, lhr, nrt, syd, etc."
    exit 1
fi

# Sanitize user ID (remove special characters)
CLEAN_USER_ID=$(echo "$USER_ID" | sed 's/[^a-zA-Z0-9-]//g' | tr '[:upper:]' '[:lower:]')
if [ "$USER_ID" != "$CLEAN_USER_ID" ]; then
    print_warning "User ID sanitized: $USER_ID → $CLEAN_USER_ID"
    USER_ID="$CLEAN_USER_ID"
fi

APP_NAME="ghl-core-mcp-${USER_ID}"
SERVER_DIR="ghl-core-mcp-${USER_ID}"

print_status "Deploying GoHighLevel MCP Server for user: $USER_ID"
print_status "App name: $APP_NAME"
print_status "Region: $REGION"

# Check if Fly CLI is installed
if ! command -v fly &> /dev/null; then
    print_error "Fly CLI is not installed. Please install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in to Fly.io
if ! fly auth whoami &> /dev/null; then
    print_error "Please login to Fly.io first:"
    echo "fly auth login"
    exit 1
fi

# Check if template directory exists
if [ ! -d "ghl-core-mcp" ]; then
    print_error "Template directory 'ghl-core-mcp' not found!"
    echo "Please run this script from the modular-split directory."
    exit 1
fi

# Create user-specific server directory
print_status "Creating server directory for $USER_ID..."
if [ -d "$SERVER_DIR" ]; then
    print_warning "Directory $SERVER_DIR already exists. Removing..."
    rm -rf "$SERVER_DIR"
fi

cp -r ghl-core-mcp "$SERVER_DIR"
cd "$SERVER_DIR"

# Update fly.toml with user-specific configuration
print_status "Configuring fly.toml..."
cat > fly.toml << EOF
app = "$APP_NAME"
primary_region = "$REGION"

[build]

[deploy]
  release_command = "npm run build"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[machine]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1

[[services]]
  protocol = "tcp"
  internal_port = 8080

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20
EOF

# Update package.json with user-specific name
print_status "Updating package.json..."
sed -i.bak "s/\"name\": \"@ghl\/core-mcp\"/\"name\": \"@ghl\/core-mcp-${USER_ID}\"/" package.json
rm package.json.bak

# Deploy to Fly.io
print_status "Deploying to Fly.io..."
fly launch --copy-config --yes --name "$APP_NAME" --region "$REGION"

# Set environment secrets
print_status "Setting environment secrets..."
fly secrets set GHL_API_KEY="$GHL_API_KEY" \
               GHL_LOCATION_ID="$GHL_LOCATION_ID" \
               GHL_BASE_URL="https://services.leadconnectorhq.com"

# Deploy the application
print_status "Deploying application..."
fly deploy

# Get deployment info
APP_URL="https://${APP_NAME}.fly.dev"
ADMIN_URL="https://fly.io/apps/${APP_NAME}"

print_success "Deployment complete!"
echo ""
echo "🎯 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "User ID:      $USER_ID"
echo "App Name:     $APP_NAME"
echo "App URL:      $APP_URL"
echo "Admin URL:    $ADMIN_URL"
echo "Region:       $REGION"
echo "Cost:         ~$3.88/month"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate Claude Desktop config
print_status "Generating Claude Desktop configuration..."
cat > "claude-desktop-config-${USER_ID}.json" << EOF
{
  "mcpServers": {
    "ghl-core-${USER_ID}": {
      "command": "node",
      "args": ["/path/to/modular-split/${SERVER_DIR}/dist/server.js"],
      "env": {
        "GHL_API_KEY": "${GHL_API_KEY}",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "${GHL_LOCATION_ID}"
      }
    }
  }
}
EOF

print_success "Claude Desktop config saved: claude-desktop-config-${USER_ID}.json"

echo ""
echo "🚀 Next Steps:"
echo "1. Test the deployment: curl $APP_URL/health"
echo "2. Add the config to Claude Desktop mcp_settings.json"
echo "3. Restart Claude Desktop to load the new server"
echo ""
print_success "User $USER_ID is ready to use their GoHighLevel MCP server!"

# Return to original directory
cd ..

# Create deployment log entry
echo "$(date): Deployed $APP_NAME for user $USER_ID - $APP_URL" >> deployment-log.txt 