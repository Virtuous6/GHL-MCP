#!/bin/bash

# Mass Deploy Script for All GoHighLevel MCP Servers
# Deploys servers in priority order with proper timing

set -e  # Exit on any error

echo "🚀 MASS DEPLOYMENT: GoHighLevel MCP Servers"
echo "=============================================="
echo ""
echo "This will deploy all remaining MCP servers in priority order:"
echo ""
echo "Priority 1 (Core Business):"
echo "  1. ghl-communications-mcp"
echo "  2. ghl-sales-mcp" 
echo "  3. ghl-operations-mcp"
echo ""
echo "Priority 2 (Marketing & E-commerce):"
echo "  4. ghl-marketing-mcp"
echo "  5. ghl-ecommerce-mcp"
echo ""
echo "Priority 3 (Advanced Features):"
echo "  6. ghl-data-mcp"
echo ""
echo "💰 Total Cost: ~$23.28/month (6 servers × $3.88)"
echo "⏱️  Estimated Time: ~20-30 minutes"
echo ""

# Confirm deployment
read -p "🤔 Do you want to proceed with mass deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo ""
echo "🎯 Starting mass deployment..."
echo "=============================================="

# Define servers in priority order
PRIORITY_1=("ghl-communications-mcp" "ghl-sales-mcp" "ghl-operations-mcp")
PRIORITY_2=("ghl-marketing-mcp" "ghl-ecommerce-mcp")  
PRIORITY_3=("ghl-data-mcp")

DEPLOYED_SERVERS=()
FAILED_SERVERS=()
TOTAL_SERVERS=6
CURRENT_SERVER=0

# Function to deploy a single server
deploy_server() {
    local server_name=$1
    local priority=$2
    
    CURRENT_SERVER=$((CURRENT_SERVER + 1))
    
    echo ""
    echo "🚀 [$CURRENT_SERVER/$TOTAL_SERVERS] Deploying $server_name (Priority $priority)..."
    echo "------------------------------------------------------"
    
    if ./quick-deploy-server.sh "$server_name"; then
        echo "   ✅ $server_name deployed successfully!"
        DEPLOYED_SERVERS+=("$server_name")
    else
        echo "   ❌ $server_name deployment failed!"
        FAILED_SERVERS+=("$server_name")
        
        # Ask if we should continue
        echo ""
        read -p "   🤔 Continue with remaining deployments? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "   ⏹️  Mass deployment stopped."
            return 1
        fi
    fi
}

# Function to wait between deployments
wait_between_deployments() {
    local seconds=$1
    echo ""
    echo "⏱️  Waiting $seconds seconds before next deployment..."
    for i in $(seq $seconds -1 1); do
        echo -ne "   ⏳ $i seconds remaining...\r"
        sleep 1
    done
    echo "   ✅ Ready for next deployment!      "
}

# Deploy Priority 1 servers (Core Business Functions)
echo ""
echo "🎯 PHASE 1: Core Business Functions"
echo "=============================================="

for server in "${PRIORITY_1[@]}"; do
    deploy_server "$server" "1"
    if [ ${#PRIORITY_1[@]} -gt 1 ] && [ "$server" != "${PRIORITY_1[-1]}" ]; then
        wait_between_deployments 30
    fi
done

# Wait between phases
if [ ${#PRIORITY_2[@]} -gt 0 ]; then
    echo ""
    echo "🏁 Phase 1 Complete! Moving to Phase 2..."
    wait_between_deployments 60
fi

# Deploy Priority 2 servers (Marketing & E-commerce)
echo ""
echo "🎯 PHASE 2: Marketing & E-commerce"
echo "=============================================="

for server in "${PRIORITY_2[@]}"; do
    deploy_server "$server" "2"
    if [ ${#PRIORITY_2[@]} -gt 1 ] && [ "$server" != "${PRIORITY_2[-1]}" ]; then
        wait_between_deployments 30
    fi
done

# Wait between phases
if [ ${#PRIORITY_3[@]} -gt 0 ]; then
    echo ""
    echo "🏁 Phase 2 Complete! Moving to Phase 3..."
    wait_between_deployments 60
fi

# Deploy Priority 3 servers (Advanced Features)
echo ""
echo "🎯 PHASE 3: Advanced Features"
echo "=============================================="

for server in "${PRIORITY_3[@]}"; do
    deploy_server "$server" "3"
done

# Final summary
echo ""
echo ""
echo "🎉 MASS DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""

if [ ${#DEPLOYED_SERVERS[@]} -gt 0 ]; then
    echo "✅ Successfully Deployed Servers (${#DEPLOYED_SERVERS[@]}/$TOTAL_SERVERS):"
    for server in "${DEPLOYED_SERVERS[@]}"; do
        app_name=$(echo "$server" | sed 's/ghl-//')
        echo "   ✅ $server → https://ghl-$app_name.fly.dev"
    done
fi

if [ ${#FAILED_SERVERS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Failed Deployments (${#FAILED_SERVERS[@]}/$TOTAL_SERVERS):"
    for server in "${FAILED_SERVERS[@]}"; do
        echo "   ❌ $server"
    done
fi

echo ""
echo "📊 DEPLOYMENT SUMMARY:"
echo "=============================================="
echo "🎯 Total Servers: $TOTAL_SERVERS"
echo "✅ Successful: ${#DEPLOYED_SERVERS[@]}"
echo "❌ Failed: ${#FAILED_SERVERS[@]}"
echo "💰 Monthly Cost: \$$(echo "scale=2; ${#DEPLOYED_SERVERS[@]} * 3.88" | bc)"
echo ""

if [ ${#DEPLOYED_SERVERS[@]} -gt 0 ]; then
    echo "🌐 Deployed Server URLs:"
    echo "=============================================="
    for server in "${DEPLOYED_SERVERS[@]}"; do
        app_name=$(echo "$server" | sed 's/ghl-//')
        echo "🔗 $server:"
        echo "   📱 Main: https://ghl-$app_name.fly.dev"
        echo "   🏥 Health: https://ghl-$app_name.fly.dev/health"
        echo "   🔧 Tools: https://ghl-$app_name.fly.dev/tools"
        echo "   📡 SSE: https://ghl-$app_name.fly.dev/sse"
        echo ""
    done
fi

echo "🎯 NEXT STEPS:"
echo "=============================================="
echo "1. 🧪 Test each deployed server manually"
echo "2. 📝 Update Claude Desktop configuration"  
echo "3. 🔑 Configure API credentials for each server"
echo "4. 🚀 Start using your modular MCP ecosystem!"
echo ""

if [ ${#FAILED_SERVERS[@]} -gt 0 ]; then
    echo "🔧 For failed deployments:"
    echo "   - Check fly.io logs for errors"
    echo "   - Retry with: ./quick-deploy-server.sh <server-name>"
    echo "   - Contact support if issues persist"
    echo ""
fi

echo "🏆 Congratulations on your GoHighLevel MCP ecosystem!"
echo "==============================================" 