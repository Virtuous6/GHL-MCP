# GoHighLevel MCP Server Fix Template

## Overview
This template documents the standard fixes needed to make GoHighLevel MCP servers work correctly with Claude Desktop. These fixes address ES module configuration, response formatting, and HTTP server implementation issues.

## Problem Summary
- **Error**: `ClaudeAiToolResultRequest.content.0.text.text: Field required`
- **Error**: `SseError: SSE error: Non-200 status code (502)` + `Method not found` when connecting via Claude Desktop
- **Root Causes**:
  1. Missing `"type": "module"` in package.json (ES module configuration)
  2. Tools returning raw data instead of MCP-formatted responses
  3. HTTP servers trying to use `server.request()` causing "Not connected" errors
  4. Missing handlers for MCP notification methods (e.g., `notifications/initialized`)

## Required Changes Checklist

### 1. Package.json Configuration
**File**: `package.json`
```json
{
  "name": "@ghl/[module-name]-mcp",
  "type": "module",  // ← CRITICAL: Add this line
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx src/server.ts"
  }
}
```

### 2. Server.ts Updates
**File**: `src/server.ts`
```typescript
// Change start() method to run()
async run(): Promise<void> {
  const transport = new StdioServerTransport();
  await this.server.connect(transport);
  console.log('Dynamic GoHighLevel [Module] MCP server running on stdio');
}

// Update the main execution block
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DynamicGoHighLevelServer();
  server.run().catch(console.error);
}
```

### 3. Tool Response Formatting
**File**: `src/tools/[tool-name]-tools.ts`

#### Option A: Add formatResponse() method
```typescript
export class [ToolName]Tools {
  // Add this method to the class
  private formatResponse(data: any): any {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }]
    };
  }

  // Update all tool methods to use formatResponse
  async someToolMethod(params: any): Promise<any> {
    try {
      const result = await this.apiClient.makeRequest(...);
      return this.formatResponse(result);  // ← Wrap the response
    } catch (error) {
      return this.formatResponse({
        error: error.message || 'An error occurred'
      });
    }
  }
}
```

#### Option B: Return formatted responses directly (like ecommerce server)
```typescript
async someToolMethod(params: any): Promise<any> {
  try {
    const result = await this.apiClient.makeRequest(...);
    return {
      content: [{
        type: 'text',
        text: `Successfully completed action. Result: ${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message || 'An error occurred'}`
      }]
    };
  }
}
```

### 4. HTTP Server Implementation
**File**: `src/http-server.ts`

#### Add Middleware for Header Extraction
```typescript
private setupMiddleware(): void {
  this.app.use(cors());
  this.app.use(express.json());
  
  // Middleware to log requests
  this.app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
  
  // Extract GHL credentials from headers if present
  this.app.use((req, res, next) => {
    const apiKeyHeader = req.headers['x-ghl-api-key'] as string;
    const locationIdHeader = req.headers['x-ghl-location-id'] as string;
    
    // Set environment variables for this request context
    if (apiKeyHeader) {
      process.env.GHL_API_KEY = apiKeyHeader;
    }
    if (locationIdHeader) {
      process.env.GHL_LOCATION_ID = locationIdHeader;
    }
    
    console.log(`[HTTP] Credentials available - API Key: ${!!apiKeyHeader}, Location ID: ${!!locationIdHeader}`);
    next();
  });
}
```

#### Handle MCP Protocol Methods Including Notifications
```typescript
// Handle POST requests to SSE endpoint for JSON-RPC messages
this.app.post('/sse', async (req, res) => {
  console.log('[HTTP] Received JSON-RPC message:', req.body);
  
  try {
    const jsonrpcRequest = req.body;
    
    if (jsonrpcRequest.method === 'initialize') {
      res.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'ghl-[module]-mcp',
            version: '1.0.0'
          }
        },
        id: jsonrpcRequest.id
      });
    } else if (jsonrpcRequest.method === 'notifications/initialized') {
      // CRITICAL: Handle initialized notification
      console.log('[HTTP] MCP initialized notification received');
      res.status(200).end();
      return;
    } else if (jsonrpcRequest.method === 'notifications/cancelled') {
      // CRITICAL: Handle cancelled notification
      console.log('[HTTP] MCP cancelled notification received');
      res.status(200).end();
      return;
    } else if (jsonrpcRequest.method === 'tools/list') {
      const tools = this.getToolsDirectly();
      res.json({
        jsonrpc: '2.0',
        result: { tools },
        id: jsonrpcRequest.id
      });
    } else if (jsonrpcRequest.method === 'tools/call') {
      const toolName = jsonrpcRequest.params.name;
      const toolParams = jsonrpcRequest.params.arguments || {};
      
      // Add headers from request
      if (req.headers['x-ghl-api-key']) {
        toolParams.apiKey = req.headers['x-ghl-api-key'];
      }
      if (req.headers['x-ghl-location-id']) {
        toolParams.locationId = req.headers['x-ghl-location-id'];
      }
      
      const result = await this.executeToolDirectly(toolName, toolParams);
      
      // Ensure response is wrapped in MCP format
      const formattedResult = result.content ? result : {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
      
      res.json({
        jsonrpc: '2.0',
        result: formattedResult,
        id: jsonrpcRequest.id
      });
    } else {
      res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
        id: jsonrpcRequest.id || null
      });
    }
  } catch (error) {
    console.error('[HTTP] Error processing JSON-RPC message:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' },
      id: req.body.id || null
    });
  }
});
```

