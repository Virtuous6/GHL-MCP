# 🚀 Multi-User Usage Examples

## 📋 **Option 1: Per-User Deployment Examples**

### **Deploy Multiple Users**
```bash
# Deploy for different users with their own servers
./deploy-user-server.sh "john-doe" "pk_live_abc123..." "loc_xyz789..."
./deploy-user-server.sh "acme-corp" "pk_live_def456..." "loc_abc123..."
./deploy-user-server.sh "marketing-agency" "pk_live_ghi789..." "loc_def456..."
```

### **Claude Desktop Configuration (Multiple Servers)**
```json
{
  "mcpServers": {
    "ghl-core-john": {
      "command": "node",
      "args": ["/path/to/ghl-core-mcp-john-doe/dist/server.js"],
      "env": {
        "GHL_API_KEY": "john_doe_api_key",
        "GHL_LOCATION_ID": "john_doe_location_id",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com"
      }
    },
    "ghl-core-acme": {
      "command": "node", 
      "args": ["/path/to/ghl-core-mcp-acme-corp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "acme_corp_api_key",
        "GHL_LOCATION_ID": "acme_corp_location_id",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com"
      }
    }
  }
}
```

### **Usage in Claude Desktop**
```
User: "Switch to my John Doe account and search for VIP customers"
Claude: Using ghl-core-john server to search contacts...

User: "Now check Acme Corp's recent leads"
Claude: Using ghl-core-acme server to get recent contacts...
```

---

## 🔄 **Option 2: Multi-Tenant Usage Examples**

### **Environment Setup**
```bash
# Set up multi-tenant configuration
fly secrets set USER_CONFIGS='{
  "john-doe": {
    "accessToken": "pk_live_abc123...",
    "locationId": "loc_xyz789...",
    "baseUrl": "https://services.leadconnectorhq.com"
  },
  "acme-corp": {
    "accessToken": "pk_live_def456...",
    "locationId": "loc_abc123...",
    "baseUrl": "https://services.leadconnectorhq.com"
  },
  "marketing-agency": {
    "accessToken": "pk_live_ghi789...",
    "locationId": "loc_def456...", 
    "baseUrl": "https://services.leadconnectorhq.com"
  }
}'
```

### **Claude Desktop Configuration (Single Server)**
```json
{
  "mcpServers": {
    "ghl-multitenant": {
      "command": "node",
      "args": ["/path/to/ghl-core-mcp-multitenant/dist/server.js"],
      "env": {
        "USER_CONFIGS": "{\"john-doe\":{\"accessToken\":\"pk_live_abc123...\",\"locationId\":\"loc_xyz789...\"},\"acme-corp\":{\"accessToken\":\"pk_live_def456...\",\"locationId\":\"loc_abc123...\"}}"
      }
    }
  }
}
```

### **Tool Usage (Multi-Tenant)**
```
User: "Search for VIP customers in John Doe's account"
Claude: I'll search contacts for user john-doe...

Tool Call:
{
  "name": "search_contacts",
  "arguments": {
    "userId": "john-doe",
    "query": "VIP",
    "limit": 50
  }
}

User: "Now create a contact in Acme Corp's account"
Claude: I'll create a contact for user acme-corp...

Tool Call:
{
  "name": "create_contact", 
  "arguments": {
    "userId": "acme-corp",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  }
}
```

---

## 💼 **Business Use Cases**

### **Agency Managing Multiple Clients**
```bash
# Deploy individual servers for high-value clients
./deploy-user-server.sh "enterprise-client-a" "pk_live_..." "loc_..."
./deploy-user-server.sh "enterprise-client-b" "pk_live_..." "loc_..."

# Use multi-tenant for smaller clients
fly secrets set USER_CONFIGS='{
  "small-client-1": {...},
  "small-client-2": {...},
  "small-client-3": {...}
}'
```

### **SaaS Platform**
```bash
# Tiered approach based on subscription
Premium Users → Individual servers ($3.88/month each)
Standard Users → Multi-tenant server (shared cost)
Trial Users → Shared development server
```

### **Internal Team Usage**
```bash
# Department-based deployment
./deploy-user-server.sh "sales-team" "pk_live_..." "loc_..."
./deploy-user-server.sh "marketing-team" "pk_live_..." "loc_..."
./deploy-user-server.sh "support-team" "pk_live_..." "loc_..."
```

---

## 🎯 **Cost Examples**

### **Small Agency (5 clients)**
```
Option 1 (Per-User): 5 × $3.88 = $19.40/month
Option 2 (Multi-Tenant): 1 × $3.88 = $3.88/month
Savings: 80% with multi-tenant
```

### **Medium Agency (25 clients)**
```
Option 1 (Per-User): 25 × $3.88 = $97/month  
Option 2 (Multi-Tenant): 1 × $3.88 = $3.88/month
Savings: 96% with multi-tenant
```

### **Enterprise (100+ clients)**
```
Hybrid Approach:
- 10 enterprise clients: 10 × $3.88 = $38.80/month
- 90 standard clients: 1 multi-tenant = $3.88/month
Total: $42.68/month vs $388/month (89% savings)
```

---

## 🔧 **Management Scripts**

### **User Management Script**
```bash
#!/bin/bash
# manage-users.sh

ACTION=$1
USER_ID=$2

case $ACTION in
  "add")
    echo "Adding user $USER_ID..."
    ./deploy-user-server.sh "$USER_ID" "$3" "$4"
    ;;
  "remove")
    echo "Removing user $USER_ID..."
    fly apps destroy "ghl-core-mcp-$USER_ID" --yes
    rm -rf "ghl-core-mcp-$USER_ID"
    ;;
  "list")
    echo "Active deployments:"
    fly apps list | grep ghl-core-mcp
    ;;
  "costs")
    echo "Monthly costs:"
    fly apps list | grep ghl-core-mcp | wc -l | xargs -I {} echo "{} users × \$3.88 = \$$(echo "{} * 3.88" | bc)/month"
    ;;
esac
```

### **Multi-Tenant User Management**
```bash
#!/bin/bash
# manage-multitenant-users.sh

ACTION=$1
USER_ID=$2

case $ACTION in
  "add")
    echo "Adding user $USER_ID to multi-tenant server..."
    # Add user to USER_CONFIGS environment variable
    # This would require more complex JSON manipulation
    ;;
  "remove")
    echo "Removing user $USER_ID from multi-tenant server..."
    # Remove user from USER_CONFIGS environment variable
    ;;
  "list")
    echo "Users in multi-tenant server:"
    fly ssh console -a ghl-core-mcp-multitenant -C "printenv USER_CONFIGS" | jq -r 'keys[]'
    ;;
esac
```

---

## 🚀 **Quick Start Commands**

### **Start with Per-User (Simple)**
```bash
# Deploy first user
./deploy-user-server.sh "my-first-user" "your_api_key" "your_location_id"

# Test the deployment
curl https://ghl-core-mcp-my-first-user.fly.dev/health

# Add to Claude Desktop and start using!
```

### **Start with Multi-Tenant (Scalable)**
```bash
# Clone and modify the multi-tenant server
cp -r ghl-core-mcp ghl-core-mcp-multitenant
cd ghl-core-mcp-multitenant

# Replace server.ts with multi-tenant version
cp ../multi-tenant-example.ts src/server.ts

# Deploy with user configurations
fly launch
fly secrets set USER_CONFIGS='{"user1":{"accessToken":"key1","locationId":"loc1"}}'
fly deploy
```

Choose based on your needs:
- **<10 users**: Per-user deployment
- **10+ users**: Multi-tenant approach
- **Mixed needs**: Hybrid approach 