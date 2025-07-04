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
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-GHL-API-Key', 'X-GHL-Location-ID'],
      credentials: true
    }));

    // Parse JSON requests
    this.app.use(express.json());

    // Request logging
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
        } else if (jsonrpcRequest.method === 'notifications/initialized') {
          console.log('[HTTP] MCP initialized notification received');
          res.status(200).end();
          return;
        } else if (jsonrpcRequest.method === 'notifications/cancelled') {
          console.log('[HTTP] MCP cancelled notification received');
          res.status(200).end();
          return;
        } else if (jsonrpcRequest.method === 'tools/list') {
          // Get tools directly without using server.request
          const tools = this.getToolsDirectly();
          res.json({
            jsonrpc: '2.0',
            result: { tools },
            id: jsonrpcRequest.id
          });
        } else if (jsonrpcRequest.method === 'tools/call') {
          // Handle tool calls directly without using server.request
          try {
            const { name: toolName, arguments: args } = jsonrpcRequest.params;
            
            if (!args) {
              throw new McpError(ErrorCode.InvalidParams, 'Arguments are required');
            }

            // Extract required credentials - fall back to environment variables from headers
            let apiKey = args.apiKey as string;
            let locationId = args.locationId as string;
            const userId = (args.userId as string) || 'anonymous';
            
            // Fall back to environment variables if not provided in args
            if (!apiKey) {
              apiKey = process.env.GHL_API_KEY || '';
            }
            if (!locationId) {
              locationId = process.env.GHL_LOCATION_ID || '';
            }
            
            if (!apiKey) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'apiKey is required. Please provide your GoHighLevel Private Integration API key.'
              );
            }

            // Create API client with provided credentials
            const ghlClient = new GHLApiClient({
              accessToken: apiKey,
              baseUrl: 'https://services.leadconnectorhq.com',
              locationId: locationId || '',
              version: '2021-07-28'
            });

            // Log the request
            console.log(`[${new Date().toISOString()}] User: ${userId} | Tool: ${toolName}`);

            // Initialize tool handlers with the dynamic client
            const objectTools = new ObjectTools(ghlClient);
            const associationTools = new AssociationTools(ghlClient);

            // Get tool names for routing
            const objectToolNames = ObjectTools.getStaticToolDefinitions().map(tool => tool.name);
            const associationToolNames = AssociationTools.getStaticToolDefinitions().map(tool => tool.name);
            
            let result;
            
            // Route to appropriate tool handler
            if (objectToolNames.includes(toolName)) {
              result = await objectTools.executeTool(toolName, args);
            } else if (associationToolNames.includes(toolName)) {
              result = await associationTools.executeTool(toolName, args);
            } else {
              throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
            }
            
            // Return the result in JSON-RPC format
            res.json({
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }]
              },
              id: jsonrpcRequest.id
            });
          } catch (error) {
            console.error('[HTTP] Error executing tool:', error);
            
            let errorCode = -32603;
            let errorMessage = 'Internal error';
            
            if (error instanceof McpError) {
              errorCode = error.code;
              errorMessage = error.message;
            } else if (error instanceof Error) {
              errorMessage = error.message;
              if (error.message.includes('401')) {
                errorCode = ErrorCode.InvalidParams;
                errorMessage = 'Invalid API key or insufficient permissions';
              }
            }
            
            res.json({
              jsonrpc: '2.0',
              error: {
                code: errorCode,
                message: errorMessage
              },
              id: jsonrpcRequest.id
            });
          }
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
   * Get tools directly without MCP server (fallback method)
   */
  private getToolsDirectly() {
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

    return enhancedTools;
  }

  /**
   * Start the HTTP server
   */
  async run(): Promise<void> {
    this.app.listen(this.port, () => {
      console.log(`[HTTP] GoHighLevel Data MCP Server running on port ${this.port}`);
      console.log(`[HTTP] Health check: http://localhost:${this.port}/health`);
      console.log(`[HTTP] Tools info: http://localhost:${this.port}/tools`);
      console.log(`[HTTP] MCP endpoint: http://localhost:${this.port}/sse`);
    });
  }
}

// Start the server
async function main(): Promise<void> {
  const server = new DynamicMultiTenantDataHttpServer();
  await server.run();
}

main().catch((error) => {
  console.error('HTTP Server failed to start:', error);
  process.exit(1);
});

export default DynamicMultiTenantDataHttpServer; 