Remove any `setupMCPHandlers()` method and handle requests directly:

```typescript
// Handle JSON-RPC requests (Alternative implementation for non-SSE endpoints)
app.post('/', async (req, res) => {
  const jsonrpcRequest = req.body;
  
  try {
    if (jsonrpcRequest.method === 'tools/list') {
      // Get tools directly without server.request()
      const tools = this.getToolsDirectly();
      res.json({
        jsonrpc: '2.0',
        result: { tools },
        id: jsonrpcRequest.id
      });
    } else if (jsonrpcRequest.method === 'tools/call') {
      // Execute tool directly
      const toolName = jsonrpcRequest.params.name;
      const toolParams = jsonrpcRequest.params.arguments || {};
      
      // Add headers from request
      if (req.headers['x-ghl-api-key']) {
        toolParams.apiKey = req.headers['x-ghl-api-key'];
      }
      if (req.headers['x-ghl-location-id']) {
        toolParams.locationId = req.headers['x-ghl-location-id'];
      }
      
      const result = await this.executeToolDirectly(toolName, toolParams);
      
      // Ensure response is wrapped in MCP format
      const formattedResult = result.content ? result : {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
      
      res.json({
        jsonrpc: '2.0',
        result: formattedResult,
        id: jsonrpcRequest.id
      });
    } else {
      res.status(404).json({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found'
        },
        id: jsonrpcRequest.id
      });
    }
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error.message || 'Internal error'
      },
      id: jsonrpcRequest.id
    });
  }
});

// Helper methods
private getToolsDirectly(): any[] {
  // Return tool definitions directly
  return Object.values(this.toolsMap).map(tool => tool.definition);
}

private async executeToolDirectly(name: string, args: any): Promise<any> {
  const tool = this.toolsMap[name];
  if (!tool) {
    throw new Error(`Tool ${name} not found`);
  }
  return await tool.handler(args);
}
```

## Testing Checklist

1. **Build the server**: `npm run build`
2. **Test with Claude Desktop**:
   - Update `claude_desktop_config.json` with server URL
   - Add required headers: `X-GHL-API-Key` and `X-GHL-Location-ID`
   - Test a simple tool call

3. **Test SSE endpoint directly**:
   ```bash
   # Test initialize method
   curl -X POST https://your-server.fly.dev/sse \
     -H "Content-Type: application/json" \
     -H "X-GHL-API-Key: your-key" \
     -H "X-GHL-Location-ID: your-location" \
     -d '{"jsonrpc": "2.0", "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "0.1.0"}}, "id": 1}'
   
   # Test tools/list method
   curl -X POST https://your-server.fly.dev/sse \
     -H "Content-Type: application/json" \
     -H "X-GHL-API-Key: your-key" \
     -H "X-GHL-Location-ID: your-location" \
     -d '{"jsonrpc": "2.0", "method": "tools/list", "params": {}, "id": 2}'
   ```

4. **Expected successful response format**:
   ```json
   {
     "content": [{
       "type": "text",
       "text": "response data here"
     }]
   }
   ```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| `Cannot use import statement outside a module` | Add `"type": "module"` to package.json |
| `ClaudeAiToolResultRequest.content.0.text.text: Field required` | Ensure all tools return MCP-formatted responses |
| `Error: Not connected` in HTTP mode | Don't use `server.request()`, handle requests directly |
| Tools not appearing in Claude | Check that `tools/list` returns proper tool definitions |
| `502 Bad Gateway` + `Method not found` errors | Add handlers for MCP notification methods (`notifications/initialized`, `notifications/cancelled`) |
| Headers not reaching server | Add middleware to extract `X-GHL-API-Key` and `X-GHL-Location-ID` headers |

## Deployment Steps

1. Apply all fixes above
2. Test locally with `npm run dev`
3. Build: `npm run build`
4. Deploy to Fly.io: `fly deploy`
5. Update Claude Desktop config with deployed URL

## Servers Status

| Server | Status | Notes |
|--------|--------|-------|
| ghl-ecommerce-mcp | ✅ Working | Already had correct format |
| ghl-core-mcp | ✅ Fixed | Applied all changes |
| ghl-data-mcp | ✅ Fixed | Fixed HTTP handling |
| ghl-communications-mcp | ✅ Fixed | Applied all changes |
| ghl-marketing-mcp | ✅ Fixed | Added notification handlers + middleware |
| ghl-operations-mcp | ✅ Fixed | Applied all changes |
| ghl-sales-mcp | ❌ Needs fix | Apply this template | 