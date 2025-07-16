/**
 * GoHighLevel Core MCP HTTP Server
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
import { ConversationTools } from './tools/conversation-tools.js';
import { EmailTools } from './tools/email-tools.js';

class DynamicMultiTenantHttpServer {
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
        name: 'ghl-communications-mcp-http',
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
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-GHL-API-Key', 'X-GHL-Location-ID'],
      credentials: true
    }));

    // Parse JSON requests
    this.app.use(express.json());

    // Extract MCP remote headers and set as environment variables
    this.app.use((req, res, next) => {
      // Extract GHL credentials from headers if present
      const apiKeyHeader = req.headers['x-ghl-api-key'] as string;
      const locationIdHeader = req.headers['x-ghl-location-id'] as string;
      
      // Set environment variables for this request context
      if (apiKeyHeader) {
        process.env.GHL_API_KEY = apiKeyHeader;
      }
      if (locationIdHeader) {
        process.env.GHL_LOCATION_ID = locationIdHeader;
      }
      
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`[HTTP] ${req.method} ${req.path} - ${new Date().toISOString()}`);
      const hasApiKey = !!(req.headers['x-ghl-api-key'] || process.env.GHL_API_KEY);
      const hasLocationId = !!(req.headers['x-ghl-location-id'] || process.env.GHL_LOCATION_ID);
      console.log(`[HTTP] Credentials available - API Key: ${hasApiKey}, Location ID: ${hasLocationId}`);
      next();
    });
  }

  /**
   * Setup MCP request handlers
   */
  private setupMCPHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Create temporary tool instances to get their definitions
      const tempGhlClient = new GHLApiClient({
        accessToken: 'temp',
        baseUrl: 'https://services.leadconnectorhq.com',
        locationId: 'temp',
        version: '2021-07-28'
      });
      
      const conversationTools = new ConversationTools(tempGhlClient);
      const emailTools = new EmailTools(tempGhlClient);

      // Get all tool definitions from the tool classes
      const allTools = [
        ...conversationTools.getToolDefinitions(),
        ...emailTools.getToolDefinitions()
      ];

      // Add dynamic credential parameters to each tool
      const toolsWithCredentials = allTools.map(tool => ({
        ...tool,
        inputSchema: {
          ...tool.inputSchema,
          properties: {
            apiKey: {
              type: 'string',
              description: 'GoHighLevel Private Integration API key (optional if using headers)',
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel Location ID (optional if using headers)',
            },
            userId: {
              type: 'string',
              description: 'User identifier for tracking/logging (optional)',
            },
            ...tool.inputSchema.properties
          },
          required: ['apiKey', 'locationId', ...(tool.inputSchema.required || [])]
        }
      }));

      return { tools: toolsWithCredentials };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;

      if (!args) {
        throw new McpError(ErrorCode.InvalidParams, 'Arguments are required');
      }

      // Try to get credentials from args first, then fallback to env vars
      let apiKey = args.apiKey as string;
      let locationId = args.locationId as string;
      
      // If not in args, try environment variables (set by mcp-remote from headers)
      if (!apiKey) {
        apiKey = process.env.GHL_API_KEY || '';
      }
      if (!locationId) {
        locationId = process.env.GHL_LOCATION_ID || '';
      }
      const userId = (args.userId as string) || 'anonymous';
      
      if (!apiKey) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'apiKey is required. Please provide your GoHighLevel Private Integration API key.'
        );
      }

      if (!locationId) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'locationId is required. Please provide your GoHighLevel Location ID (optional if using headers).'
        );
      }

      try {
        // Create API client with provided credentials
        const ghlClient = new GHLApiClient({
          accessToken: apiKey,
          baseUrl: 'https://services.leadconnectorhq.com',
          locationId: locationId,
          version: '2021-07-28'
        });

        // Log the request (optional, for debugging)
        console.log(`[${new Date().toISOString()}] User: ${userId} | Tool: ${toolName}`);

        // Initialize tool handlers with the dynamic client
        const conversationTools = new ConversationTools(ghlClient);
        const emailTools = new EmailTools(ghlClient);

        // Route to appropriate tool handler
        switch (toolName) {
          // Conversation Tools
          case 'get_conversations':
          case 'get_conversation':
          case 'create_conversation':
          case 'update_conversation':
          case 'delete_conversation':
          case 'get_conversation_messages':
          case 'add_conversation_message':
          case 'update_conversation_message':
          case 'delete_conversation_message':
          case 'get_conversation_participants':
          case 'add_conversation_participant':
          case 'remove_conversation_participant':
            return await conversationTools.executeTool(toolName, args);

          // Email Tools
          case 'send_email':
          case 'create_email_campaign':
          case 'update_email_campaign':
          case 'delete_email_campaign':
          case 'get_email_campaigns':
          case 'get_email_campaign':
          case 'pause_email_campaign':
          case 'resume_email_campaign':
          case 'get_email_campaign_stats':
            return await emailTools.executeTool(toolName, args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${toolName}`
            );
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
        service: 'ghl-communications-mcp',
        version: '1.0.0'
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
                name: 'ghl-communications-mcp',
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
          // Always use direct method instead of server.request in HTTP mode
          const tools = this.getToolsDirectly();
          res.json({
            jsonrpc: '2.0',
            result: { tools },
            id: jsonrpcRequest.id
          });
        } else if (jsonrpcRequest.method === 'tools/call') {
          try {
            const result = await this.executeToolDirectly(jsonrpcRequest.params);
            res.json({
              jsonrpc: '2.0',
              result,
              id: jsonrpcRequest.id
            });
          } catch (error) {
            console.error('[HTTP] Error executing tool directly:', error);
            res.json({
              jsonrpc: '2.0',
              error: {
                code: error instanceof McpError ? error.code : -32603,
                message: error instanceof Error ? error.message : 'Internal error'
              },
              id: jsonrpcRequest.id
            });
          }
        } else if (jsonrpcRequest.method === 'resources/list') {
          // This server doesn't provide resources, return empty list
          res.json({
            jsonrpc: '2.0',
            result: { resources: [] },
            id: jsonrpcRequest.id
          });
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
        // Use direct method instead of MCP server request
        const tools = this.getToolsDirectly();
        res.json({
          service: 'ghl-communications-mcp',
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
        service: 'GoHighLevel Communications MCP Server',
        version: '1.0.0',
        mode: 'HTTP Server',
        endpoints: {
          health: '/health',
          sse: '/sse',
          tools: '/tools'
        },
        description: 'GoHighLevel Communications MCP server for conversations and email campaigns'
      });
    });
  }

  /**
   * Execute a tool directly without MCP server (for HTTP mode)
   */
  private async executeToolDirectly(params: any) {
    const { name: toolName, arguments: args } = params;

    if (!args) {
      throw new McpError(ErrorCode.InvalidParams, 'Arguments are required');
    }

    // Try to get credentials from args first, then fallback to env vars
    let apiKey = args.apiKey as string;
    let locationId = args.locationId as string;
    
    // If not in args, try environment variables (set by mcp-remote from headers)
    if (!apiKey) {
      apiKey = process.env.GHL_API_KEY || '';
    }
    if (!locationId) {
      locationId = process.env.GHL_LOCATION_ID || '';
    }
    const userId = (args.userId as string) || 'anonymous';
    
    if (!apiKey) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'apiKey is required. Please provide your GoHighLevel Private Integration API key.'
      );
    }

    if (!locationId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'locationId is required. Please provide your GoHighLevel Location ID (optional if using headers).'
      );
    }

    try {
      // Create API client with provided credentials
      const ghlClient = new GHLApiClient({
        accessToken: apiKey,
        baseUrl: 'https://services.leadconnectorhq.com',
        locationId: locationId,
        version: '2021-07-28'
      });

      // Log the request (optional, for debugging)
      console.log(`[${new Date().toISOString()}] User: ${userId} | Tool: ${toolName}`);

      // Initialize tool handlers with the dynamic client
      const conversationTools = new ConversationTools(ghlClient);
      const emailTools = new EmailTools(ghlClient);

      // Route to appropriate tool handler
      switch (toolName) {
        // Conversation Tools
        case 'get_conversations':
        case 'get_conversation':
        case 'create_conversation':
        case 'update_conversation':
        case 'delete_conversation':
        case 'get_conversation_messages':
        case 'add_conversation_message':
        case 'update_conversation_message':
        case 'delete_conversation_message':
        case 'get_conversation_participants':
        case 'add_conversation_participant':
        case 'remove_conversation_participant':
          return await conversationTools.executeTool(toolName, args);

        // Email Tools
        case 'send_email':
        case 'create_email_campaign':
        case 'update_email_campaign':
        case 'delete_email_campaign':
        case 'get_email_campaigns':
        case 'get_email_campaign':
        case 'pause_email_campaign':
        case 'resume_email_campaign':
        case 'get_email_campaign_stats':
          return await emailTools.executeTool(toolName, args);

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
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
  }

  /**
   * Get tools directly without MCP server (fallback method)
   */
  private getToolsDirectly() {
    // Create temporary tool instances to get their definitions
    const tempGhlClient = new GHLApiClient({
      accessToken: 'temp',
      baseUrl: 'https://services.leadconnectorhq.com',
      locationId: 'temp',
      version: '2021-07-28'
    });
    
    const conversationTools = new ConversationTools(tempGhlClient);
    const emailTools = new EmailTools(tempGhlClient);

    // Get all tool definitions from the tool classes
    const allTools = [
      ...conversationTools.getToolDefinitions(),
      ...emailTools.getToolDefinitions()
    ];

    // Add dynamic credential parameters to each tool
    const toolsWithCredentials = allTools.map(tool => ({
      ...tool,
      inputSchema: {
        ...tool.inputSchema,
        properties: {
          apiKey: {
            type: 'string',
            description: 'GoHighLevel Private Integration API key (pk_live_...)',
          },
          locationId: {
            type: 'string',
            description: 'GoHighLevel Location ID (optional, uses default if not provided)',
          },
          userId: {
            type: 'string',
            description: 'User identifier for tracking/logging (optional)',
          },
          ...tool.inputSchema.properties
        },
        required: ['apiKey', 'locationId', ...(tool.inputSchema.required || [])]
      }
    }));

    return toolsWithCredentials;
  }

  /**
   * Start the HTTP server
   */
  async run(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, '0.0.0.0', () => {
        console.log(`[HTTP] GoHighLevel Core MCP server running on port ${this.port}`);
        console.log(`[HTTP] Health check: http://localhost:${this.port}/health`);
        console.log(`[HTTP] SSE endpoint: http://localhost:${this.port}/sse`);
        console.log(`[HTTP] Tools info: http://localhost:${this.port}/tools`);
        resolve();
      });
    });
  }
}

// Graceful shutdown
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
    
    const server = new DynamicMultiTenantHttpServer();
    await server.run();
    
    console.log('[HTTP] GoHighLevel Core MCP server is ready for connections');
  } catch (error) {
    console.error('[HTTP] Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DynamicMultiTenantHttpServer; 