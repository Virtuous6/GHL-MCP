# 🛠️ MCP Deployment & Troubleshooting Guide

**Based on Real-World Experience Deploying GoHighLevel MCP Servers**

This guide documents the exact issues we encountered and their solutions when deploying MCP servers to Fly.io and connecting them via Claude Desktop.

---

## 🎯 **Quick Start: Working Configuration**

### **✅ Proven Working Setup**

**Claude Desktop Config (`~/.claude_desktop_config.json`):**
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
    }
  }
}
```

**Server Requirements:**
- ✅ **GET `/sse`** - SSE stream endpoint
- ✅ **POST `/sse`** - JSON-RPC message endpoint
- ✅ **`initialize` method** - MCP handshake
- ✅ **Proper SSE headers** - Content-Type, Cache-Control, Connection

---

## 🚨 **Common Issues & Solutions**

### **❌ Issue 1: Wrong Package Name**

**Error:**
```
npm error 404 Not Found - GET https://registry.npmjs.org/@modelcontextprotocol%2fclient-sse
npm error 404  '@modelcontextprotocol/client-sse@*' is not in this registry.
```

**❌ Wrong Configuration:**
```json
{
  "command": "npx",
  "args": ["@modelcontextprotocol/client-sse", "https://server.fly.dev/sse"]
}
```

**✅ Correct Configuration:**
```json
{
  "command": "npx", 
  "args": ["mcp-remote", "https://server.fly.dev/sse"]
}
```

**Root Cause**: The package `@modelcontextprotocol/client-sse` **doesn't exist**. Use `mcp-remote` instead.

---

### **❌ Issue 2: Missing POST Endpoint**

**Error:**
```
Error POSTing to endpoint (HTTP 404): <!DOCTYPE html>
<html><body><pre>Cannot POST /sse</pre></body></html>
```

**Root Cause**: Server only has GET `/sse` endpoint, missing POST endpoint for JSON-RPC messages.

**✅ Required Server Code:**
```typescript
// GET /sse - for SSE stream establishment
app.get('/sse', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const transport = new SSEServerTransport('/sse', res);
  await this.server.connect(transport);
});

// POST /sse - for JSON-RPC messages (CRITICAL!)
app.post('/sse', async (req, res) => {
  const jsonrpcRequest = req.body;
  
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
  } else if (jsonrpcRequest.method === 'tools/list') {
    const response = await this.server.request(jsonrpcRequest, ListToolsRequestSchema);
    res.json(response);
  } else if (jsonrpcRequest.method === 'tools/call') {
    const response = await this.server.request(jsonrpcRequest, CallToolRequestSchema);
    res.json(response);
  } else {
    res.status(404).json({
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Method not found' },
      id: jsonrpcRequest.id || null
    });
  }
});
```

---

### **❌ Issue 3: Missing Initialize Method**

**Error:**
```
{"jsonrpc":"2.0","error":{"code":-32601,"message":"Method not found"},"id":null}
```

**Root Cause**: Server doesn't handle the `initialize` method which is **required** for MCP handshake.

**✅ Solution:**
```typescript
if (jsonrpcRequest.method === 'initialize') {
  res.json({
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'your-server-name', version: '1.0.0' }
    },
    id: jsonrpcRequest.id
  });
}
```

**MCP Protocol Flow:**
1. Client sends `initialize` request
2. Server responds with capabilities 
3. Client can then call `tools/list` and `tools/call`

---

### **❌ Issue 4: Invalid SSE Content Type**

**Error:**
```
SSE error: Invalid content type, expected "text/event-stream"
```

**✅ Required Headers:**
```typescript
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
res.setHeader('Access-Control-Allow-Origin', '*');
```

---

### **❌ Issue 5: "Not connected" Error for Tools/Call**

**Error:**
```
[HTTP] Error processing JSON-RPC message: Error: Not connected
    at file:///app/node_modules/@modelcontextprotocol/sdk/dist/shared/protocol.js:175:24
```

**Root Cause**: Server tries to use `this.server.request()` for `tools/call` method, but MCP server isn't properly connected in HTTP context.

**✅ Solution: Handle tools/call directly in POST /sse endpoint:**
```typescript
} else if (jsonrpcRequest.method === 'tools/call') {
  // Handle tool calls directly without MCP server connection
  const { name: toolName, arguments: args } = jsonrpcRequest.params;
  
  try {
    const { apiKey, locationId, userId, ...toolArgs } = args as any;
    
    if (!apiKey || !locationId) {
      throw new McpError(ErrorCode.InvalidParams, 'apiKey and locationId are required');
    }

    const userConfig: GHLConfig = {
      accessToken: apiKey,
      baseUrl: 'https://services.leadconnectorhq.com',
      locationId: locationId,
      version: '2021-07-28'
    };
    const ghlClient = new GHLApiClient(userConfig);

    const toolInstance = new YourToolClass(ghlClient);
    const result = await toolInstance.executeTool(toolName, toolArgs);
    
    res.json({
      jsonrpc: '2.0',
      result: result,
      id: jsonrpcRequest.id
    });
  } catch (error) {
    // Handle errors appropriately
  }
}
```

### **❌ Issue 6: Missing notifications/initialized Handler**

**Error:**
```
Request timed out after 60 seconds
```

**Root Cause**: Server doesn't handle `notifications/initialized` method which causes Claude to timeout.

**✅ Solution:**
```typescript
} else if (jsonrpcRequest.method === 'notifications/initialized') {
  console.log('[HTTP] MCP initialized notification received');
  res.status(200).end();
  return;
}
```

### **❌ Issue 7: Server Not Deployed**

**Error:**
```
Error: getaddrinfo ENOTFOUND ghl-core-mcp.fly.dev
```

**✅ Solution:**
```bash
# Deploy first
cd your-server-directory
fly deploy --no-cache

