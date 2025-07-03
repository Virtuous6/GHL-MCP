# 🚀 GoHighLevel MCP Server Deployment Template

## 📋 **Lessons Learned from ghl-communications-mcp**

### ✅ **What Worked:**
1. **Manual server structure creation** (bash script had macOS compatibility issues)
2. **Static tool definitions** to avoid API credential dependency during tool listing
3. **Direct tools endpoint** instead of querying disconnected MCP server
4. **Dynamic multi-tenant HTTP architecture** with per-request API keys
5. **Standard fly.io deployment** with unique app names

### ❌ **Key Issues We Solved:**
- **Tool listing failures** due to requiring GHL API credentials
- **MCP server connection errors** when tools endpoint tried to query disconnected server
- **TypeScript compilation issues** with import paths and method signatures
- **"Not connected" errors** when POST /sse handler tried to use disconnected MCP server for tools/call
- **Missing notifications/initialized handler** causing connection timeouts

---

## 🛠️ **Step-by-Step Deployment Process**

### **Step 1: Server Structure Setup**

```bash
# Create directory structure
mkdir -p ghl-{SERVER_NAME}/src/{tools,types,clients}

# Copy shared files
cp ../src/types/ghl-types.ts ghl-{SERVER_NAME}/src/types/
cp ../src/clients/ghl-api-client.ts ghl-{SERVER_NAME}/src/clients/

# Copy specific tool files for this server
cp ../src/tools/{TOOL_FILES} ghl-{SERVER_NAME}/src/tools/
```

### **Step 2: Create Core Files**

#### **A. package.json**
```json
{
  "name": "ghl-{SERVER_NAME}",
  "version": "1.0.0", 
  "description": "GoHighLevel {DESCRIPTION} MCP Server",
  "main": "dist/server.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js", 
    "start:http": "node dist/http-server.js",
    "dev": "tsc && node dist/server.js",
    "dev:http": "tsc && node dist/http-server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0",
    "cors": "^2.8.5", 
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21", 
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

#### **B. tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext", 
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "lib": ["ES2022"]
  }
}
```

### **Step 3: Critical - Add Static Tool Methods**

**🔥 IMPORTANT**: Add static methods to ALL tool classes to avoid API dependency:

```typescript
// In each tool class (e.g., SalesTools, MarketingTools, etc.)
export class {ToolClass} {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return {ToolClass}.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return {ToolClass}.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      // ... existing tool definitions
    ];
  }
}
```

### **Step 4: Create server.ts**

```typescript
/**
 * ghl-{SERVER_NAME} MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
// Import your specific tool classes
import { {ToolClass1} } from './tools/{tool-file-1}.js';
import { {ToolClass2} } from './tools/{tool-file-2}.js';

dotenv.config();

class Ghl{ServerName}Server {
  private server: Server;
  private ghlClient!: GHLApiClient;
  private {toolInstance1}!: {ToolClass1};
  private {toolInstance2}!: {ToolClass2};

  constructor() {
    this.server = new Server(
      { name: 'ghl-{SERVER_NAME}', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupServer();
  }

  private setupServer(): void {
    const config: GHLConfig = {
      accessToken: process.env.GHL_API_KEY || '',
      baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
      version: '2021-07-28',
      locationId: process.env.GHL_LOCATION_ID || ''
    };

    this.ghlClient = new GHLApiClient(config);
    this.{toolInstance1} = new {ToolClass1}(this.ghlClient);
    this.{toolInstance2} = new {ToolClass2}(this.ghlClient);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const allTools = [
          ...this.{toolInstance1}.getToolDefinitions(),
          ...this.{toolInstance2}.getToolDefinitions(),
        ];
        
        process.stderr.write(`[ghl-{SERVER_NAME}] Registered ${allTools.length} tools\n`);
        return { tools: allTools };
      } catch (error) {
        process.stderr.write(`[ghl-{SERVER_NAME}] Error listing tools: ${error}\n`);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(`[ghl-{SERVER_NAME}] Executing tool: ${toolName}\n`);
        
        const {toolInstance1}Names = this.{toolInstance1}.getToolDefinitions().map(tool => tool.name);
        const {toolInstance2}Names = this.{toolInstance2}.getToolDefinitions().map(tool => tool.name);
        
        if ({toolInstance1}Names.includes(toolName)) {
          return await this.{toolInstance1}.executeTool(toolName, args);
        } else if ({toolInstance2}Names.includes(toolName)) {
          return await this.{toolInstance2}.executeTool(toolName, args);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        process.stderr.write(`[ghl-{SERVER_NAME}] Error executing tool ${toolName}: ${error}\n`);
        throw error;
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write('ghl-{SERVER_NAME} MCP Server running on stdio\n');
  }
}

async function main(): Promise<void> {
  const server = new Ghl{ServerName}Server();
  await server.start();
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
```

