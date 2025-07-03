# 🏗️ Multi-User GoHighLevel MCP Server Architecture

## 🎯 **Option 1: Per-User Server Deployment** (Recommended for <50 users)

### **Architecture**
```
User A → ghl-core-mcp-usera.fly.dev (User A's API key)
User B → ghl-core-mcp-userb.fly.dev (User B's API key)
User C → ghl-core-mcp-userc.fly.dev (User C's API key)
```

### **Benefits**
- ✅ **Complete isolation** - Users can't access each other's data
- ✅ **Simple security** - Each server has its own credentials
- ✅ **Independent scaling** - Scale per user based on usage
- ✅ **Easy debugging** - Isolated logs per user
- ✅ **No code changes needed** - Use existing server as-is

### **Cost Calculation**
```
Per user: $3.88/month (Fly.io shared-cpu-2x)
10 users: $38.80/month
25 users: $97/month
50 users: $194/month
```

### **Deployment Script**
```bash
#!/bin/bash
# deploy-user-server.sh

USER_ID=$1
GHL_API_KEY=$2
GHL_LOCATION_ID=$3

if [ -z "$USER_ID" ] || [ -z "$GHL_API_KEY" ] || [ -z "$GHL_LOCATION_ID" ]; then
    echo "Usage: ./deploy-user-server.sh <user_id> <api_key> <location_id>"
    exit 1
fi

# Copy server template
cp -r ghl-core-mcp ghl-core-mcp-${USER_ID}
cd ghl-core-mcp-${USER_ID}

# Update fly.toml with user-specific app name
sed -i '' "s/app = \"ghl-core-mcp\"/app = \"ghl-core-mcp-${USER_ID}\"/" fly.toml

# Deploy
fly launch --copy-config --yes
fly secrets set GHL_API_KEY="${GHL_API_KEY}"
fly secrets set GHL_LOCATION_ID="${GHL_LOCATION_ID}"
fly secrets set GHL_BASE_URL="https://services.leadconnectorhq.com"
fly deploy

echo "✅ Deployed: https://ghl-core-mcp-${USER_ID}.fly.dev"
```

### **Claude Desktop Config (Per User)**
```json
{
  "mcpServers": {
    "ghl-core-usera": {
      "command": "node",
      "args": ["/path/to/ghl-core-mcp-usera/dist/server.js"],
      "env": {
        "GHL_API_KEY": "user_a_api_key",
        "GHL_LOCATION_ID": "user_a_location_id",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com"
      }
    }
  }
}
```

---

## 🔄 **Option 2: Multi-Tenant Single Server** (Recommended for 50+ users)

### **Architecture**
```
All Users → ghl-core-mcp-multitenant.fly.dev
          ↓
    [User Context Router]
          ↓
User A API calls ← → User B API calls ← → User C API calls
```

### **Benefits**
- ✅ **Cost efficient** - Single server for all users
- ✅ **Centralized management** - One deployment to maintain
- ✅ **Horizontal scaling** - Add more instances as needed
- ✅ **Resource sharing** - Better resource utilization

### **Implementation**
Modify the server to accept user context in tool calls:

```typescript
// Multi-tenant server.ts
class MultiTenantCRMServer {
  private server: Server;
  private userConfigs: Map<string, GHLConfig> = new Map();

  constructor() {
    this.server = new Server(
      { name: 'ghl-core-mcp-multitenant', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    
    this.loadUserConfigurations();
    this.setupHandlers();
  }

  private loadUserConfigurations(): void {
    // Load from environment or database
    const users = JSON.parse(process.env.USER_CONFIGS || '{}');
    
    for (const [userId, config] of Object.entries(users)) {
      this.userConfigs.set(userId, config as GHLConfig);
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      // Extract user ID from tool arguments
      const userId = args.userId || args.user_id;
      if (!userId) {
        throw new McpError(ErrorCode.InvalidParams, 'userId is required');
      }

      const userConfig = this.userConfigs.get(userId);
      if (!userConfig) {
        throw new McpError(ErrorCode.InvalidParams, `Unknown user: ${userId}`);
      }

      // Create user-specific API client
      const ghlClient = new GHLApiClient(userConfig);
      const contactTools = new ContactTools(ghlClient);

      // Execute tool with user-specific client
      return await contactTools.executeTool(toolName, args);
    });
  }
}
```