# Verify deployment
curl https://your-server.fly.dev/health
```

---

## 🧪 **Testing Your Deployment**

### **Step 1: Health Check**
```bash
curl https://your-server.fly.dev/health
# Expected: {"status":"healthy","timestamp":"..."}
```

### **Step 2: Test Initialize**
```bash
curl -X POST https://your-server.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0.0"}
    },
    "id": 1
  }' | jq
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "your-server",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

### **Step 3: Test Tools List**
```bash
curl -X POST https://your-server.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }' | jq
```

### **Step 4: Test MCP Connection**
```bash
# Test the full mcp-remote flow
npx mcp-remote https://your-server.fly.dev/sse
```

---

## 📋 **MCP Server Checklist**

Before deploying, ensure your server has:

### **HTTP Endpoints**
- ✅ `GET /health` - Server health check
- ✅ `GET /sse` - SSE stream establishment  
- ✅ `POST /sse` - JSON-RPC message handling
- ✅ `GET /tools` - Tool listing (optional)

### **JSON-RPC Methods**
- ✅ `initialize` - **REQUIRED** for MCP handshake
- ✅ `tools/list` - List available tools
- ✅ `tools/call` - Execute tool calls

### **HTTP Headers (SSE)**
- ✅ `Content-Type: text/event-stream`
- ✅ `Cache-Control: no-cache`
- ✅ `Connection: keep-alive`
- ✅ `Access-Control-Allow-Origin: *` (if needed)

### **Error Handling**
- ✅ Proper JSON-RPC error responses
- ✅ HTTP status codes (404, 500)
- ✅ Graceful connection handling
- ✅ Request timeout handling

---

## 🔍 **Debugging Tools**

### **Claude Desktop Logs**
```bash
# View MCP connection logs
tail -f ~/Library/Logs/Claude/mcp-server-*.log

# View main Claude logs  
tail -f ~/Library/Logs/Claude/main.log
```

### **Server Logs**
```bash
# Monitor Fly.io app logs
fly logs --app your-app-name

# Follow logs in real-time
fly logs --app your-app-name --follow
```

### **Network Testing**
```bash
# Test DNS resolution
dig your-server.fly.dev

# Test HTTP connectivity
curl -I https://your-server.fly.dev

# Test POST endpoint
curl -X POST https://your-server.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 🏗️ **Deployment Template**

### **1. Server Structure**
```
your-mcp-server/
├── src/
│   ├── server.ts          # MCP server (stdio)
│   ├── http-server.ts     # HTTP + SSE server  
│   ├── tools/             # Your tool implementations
│   └── types/             # Type definitions
├── Dockerfile             # Container definition
├── fly.toml               # Fly.io configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

### **2. Critical Files**

**package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "start:http": "node dist/http-server.js"
  }
}
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:http"]
```

**fly.toml:**
```toml
app = 'your-app-name'
primary_region = 'sjc'

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

[[vm]]
  memory = '256mb'
  cpu_kind = 'shared'
  cpus = 1
```

### **3. Deployment Commands**
```bash
# Build TypeScript
npm run build

# Deploy to Fly.io
fly deploy --no-cache

# Test deployment
curl https://your-app.fly.dev/health
```

---

## 🎯 **Working Examples**

### **ghl-core-mcp (Primary Reference)**
**Server**: https://ghl-dynamic-mcp.fly.dev  
**Status**: ✅ **WORKING**

**Features Verified:**
- ✅ MCP handshake (`initialize`)
- ✅ Tool listing (`tools/list`)  
- ✅ Tool execution (`tools/call`)
- ✅ Dynamic authentication
- ✅ Error handling
- ✅ Claude Desktop integration

### **ghl-ecommerce-mcp (Latest Deploy)**
**Server**: https://ghl-ecommerce-mcp.fly.dev  
**Status**: ✅ **WORKING**

**Recently Fixed Issues:**
- ✅ "Not connected" error for `tools/call` method
- ✅ Missing `notifications/initialized` handler
- ✅ Direct tool execution without MCP server dependency
- ✅ Proper error handling and timeout management

**Use as Reference**: Both servers demonstrate all the fixes and requirements documented in this guide.

---

## 📞 **Support**

If you encounter issues not covered here:

1. **Check logs first**: `~/Library/Logs/Claude/mcp-server-*.log`
2. **Test endpoints manually**: Use curl commands above
3. **Verify server health**: Check `/health` endpoint
4. **Compare with working example**: Use ghl-dynamic-mcp as reference

**Remember**: The fixes in this guide were discovered through real troubleshooting. Every error and solution documented here actually occurred and was resolved during deployment. 