### **Step 5: Create http-server.ts**

```typescript
/**
 * GoHighLevel {SERVER_NAME} MCP HTTP Server
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { {ToolClass1} } from './tools/{tool-file-1}.js';
import { {ToolClass2} } from './tools/{tool-file-2}.js';
import { GHLConfig } from './types/ghl-types.js';

class Ghl{ServerName}HttpServer {
  private app: express.Application;
  private server: Server;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '8080');
    this.app = express();
    this.setupExpress();

    this.server = new Server(
      { name: 'ghl-{SERVER_NAME}-http', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    this.setupMCPHandlers();
    this.setupRoutes();
  }

  private setupExpress(): void {
    this.app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], credentials: true }));
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`[HTTP] ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  private setupMCPHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const allTools = [
          ...{ToolClass1}.getStaticToolDefinitions(),
          ...{ToolClass2}.getStaticToolDefinitions()
        ];
        
        const enhancedTools = allTools.map(tool => ({
          ...tool,
          inputSchema: {
            ...tool.inputSchema,
            properties: {
              apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
              locationId: { type: 'string', description: 'GoHighLevel Location ID' },
              userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
              ...tool.inputSchema.properties
            },
            required: ['apiKey', 'locationId'].concat(Array.isArray(tool.inputSchema.required) ? tool.inputSchema.required : [])
          }
        }));
        
        console.log(`[HTTP] Listed ${enhancedTools.length} {SERVER_NAME} tools`);
        return { tools: enhancedTools };
      } catch (error) {
        console.error(`[HTTP] Error listing tools:`, error);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        const { apiKey, locationId, userId, ...toolArgs } = args as any;
        
        if (!apiKey || !locationId) {
          throw new McpError(ErrorCode.InvalidParams, 'apiKey and locationId are required for all tools');
        }

        const userConfig: GHLConfig = {
          accessToken: apiKey,
          baseUrl: 'https://services.leadconnectorhq.com',
          locationId: locationId,
          version: '2021-07-28'
        };
        const ghlClient = new GHLApiClient(userConfig);

        console.log(`[${new Date().toISOString()}] User: ${userId || 'anonymous'} | Tool: ${toolName}`);

        const {toolInstance1} = new {ToolClass1}(ghlClient);
        const {toolInstance2} = new {ToolClass2}(ghlClient);

        const {toolInstance1}Names = {toolInstance1}.getToolDefinitions().map(tool => tool.name);
        const {toolInstance2}Names = {toolInstance2}.getToolDefinitions().map(tool => tool.name);
        
        if ({toolInstance1}Names.includes(toolName)) {
          return await {toolInstance1}.executeTool(toolName, toolArgs);
        } else if ({toolInstance2}Names.includes(toolName)) {
          return await {toolInstance2}.executeTool(toolName, toolArgs);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        if (error instanceof McpError) throw error;
        if (error instanceof Error && error.message.includes('401')) {
          throw new McpError(ErrorCode.InvalidParams, 'Invalid API key or insufficient permissions. Please check your GoHighLevel API key.');
        }
        throw new McpError(ErrorCode.InternalError, `Failed to execute tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'ghl-{SERVER_NAME}',
        version: '1.0.0',
        focus: '{FOCUS_DESCRIPTION}'
      });
    });

    this.app.get('/sse', async (req, res) => {
      console.log('[HTTP] New SSE connection');
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      const transport = new SSEServerTransport('/sse', res);
      try {
        await this.server.connect(transport);
        console.log('[HTTP] MCP server connected via SSE');
      } catch (error) {
        console.error('[HTTP] SSE connection error:', error);
        res.status(500).end();
      }
    });

    // ⚠️ CRITICAL: POST /sse endpoint for JSON-RPC messages
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
              serverInfo: { name: 'ghl-{SERVER_NAME}-mcp-dynamic', version: '1.0.0' }
            },
            id: jsonrpcRequest.id
          });
        } else if (jsonrpcRequest.method === 'notifications/initialized') {
          console.log('[HTTP] MCP initialized notification received');
          res.status(200).end();
          return;
        } else if (jsonrpcRequest.method === 'tools/list') {
          const allTools = [
            ...{ToolClass1}.getStaticToolDefinitions(),
            ...{ToolClass2}.getStaticToolDefinitions()
          ];
          
          const enhancedTools = allTools.map(tool => ({
            ...tool,
            inputSchema: {
              ...tool.inputSchema,
              properties: {
                apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
                locationId: { type: 'string', description: 'GoHighLevel Location ID' },
                userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
                ...tool.inputSchema.properties
              },
              required: ['apiKey', 'locationId'].concat(Array.isArray(tool.inputSchema.required) ? tool.inputSchema.required : [])
            }
          }));
          
          res.json({
            jsonrpc: '2.0',
            result: { tools: enhancedTools },
            id: jsonrpcRequest.id
          });
        } else if (jsonrpcRequest.method === 'tools/call') {
          // Handle tool calls directly without MCP server connection
          const { name: toolName, arguments: args } = jsonrpcRequest.params;
          
          try {
            const { apiKey, locationId, userId, ...toolArgs } = args as any;
            
            if (!apiKey || !locationId) {
              throw new McpError(ErrorCode.InvalidParams, 'apiKey and locationId are required for all tools');
            }

            const userConfig: GHLConfig = {
              accessToken: apiKey,
              baseUrl: 'https://services.leadconnectorhq.com',
              locationId: locationId,
              version: '2021-07-28'
            };
            const ghlClient = new GHLApiClient(userConfig);

            console.log(`[${new Date().toISOString()}] User: ${userId || 'anonymous'} | Tool: ${toolName}`);

            const {toolInstance1} = new {ToolClass1}(ghlClient);
            const {toolInstance2} = new {ToolClass2}(ghlClient);

            const {toolInstance1}Names = {toolInstance1}.getToolDefinitions().map(tool => tool.name);
            const {toolInstance2}Names = {toolInstance2}.getToolDefinitions().map(tool => tool.name);
            
            let result;
            if ({toolInstance1}Names.includes(toolName)) {
              result = await {toolInstance1}.executeTool(toolName, toolArgs);
            } else if ({toolInstance2}Names.includes(toolName)) {
              result = await {toolInstance2}.executeTool(toolName, toolArgs);
            } else {
              throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
            }
            
            res.json({
              jsonrpc: '2.0',
              result: result,
              id: jsonrpcRequest.id
            });
          } catch (error) {
            console.error(`[HTTP] Error executing tool ${toolName}:`, error);
            let errorCode = -32603;
            let errorMessage = 'Internal error';
            
            if (error instanceof McpError) {
              errorCode = error.code === ErrorCode.InvalidParams ? -32602 : 
                         error.code === ErrorCode.MethodNotFound ? -32601 : -32603;
              errorMessage = error.message;
            } else if (error instanceof Error && error.message.includes('401')) {
              errorCode = -32602;
              errorMessage = 'Invalid API key or insufficient permissions. Please check your GoHighLevel API key.';
            } else {
              errorMessage = error instanceof Error ? error.message : 'Unknown error';
            }
            
            res.json({
              jsonrpc: '2.0',
              error: { code: errorCode, message: errorMessage },
              id: jsonrpcRequest.id
            });
          }
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

    this.app.get('/tools', async (req, res) => {
      try {
        const allTools = [
          ...{ToolClass1}.getStaticToolDefinitions(),
          ...{ToolClass2}.getStaticToolDefinitions()
        ];
        
        const enhancedTools = allTools.map(tool => ({
          ...tool,
          inputSchema: {
            ...tool.inputSchema,
            properties: {
              apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
              locationId: { type: 'string', description: 'GoHighLevel Location ID' },
              userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
              ...tool.inputSchema.properties
            },
            required: ['apiKey', 'locationId'].concat(Array.isArray(tool.inputSchema.required) ? tool.inputSchema.required : [])
          }
        }));
        
        res.json({
          service: 'ghl-{SERVER_NAME}',
          focus: '{FOCUS_DESCRIPTION}',
          toolCount: enhancedTools.length,
          tools: enhancedTools.map((tool: any) => ({
            name: tool.name,
            description: tool.description
          }))
        });
      } catch (error) {
        console.error('[HTTP] Error listing tools:', error);
        res.status(500).json({ error: 'Failed to list tools' });
      }
    });

    this.app.get('/', (req, res) => {
      res.json({
        service: 'GoHighLevel {SERVER_DISPLAY_NAME} MCP Server',
        version: '1.0.0',
        mode: 'Dynamic Multi-Tenant HTTP',
        focus: '{FOCUS_DESCRIPTION}',
        endpoints: { health: '/health', sse: '/sse', tools: '/tools' },
        description: 'Specialized GoHighLevel MCP server for {FOCUS_DESCRIPTION}'
      });
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, '0.0.0.0', () => {
        console.log(`[HTTP] GoHighLevel {SERVER_DISPLAY_NAME} MCP server running on port ${this.port}`);
        console.log(`[HTTP] Health check: http://localhost:${this.port}/health`);
        console.log(`[HTTP] SSE endpoint: http://localhost:${this.port}/sse`);
        console.log(`[HTTP] Tools info: http://localhost:${this.port}/tools`);
        console.log(`[HTTP] GoHighLevel {SERVER_DISPLAY_NAME} MCP server is ready for connections`);
        resolve();
      });
    });
  }
}

