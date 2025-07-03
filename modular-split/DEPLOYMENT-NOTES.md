# 🏗️ GoHighLevel Modular MCP Server Deployment Guide

## ✅ **Current Status**
- **ghl-core-mcp**: ✅ DEPLOYED & WORKING (https://ghl-dynamic-mcp.fly.dev)
- **ghl-ecommerce-mcp**: ✅ DEPLOYED & WORKING (https://ghl-ecommerce-mcp.fly.dev)
- **ghl-communications-mcp**: ⏳ To Deploy
- **ghl-sales-mcp**: ⏳ To Deploy  
- **ghl-marketing-mcp**: ⏳ To Deploy
- **ghl-operations-mcp**: ⏳ To Deploy
- **ghl-data-mcp**: ⏳ To Deploy

---

## 🎯 **Server Mapping & Tool Distribution**

### **✅ ghl-core-mcp** (COMPLETED)
- **Focus**: Contact Management, Custom Fields, Email Verification
- **Tools**: contact-tools.ts, custom-field-v2-tools.ts, email-isv-tools.ts
- **Tool Count**: 40 tools
- **URL**: https://ghl-dynamic-mcp.fly.dev
- **Status**: ✅ Deployed & Working

### **🔄 ghl-communications-mcp** 
- **Focus**: Conversations, Email Campaigns
- **Tools**: conversation-tools.ts, email-tools.ts
- **Estimated Tool Count**: ~35 tools
- **Features**: SMS, Email campaigns, Conversation management
- **Priority**: HIGH (Core communication features)

### **🔄 ghl-sales-mcp**
- **Focus**: Sales Pipeline, Payments, Invoicing
- **Tools**: opportunity-tools.ts, payments-tools.ts, invoices-tools.ts  
- **Estimated Tool Count**: ~45 tools
- **Features**: Lead management, Payment processing, Invoice generation
- **Priority**: HIGH (Revenue-generating features)

### **🔄 ghl-marketing-mcp**
- **Focus**: Content Marketing, Social Media
- **Tools**: blog-tools.ts, social-media-tools.ts, media-tools.ts
- **Estimated Tool Count**: ~30 tools
- **Features**: Blog management, Social posting, Media libraries
- **Priority**: MEDIUM (Content marketing features)

### **🔄 ghl-operations-mcp**
- **Focus**: Scheduling, Workflows, Surveys, Locations
- **Tools**: calendar-tools.ts, workflow-tools.ts, survey-tools.ts, location-tools.ts
- **Estimated Tool Count**: ~50 tools (Largest server)
- **Features**: Calendar management, Automation, Location management
- **Priority**: HIGH (Core operational features)

### **✅ ghl-ecommerce-mcp** (COMPLETED)
- **Focus**: Online Store, Product Management
- **Tools**: store-tools.ts, products-tools.ts
- **Tool Count**: 24 tools
- **URL**: https://ghl-ecommerce-mcp.fly.dev
- **Features**: Store management, Product catalogs, E-commerce operations
- **Status**: ✅ Deployed & Working

### **🔄 ghl-data-mcp**
- **Focus**: Data Objects, Associations
- **Tools**: object-tools.ts, association-tools.ts
- **Estimated Tool Count**: ~25 tools
- **Features**: Custom objects, Data relationships
- **Priority**: LOW (Advanced data features)

---

## 🚀 **Phase 1: Generate All Server Structures**

### **Step 1: Run the Split Script**
```bash
cd /Users/josephsanchez/Documents/GoHighLevel-MCP
chmod +x modular-split/split-servers.sh
./modular-split/split-servers.sh
```

This will create all 6 remaining server directories with:
- ✅ Source code structure
- ✅ Tool files copied
- ✅ package.json files
- ✅ TypeScript configs
- ✅ Server.ts files (stdio version)

---

## 🚀 **Phase 2: Add HTTP Server Support** 

### **Step 2: Create HTTP Servers for Each**

Based on our successful ghl-core-mcp HTTP implementation, each server needs:

1. **Copy http-server.ts template** from ghl-core-mcp (INCLUDES CRITICAL MCP FIXES)
2. **Update tool imports** for each server's specific tools
3. **Create Dockerfile** (copy from ghl-core-mcp)
4. **Create fly.toml** with unique app names
5. **Update package.json** with start:http script

**⚠️ CRITICAL**: The `http-server.ts` template includes essential MCP protocol fixes:
- ✅ **GET `/sse`** endpoint for SSE stream establishment
- ✅ **POST `/sse`** endpoint for JSON-RPC message handling
- ✅ **`initialize`** method support for MCP handshake
- ✅ **Proper SSE headers** and error handling

### **Template Commands for Each Server:**

```bash
# For each server directory:
cd modular-split/{SERVER_NAME}

# Copy HTTP server template
cp ../ghl-core-mcp/src/http-server.ts src/
cp ../ghl-core-mcp/Dockerfile .
cp ../ghl-core-mcp/fly.toml .

# Update fly.toml app name
sed -i '' "s/app = 'ghl-dynamic-mcp'/app = 'ghl-{SERVER_NAME}'/" fly.toml

# Update package.json start:http script
# (Already included in split script)

# Build and deploy
npm install
npm run build
fly launch --copy-config --yes
fly certs add ghl-{SERVER_NAME}.fly.dev
fly deploy --no-cache
```

---

## 🚀 **Phase 3: Deployment Priority Order**

### **Priority 1: Core Business Functions** (Deploy First)
1. **ghl-communications-mcp** - Critical for customer communication
2. **ghl-sales-mcp** - Revenue-generating features
3. **ghl-operations-mcp** - Core operational workflows

### **Priority 2: Marketing & E-commerce** (Deploy Second)  
4. **ghl-marketing-mcp** - Content and social media
5. ✅ **ghl-ecommerce-mcp** - Store and product management (DEPLOYED)

### **Priority 3: Advanced Features** (Deploy Last)
6. **ghl-data-mcp** - Advanced data management

---

## 💰 **Cost Analysis**

### **Current Setup (1 Server)**
- ghl-core-mcp: $3.88/month
- **Total**: $3.88/month

### **Full Modular Setup (7 Servers)**
- 7 servers × $3.88/month = $27.16/month
- **Cost increase**: $23.28/month for complete modularity

### **Recommended Phased Approach**
- **Phase 1**: Deploy Priority 1 servers (+$11.64/month)
- **Phase 2**: Add Priority 2 servers (+$7.76/month)  
- **Phase 3**: Add Priority 3 servers (+$3.88/month)

---

## 🔧 **Automated Deployment Scripts**

### **Quick Deploy Script**
```bash
#!/bin/bash
# quick-deploy-server.sh

SERVER_NAME=$1
if [ -z "$SERVER_NAME" ]; then
    echo "Usage: ./quick-deploy-server.sh <server-name>"
    exit 1
fi

cd "modular-split/$SERVER_NAME"

# Copy files from ghl-core-mcp template
cp ../ghl-core-mcp/src/http-server.ts src/
cp ../ghl-core-mcp/Dockerfile .
cp ../ghl-core-mcp/fly.toml .

# Update app name
sed -i '' "s/ghl-dynamic-mcp/ghl-$SERVER_NAME/" fly.toml

# Build and deploy
npm install
npm run build
fly launch --copy-config --yes
fly certs add "ghl-$SERVER_NAME.fly.dev"
fly deploy --no-cache

echo "✅ Deployed: https://ghl-$SERVER_NAME.fly.dev"
```

### **Mass Deploy Script**
```bash
#!/bin/bash
# deploy-all-servers.sh

SERVERS=("communications-mcp" "sales-mcp" "marketing-mcp" "operations-mcp" "ecommerce-mcp" "data-mcp")

for server in "${SERVERS[@]}"; do
    echo "🚀 Deploying ghl-$server..."
    ./quick-deploy-server.sh "$server"
    sleep 30  # Wait between deployments
done

echo "🎉 All servers deployed!"
```

---

## 🎯 **Next Immediate Steps**

1. **Run split-servers.sh** to generate all server structures
2. **Test ghl-communications-mcp** deployment (highest priority)
3. **Verify HTTP server works** with dynamic multi-tenant pattern
4. **Deploy remaining servers** in priority order
5. **Update Claude Desktop configs** to use multiple servers

---

## 📝 **Configuration Templates**

### **Claude Desktop Config (All Servers)**
```json
{
  "mcpServers": {
    "ghl-core": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-dynamic-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-communications": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-communications-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-sales": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-sales-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-marketing": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-marketing-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-operations": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-operations-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-ecommerce": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-ecommerce-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-data": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-data-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    }
  }
}
```

### **Fly.io Apps Overview**
```
ghl-dynamic-mcp.fly.dev          (✅ DEPLOYED)
ghl-ecommerce-mcp.fly.dev        (✅ DEPLOYED)
ghl-communications-mcp.fly.dev   (⏳ Next)
ghl-sales-mcp.fly.dev            (⏳ Next) 
ghl-marketing-mcp.fly.dev        (⏳ Next)
ghl-operations-mcp.fly.dev       (⏳ Next)
ghl-data-mcp.fly.dev             (⏳ Next)
```

---

## ✅ **Success Criteria**

Each deployed server should have:
- ✅ HTTP endpoints responding (/health, /tools, /sse, /)
- ✅ SSL certificate working
- ✅ Auto-scaling enabled
- ✅ All tools loading correctly
- ✅ Dynamic multi-tenant authentication
- ✅ Proper error handling and logging

**Goal**: Complete modular GoHighLevel MCP ecosystem with ~260 total tools across 7 specialized servers!

---

## 🛠️ **Troubleshooting Guide**

### **Common MCP Connection Issues & Solutions**

#### **❌ Issue 1: "404 Not Found - @modelcontextprotocol/client-sse"**
```
npm error 404  '@modelcontextprotocol/client-sse@*' is not in this registry.
```

**✅ Solution**: Use `mcp-remote` instead
```json
{
  "command": "npx",
  "args": ["mcp-remote", "https://your-server.fly.dev/sse"]
}
```

#### **❌ Issue 2: "Cannot POST /sse" or "Cannot POST /"**
```
Error POSTing to endpoint (HTTP 404): Cannot POST /sse
```

**✅ Solution**: Server missing POST endpoint for JSON-RPC messages. Ensure your HTTP server has:
```typescript
// GET /sse - for SSE stream
app.get('/sse', (req, res) => { /* SSE handler */ });

// POST /sse - for JSON-RPC messages  
app.post('/sse', (req, res) => { /* JSON-RPC handler */ });
```

#### **❌ Issue 3: "Method not found" for initialize**
```
{"code":-32601,"message":"Method not found"}
```

**✅ Solution**: Add `initialize` method handler:
```typescript
if (jsonrpcRequest.method === 'initialize') {
  res.json({
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'your-server', version: '1.0.0' }
    },
    id: jsonrpcRequest.id
  });
}
```

#### **❌ Issue 4: "Invalid content type, expected text/event-stream"**
```
SSE error: Invalid content type, expected "text/event-stream"
```

**✅ Solution**: Set proper SSE headers:
```typescript
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
```

#### **❌ Issue 5: "getaddrinfo ENOTFOUND your-server.fly.dev"**
```
Error: getaddrinfo ENOTFOUND ghl-core-mcp.fly.dev
```

**✅ Solution**: Server not deployed yet
```bash
# Deploy your server first
cd modular-split/ghl-core-mcp
fly deploy --no-cache

# Verify deployment
curl https://ghl-core-mcp.fly.dev/health
```

### **Testing Your Deployed Server**

#### **1. Check Server Health**
```bash
curl https://your-server.fly.dev/health
# Expected: {"status":"healthy","timestamp":"..."}
```

#### **2. Test Initialize Method**
```bash
curl -X POST https://your-server.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05"},"id":1}'
# Expected: {"jsonrpc":"2.0","result":{"protocolVersion":"2024-11-05",...},"id":1}
```

#### **3. Test Tools List**
```bash
curl -X POST https://your-server.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":2}'
# Expected: List of available tools
```

### **MCP Server Requirements Checklist**

For each deployed server, ensure:

- ✅ **HTTP Endpoints**:
  - `GET /health` - Health check
  - `GET /sse` - SSE stream establishment  
  - `POST /sse` - JSON-RPC message handling
  - `GET /tools` - Tool listing (optional)

- ✅ **JSON-RPC Methods**:
  - `initialize` - MCP handshake
  - `tools/list` - List available tools
  - `tools/call` - Execute tool calls

- ✅ **HTTP Headers**:
  - `Content-Type: text/event-stream` for SSE
  - `Cache-Control: no-cache` for SSE
  - `Connection: keep-alive` for SSE
  - CORS headers if needed

- ✅ **Error Handling**:
  - Proper JSON-RPC error responses
  - HTTP status codes (404, 500, etc.)
  - Graceful connection handling

### **Debugging Commands**

#### **Check MCP Logs in Claude Desktop**
```bash
tail -f ~/Library/Logs/Claude/mcp-server-*.log
```

#### **Monitor Server Logs on Fly.io**
```bash
fly logs --app ghl-core-mcp
```

#### **Test MCP Connection Locally**
```bash
npx mcp-remote https://your-server.fly.dev/sse
```

### **Working Example (ghl-core-mcp)**

Our successfully deployed server demonstrates:
- ✅ Proper HTTP endpoints with GET and POST `/sse`
- ✅ MCP protocol compliance with `initialize` method
- ✅ Tool registration and execution
- ✅ Dynamic multi-tenant authentication
- ✅ Error handling and logging

**URL**: https://ghl-dynamic-mcp.fly.dev
**Status**: ✅ WORKING

Use this as a template for deploying additional servers! 