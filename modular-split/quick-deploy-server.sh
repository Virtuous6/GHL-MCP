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

# Step 4: Validate package.json and dependencies
echo "📋 Step 4: Validating server configuration..."
if [ ! -f "package.json" ]; then
    echo "   ❌ package.json not found"
    exit 1
fi

# Check if the server has the expected tool files
EXPECTED_TOOLS_DIR="src/tools"
if [ ! -d "$EXPECTED_TOOLS_DIR" ]; then
    echo "   ⚠️  Warning: $EXPECTED_TOOLS_DIR not found - server may not have tools configured"
fi

echo "   ✅ Server configuration validated"

# Step 5: Install dependencies and build
echo "📋 Step 5: Installing dependencies and building..."
if npm install; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Failed to install dependencies"
    exit 1
fi

if npm run build; then
    echo "   ✅ Project built successfully"
else
    echo "   ❌ Build failed"
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
    echo "   💡 Try running 'fly apps destroy ghl-$APP_NAME' if app already exists"
    exit 1
fi

# Step 8: Deploy with no cache
echo "📋 Step 8: Deploying with fresh build..."
if fly deploy --no-cache; then
    echo "   ✅ Deployment successful"
else
    echo "   ❌ Deployment failed"
    echo "   💡 Check logs with: fly logs"
    exit 1
fi

# Step 9: Wait for deployment to be ready and test
echo "📋 Step 9: Testing deployment..."
APP_NAME=$(echo "$SERVER_NAME" | sed 's/ghl-//')
DOMAIN="ghl-$APP_NAME.fly.dev"

echo "   🔗 App URL: https://$DOMAIN"
echo "   🏥 Health check: https://$DOMAIN/health"
echo "   🔧 Tools endpoint: https://$DOMAIN/tools"
echo "   📡 SSE endpoint: https://$DOMAIN/sse"

# Wait for deployment to be ready
echo "   ⏳ Waiting for deployment to be ready..."
sleep 10

# Test health endpoint with retries
echo "   📋 Testing health endpoint..."
for i in {1..5}; do
    if curl -s -f "https://$DOMAIN/health" >/dev/null; then
        echo "   ✅ Health endpoint responding"
        break
    else
        if [ $i -eq 5 ]; then
            echo "   ⚠️  Health endpoint not responding after 5 attempts"
            echo "   💡 Check deployment status with: fly status"
            echo "   💡 Check logs with: fly logs"
        else
            echo "   ⏳ Attempt $i/5 failed, retrying in 5 seconds..."
            sleep 5
        fi
    fi
done

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
echo "🔒 SSL: Automatic for *.fly.dev domains"
echo "======================================================" 