function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    console.log(`[HTTP] Received ${signal}, shutting down gracefully...`);
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

async function main(): Promise<void> {
  try {
    setupGracefulShutdown();
    const server = new Ghl{ServerName}HttpServer();
    await server.start();
  } catch (error) {
    console.error('[HTTP] Failed to start server:', error);
    process.exit(1);
  }
}

main();
```

### **Step 6: Copy Deployment Files**

```bash
# Copy from successful ghl-communications-mcp
cp ../ghl-communications-mcp/Dockerfile .
cp ../ghl-communications-mcp/fly.toml .

# Update app name in fly.toml
sed -i '' "s/app = 'ghl-communications-mcp'/app = 'ghl-{SERVER_NAME}'/" fly.toml
```

### **Step 7: Build and Deploy**

```bash
# Install dependencies and build
npm install
npm run build

# Deploy to fly.io
fly launch --copy-config --yes --now
fly certs add ghl-{SERVER_NAME}.fly.dev
fly deploy --no-cache
```

### **Step 8: Test Deployment**

```bash
# Test all endpoints
curl -s https://ghl-{SERVER_NAME}.fly.dev/health | jq '.status'
curl -s https://ghl-{SERVER_NAME}.fly.dev/ | jq '.service'  
curl -s https://ghl-{SERVER_NAME}.fly.dev/tools | jq '.toolCount'
```

---

## 📊 **Server Mapping Reference**

| Server | Tools | Expected Count |
|--------|-------|----------------|
| **ghl-communications-mcp** | conversation-tools, email-tools | ✅ 25 |
| **ghl-ecommerce-mcp** | store-tools, products-tools | ✅ 24 (DEPLOYED & WORKING) |
| **ghl-sales-mcp** | opportunity-tools, payments-tools, invoices-tools | ~45 |
| **ghl-marketing-mcp** | blog-tools, social-media-tools, media-tools | ~30 |
| **ghl-operations-mcp** | calendar-tools, workflow-tools, survey-tools, location-tools | ~50 |
| **ghl-data-mcp** | object-tools, association-tools | ~25 |

---

## 🎯 **Next Deployment Priority:**

1. **ghl-sales-mcp** (Revenue-generating tools)
2. **ghl-operations-mcp** (Core business operations)  
3. **ghl-marketing-mcp** (Content & social)
4. **ghl-ecommerce-mcp** (Store management)
5. **ghl-data-mcp** (Advanced data features)

This template captures all our lessons learned and provides a repeatable process for deploying the remaining servers! 🚀 