#!/bin/bash

# Quick Deploy Script for GoHighLevel MCP Servers
# Based on successful ghl-core-mcp deployment pattern

set -e  # Exit on any error

SERVER_NAME=$1
if [ -z "$SERVER_NAME" ]; then
    echo "❌ Usage: ./quick-deploy-server.sh <server-name>"
    echo ""
    echo "Available servers:"
    echo "  - ghl-communications-mcp"
    echo "  - ghl-sales-mcp" 
    echo "  - ghl-marketing-mcp"
    echo "  - ghl-operations-mcp"
    echo "  - ghl-ecommerce-mcp"
    echo "  - ghl-data-mcp"
    echo ""
    echo "Example: ./quick-deploy-server.sh ghl-communications-mcp"
    exit 1
fi

echo "🚀 Deploying $SERVER_NAME..."
echo "======================================================"

# Check if server directory exists
if [ ! -d "$SERVER_NAME" ]; then
    echo "❌ Server directory not found: $SERVER_NAME"
    echo "Please run ./split-servers.sh first to generate server structures"
    exit 1
fi

cd "$SERVER_NAME"

echo "📁 Current directory: $(pwd)"

# Step 1: Copy HTTP server template from ghl-core-mcp
echo "📋 Step 1: Copying HTTP server template..."
if [ -f "../ghl-core-mcp/src/http-server.ts" ]; then
    cp "../ghl-core-mcp/src/http-server.ts" "src/"
    echo "   ✅ http-server.ts copied"
else
    echo "   ❌ ghl-core-mcp http-server.ts not found"
    exit 1
fi

# Step 2: Copy Dockerfile
echo "📋 Step 2: Copying Dockerfile..."
if [ -f "../ghl-core-mcp/Dockerfile" ]; then
    cp "../ghl-core-mcp/Dockerfile" "."
    echo "   ✅ Dockerfile copied"
else
    echo "   ❌ ghl-core-mcp Dockerfile not found"
    exit 1
fi

# Step 3: Copy and update fly.toml
echo "📋 Step 3: Creating fly.toml..."
if [ -f "../ghl-core-mcp/fly.toml" ]; then
    cp "../ghl-core-mcp/fly.toml" "."
    
    # Extract the server name without 'ghl-' prefix for app name
    APP_NAME=$(echo "$SERVER_NAME" | sed 's/ghl-//')
    
    # Update app name in fly.toml
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/app = 'ghl-dynamic-mcp'/app = 'ghl-$APP_NAME'/" fly.toml
    else
        # Linux
        sed -i "s/app = 'ghl-dynamic-mcp'/app = 'ghl-$APP_NAME'/" fly.toml
    fi
    
    echo "   ✅ fly.toml created with app name: ghl-$APP_NAME"
else
    echo "   ❌ ghl-core-mcp fly.toml not found"
    exit 1
fi

# Step 4: Update HTTP server imports (customize for each server's tools)
echo "📋 Step 4: Customizing HTTP server for $SERVER_NAME tools..."

# This is a simplified version - in practice, you'd want to customize
# the http-server.ts imports and tool routing for each server's specific tools
echo "   ⚠️  Note: Using generic HTTP server template"
echo "   📝 TODO: Customize tool imports for $SERVER_NAME specific tools"

# Step 5: Install dependencies and build
echo "📋 Step 5: Installing dependencies and building..."
if [ -f "package.json" ]; then
    npm install
    echo "   ✅ Dependencies installed"
    
    npm run build
    echo "   ✅ Project built"
else
    echo "   ❌ package.json not found"
    exit 1
fi

# Step 6: Check if we're logged into fly.io
echo "📋 Step 6: Checking fly.io authentication..."
if ! fly auth whoami &>/dev/null; then
    echo "   ❌ Not logged into fly.io"
    echo "   Please run: fly auth login"
    exit 1
fi
echo "   ✅ Fly.io authenticated"

# Step 7: Launch the app
echo "📋 Step 7: Launching fly.io app..."
if fly launch --copy-config --yes --now; then
    echo "   ✅ Fly.io app launched"
else
    echo "   ❌ Failed to launch fly.io app"
    exit 1
fi

# Step 8: Add SSL certificate
echo "📋 Step 8: Adding SSL certificate..."
APP_NAME=$(echo "$SERVER_NAME" | sed 's/ghl-//')
DOMAIN="ghl-$APP_NAME.fly.dev"

if fly certs add "$DOMAIN"; then
    echo "   ✅ SSL certificate added for $DOMAIN"
else
    echo "   ⚠️  SSL certificate addition may have failed (check manually)"
fi

# Step 9: Deploy with no cache
echo "📋 Step 9: Deploying with fresh build..."
if fly deploy --no-cache; then
    echo "   ✅ Deployment successful"
else
    echo "   ❌ Deployment failed"
    exit 1
fi

# Step 10: Test the deployment
echo "📋 Step 10: Testing deployment..."
echo "   🔗 App URL: https://$DOMAIN"
echo "   🏥 Health check: https://$DOMAIN/health"
echo "   🔧 Tools endpoint: https://$DOMAIN/tools"
echo "   📡 SSE endpoint: https://$DOMAIN/sse"

# Wait a moment for deployment to be ready
sleep 5

# Test health endpoint
echo "   📋 Testing health endpoint..."
if curl -s -f "https://$DOMAIN/health" >/dev/null; then
    echo "   ✅ Health endpoint responding"
else
    echo "   ⚠️  Health endpoint not responding yet (SSL may still be provisioning)"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================================================"
echo "✅ Server: $SERVER_NAME"  
echo "🔗 URL: https://$DOMAIN"
echo "📊 Status: Check with 'fly status' in this directory"
echo "📝 Logs: Check with 'fly logs' in this directory"
echo ""
echo "🎯 Next Steps:"
echo "1. Test endpoints manually in browser"
echo "2. Verify all tools are loading correctly"
echo "3. Add to Claude Desktop configuration"
echo "4. Test with real GoHighLevel API credentials"
echo ""
echo "💰 Cost: ~$3.88/month with auto-scaling"
echo "======================================================" 