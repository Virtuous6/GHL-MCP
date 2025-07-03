/**
 * GoHighLevel Data MCP HTTP Server
 * Dynamic multi-tenant HTTP version for web deployment
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { ObjectTools } from './tools/object-tools.js';
import { AssociationTools } from './tools/association-tools.js';

class DynamicMultiTenantDataHttpServer {
  private app: express.Application;
  private server: Server;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '8080');
    
    // Initialize Express app
    this.app = express();
    this.setupExpress();

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'ghl-data-mcp-dynamic-http',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupMCPHandlers();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware and configuration
   */
  private setupExpress(): void {
    // Enable CORS
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true
    }));

    // Parse JSON requests
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`[HTTP] ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  /**
   * Setup MCP request handlers
   */
  private setupMCPHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Get tool definitions from the static tool classes and add dynamic credentials
      const objectToolDefs = ObjectTools.getStaticToolDefinitions();
      const associationToolDefs = AssociationTools.getStaticToolDefinitions();
      
      // Add dynamic credentials to each tool
      const enhancedTools = [...objectToolDefs, ...associationToolDefs].map(tool => ({
        ...tool,
        inputSchema: {
          ...tool.inputSchema,
          properties: {
            // Required credentials
            apiKey: {
              type: 'string',
              description: 'GoHighLevel Private Integration API key (pk_live_...)',
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel Location ID (optional, uses default if not provided)',
            },
            // Optional user identifier
            userId: {
              type: 'string',
              description: 'User identifier for tracking/logging (optional)',
            },
            // Original tool properties
            ...tool.inputSchema.properties
          },
          required: ['apiKey', ...((tool.inputSchema.required as string[]) || [])]
        }
      }));

      return { tools: enhancedTools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;

      if (!args) {
        throw new McpError(ErrorCode.InvalidParams, 'Arguments are required');
      }

      // Extract required credentials
      const apiKey = args.apiKey as string;
      const locationId = args.locationId as string;
      const userId = (args.userId as string) || 'anonymous';
      
      if (!apiKey) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'apiKey is required. Please provide your GoHighLevel Private Integration API key.'
        );
      }

      try {
        // Create API client with provided credentials
        const ghlClient = new GHLApiClient({
          accessToken: apiKey,
          baseUrl: 'https://services.leadconnectorhq.com',
          locationId: locationId || '',
          version: '2021-07-28'
        });

        // Log the request (optional, for debugging)
        console.log(`[${new Date().toISOString()}] User: ${userId} | Tool: ${toolName}`);

        // Initialize tool handlers with the dynamic client
        const objectTools = new ObjectTools(ghlClient);
        const associationTools = new AssociationTools(ghlClient);

        // Get tool names for routing
        const objectToolNames = ObjectTools.getStaticToolDefinitions().map(tool => tool.name);
        const associationToolNames = AssociationTools.getStaticToolDefinitions().map(tool => tool.name);
        
        // Route to appropriate tool handler
        if (objectToolNames.includes(toolName)) {
          return await objectTools.executeTool(toolName, args);
        } else if (associationToolNames.includes(toolName)) {
          return await associationTools.executeTool(toolName, args);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${toolName} for user ${userId}:`, error);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        // Handle authentication errors specifically
        if (error instanceof Error && error.message.includes('401')) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid API key or insufficient permissions. Please check your GoHighLevel Private Integration API key and scopes.'
          );
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to execute tool: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ghl-data-mcp-dynamic'
      });
    });

    // MCP SSE endpoint - POST for JSON-RPC messages
    this.app.post('/sse', async (req, res) => {
      console.log('[HTTP] Received JSON-RPC message:', req.body);
      
      try {
        // Handle JSON-RPC messages directly
        const jsonrpcRequest = req.body;
        
        if (jsonrpcRequest.method === 'initialize') {
          // Handle MCP initialization
          res.json({
            jsonrpc: '2.0',
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'ghl-data-mcp-dynamic',
                version: '1.0.0'
              }
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
            error: {
              code: -32601,
              message: 'Method not found'
            },
            id: jsonrpcRequest.id || null
          });
        }
      } catch (error) {
        console.error('[HTTP] Error processing JSON-RPC message:', error);
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal error'
          },
          id: req.body.id || null
        });
      }
    });

    // Tools info endpoint
    this.app.get('/tools', async (req, res) => {
      try {
        const toolsResponse = await this.server.request(
          { method: 'tools/list', params: {} },
          ListToolsRequestSchema
        );
        const tools = (toolsResponse as any).tools || [];
        res.json({
          service: 'ghl-data-mcp-dynamic',
          toolCount: tools.length,
          tools: tools.map((tool: any) => ({
            name: tool.name,
            description: tool.description
          }))
        });
      } catch (error) {
        console.error('[HTTP] Error listing tools:', error);
        res.status(500).json({ error: 'Failed to list tools' });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'GoHighLevel Data MCP Server',
        version: '1.0.0',
        mode: 'Dynamic Multi-Tenant HTTP',
        endpoints: {
          health: '/health',
          sse: '/sse',
          tools: '/tools'
        },
        description: 'Dynamic multi-tenant GoHighLevel Data MCP server with Object and Association management tools'
      });
    });
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`[HTTP] GoHighLevel Data MCP Server running on 0.0.0.0:${this.port}`);
      console.log(`[HTTP] Health check: http://localhost:${this.port}/health`);
      console.log(`[HTTP] Tools info: http://localhost:${this.port}/tools`);
      console.log(`[HTTP] MCP endpoint: http://localhost:${this.port}/sse`);
    });
  }
}

// Start the server
async function main(): Promise<void> {
  const server = new DynamicMultiTenantDataHttpServer();
  await server.start();
}

main().catch((error) => {
  console.error('HTTP Server failed to start:', error);
  process.exit(1);
});

export default DynamicMultiTenantDataHttpServer; 