### **Tool Usage (Multi-Tenant)**
```json
{
  "name": "search_contacts",
  "arguments": {
    "userId": "user123",
    "query": "VIP customers",
    "limit": 50
  }
}
```

### **Environment Configuration**
```bash
# Set user configurations as JSON
fly secrets set USER_CONFIGS='{
  "user123": {
    "accessToken": "user123_api_key",
    "locationId": "user123_location_id",
    "baseUrl": "https://services.leadconnectorhq.com"
  },
  "user456": {
    "accessToken": "user456_api_key", 
    "locationId": "user456_location_id",
    "baseUrl": "https://services.leadconnectorhq.com"
  }
}'
```

---

## 🌐 **Option 3: Gateway + Per-User Backends** (Enterprise)

### **Architecture**
```
Claude Desktop → MCP Gateway → Route by User ID
                      ↓
    User A Server ← → User B Server ← → User C Server
```

### **Benefits**
- ✅ **Best of both worlds** - Isolation + centralized management
- ✅ **Dynamic scaling** - Add/remove user servers as needed
- ✅ **Advanced routing** - Route by user, region, or features
- ✅ **High availability** - Gateway can handle failover

### **Implementation**
Create an MCP gateway that routes requests:

```typescript
// gateway-server.ts
class MCPGateway {
  private userServers: Map<string, string> = new Map(); // userId -> serverUrl

  constructor() {
    this.loadUserRouting();
  }

  private async routeRequest(userId: string, toolName: string, args: any) {
    const serverUrl = this.userServers.get(userId);
    if (!serverUrl) {
      throw new Error(`No server configured for user: ${userId}`);
    }

    // Forward request to user-specific MCP server
    return await this.forwardToUserServer(serverUrl, toolName, args);
  }
}
```

---

## 🎯 **Recommendation Based on Scale**

### **1-10 Users: Per-User Deployment**
- **Cost**: $40-100/month
- **Effort**: Low (use deployment script)
- **Security**: Highest

### **10-50 Users: Hybrid Approach**
- **Core customers**: Per-user servers
- **Regular users**: Multi-tenant server
- **Cost**: $50-150/month

### **50+ Users: Multi-Tenant + Database**
- **Single server** with user database
- **Cost**: $10-30/month + database
- **Effort**: Medium (requires development)

---

## 🚀 **Quick Start: Deploy for Multiple Users**

### **Option 1: Quick Per-User Deployment**
```bash
# Deploy for User A
./deploy-user-server.sh "usera" "user_a_api_key" "user_a_location_id"

# Deploy for User B  
./deploy-user-server.sh "userb" "user_b_api_key" "user_b_location_id"
```

### **Option 2: Multi-Tenant Setup**
```bash
# Set up multi-tenant configuration
fly secrets set USER_CONFIGS='{"user1":{"accessToken":"key1","locationId":"loc1"}}'
fly deploy
```

---

## 💡 **Best Practices**

### **Security**
- ✅ Never log API keys
- ✅ Use environment variables for all credentials
- ✅ Implement rate limiting per user
- ✅ Monitor for unusual API usage

### **Monitoring**
- ✅ Track API usage per user
- ✅ Set up alerts for failed requests
- ✅ Monitor costs per user
- ✅ Log user actions for debugging

### **Scaling**
- ✅ Start with per-user deployment for simplicity
- ✅ Move to multi-tenant when >20 users
- ✅ Use database for user config at scale
- ✅ Implement horizontal scaling

---

## 📊 **Cost Comparison**

| Users | Per-User | Multi-Tenant | Gateway |
|-------|----------|--------------|---------|
| 5     | $19/mo   | $8/mo        | $15/mo  |
| 25    | $97/mo   | $8/mo        | $25/mo  |
| 100   | $388/mo  | $15/mo       | $40/mo  |

**Winner**: Multi-tenant for 20+ users, per-user for <20 users 