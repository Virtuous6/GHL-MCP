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
import { ContactTools } from './tools/contact-tools.js';
import { CustomFieldV2Tools } from './tools/custom-field-v2-tools.js';
import { EmailISVTools } from './tools/email-isv-tools.js';

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
        name: 'ghl-core-mcp-dynamic-http',
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
      return {
        tools: [
          // Contact Tools with dynamic credentials
          {
            name: 'search_contacts',
            description: 'Search contacts in GoHighLevel CRM',
            inputSchema: {
              type: 'object',
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
                query: {
                  type: 'string',
                  description: 'Search query for contacts',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of contacts to return',
                  default: 100
                }
              },
              required: ['apiKey', 'locationId']
            }
          },
          {
            name: 'get_contact',
            description: 'Get a specific contact by ID',
            inputSchema: {
              type: 'object',
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
                contactId: {
                  type: 'string',
                  description: 'The contact ID to retrieve',
                }
              },
              required: ['apiKey', 'locationId', 'contactId']
            }
          },
          {
            name: 'create_contact',
            description: 'Create a new contact',
            inputSchema: {
              type: 'object',
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
                firstName: {
                  type: 'string',
                  description: 'Contact first name',
                },
                lastName: {
                  type: 'string',
                  description: 'Contact last name',
                },
                email: {
                  type: 'string',
                  description: 'Contact email address',
                },
                phone: {
                  type: 'string',
                  description: 'Contact phone number',
                }
              },
              required: ['apiKey', 'locationId', 'firstName']
            }
          },
          {
            name: 'update_contact',
            description: 'Update an existing contact',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key' },
                locationId: { type: 'string', description: 'GoHighLevel Location ID (optional if using headers)' },
                userId: { type: 'string', description: 'User identifier (optional)' },
                contactId: { type: 'string', description: 'Contact ID to update' },
                firstName: { type: 'string', description: 'Contact first name' },
                lastName: { type: 'string', description: 'Contact last name' },
                email: { type: 'string', description: 'Contact email address' },
                phone: { type: 'string', description: 'Contact phone number' }
              },
              required: ['apiKey', 'locationId', 'contactId']
            }
          },
          {
            name: 'delete_contact',
            description: 'Delete a contact',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key' },
                locationId: { type: 'string', description: 'GoHighLevel Location ID (optional if using headers)' },
                userId: { type: 'string', description: 'User identifier (optional)' },
                contactId: { type: 'string', description: 'Contact ID to delete' }
              },
              required: ['apiKey', 'locationId', 'contactId']
            }
          },
          {
            name: 'add_contact_tags',
            description: 'Add tags to a contact',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key' },
                locationId: { type: 'string', description: 'GoHighLevel Location ID (optional if using headers)' },
                userId: { type: 'string', description: 'User identifier (optional)' },
                contactId: { type: 'string', description: 'Contact ID' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Tags to add' }
              },
              required: ['apiKey', 'locationId', 'contactId', 'tags']
            }
          },
          {
            name: 'remove_contact_tags',
            description: 'Remove tags from a contact',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key' },
                locationId: { type: 'string', description: 'GoHighLevel Location ID (optional if using headers)' },
                userId: { type: 'string', description: 'User identifier (optional)' },
                contactId: { type: 'string', description: 'Contact ID' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Tags to remove' }
              },
              required: ['apiKey', 'locationId', 'contactId', 'tags']
            }
          },
          {
            name: 'list_custom_fields',
            description: 'List all custom fields',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key' },
                locationId: { type: 'string', description: 'GoHighLevel Location ID (optional if using headers)' },
                userId: { type: 'string', description: 'User identifier (optional)' },
                model: { type: 'string', enum: ['contact', 'opportunity'], description: 'Model type' }
              },
              required: ['apiKey', 'locationId']
            }
          },
          {
            name: 'verify_email',
            description: 'Verify an email address',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key' },
                locationId: { type: 'string', description: 'GoHighLevel Location ID (optional if using headers)' },
                userId: { type: 'string', description: 'User identifier (optional)' },
                email: { type: 'string', description: 'Email address to verify' }
              },
              required: ['apiKey', 'locationId', 'email']
            }
          }
        ]
      };
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
        const contactTools = new ContactTools(ghlClient);
        const customFieldTools = new CustomFieldV2Tools(ghlClient);
        const emailISVTools = new EmailISVTools(ghlClient);

        // Route to appropriate tool handler
        switch (toolName) {
          // Contact Tools
          case 'search_contacts':
          case 'get_contact':
          case 'create_contact':
          case 'update_contact':
          case 'delete_contact':
          case 'bulk_delete_contacts':
          case 'get_contact_followers':
          case 'add_contact_follower':
          case 'remove_contact_follower':
          case 'add_contact_tags':
          case 'remove_contact_tags':
          case 'create_contact_task':
          case 'update_contact_task':
          case 'delete_contact_task':
          case 'get_contact_tasks':
          case 'update_contact_task_status':
          case 'create_contact_note':
          case 'update_contact_note':
          case 'delete_contact_note':
          case 'get_contact_notes':
          case 'create_contact_appointment':
          case 'delete_contact_appointment':
          case 'get_contact_appointments':
          case 'upsert_contact':
          case 'duplicate_contact_check':
          case 'get_business_by_contact_id':
            return await contactTools.executeTool(toolName, args);

          // Custom Field Tools
          case 'create_custom_field':
          case 'get_custom_field':
          case 'update_custom_field':
          case 'delete_custom_field':
          case 'list_custom_fields':
          case 'upload_custom_field_file':
          case 'list_custom_field_options':
          case 'create_custom_field_option':
            return await customFieldTools.executeCustomFieldV2Tool(toolName, args);

          // Email ISV Tools
          case 'verify_email':
            return await emailISVTools.executeTool(toolName, args);

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
        service: 'ghl-core-mcp-dynamic',
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
                name: 'ghl-core-mcp-dynamic',
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
          try {
            const response = await this.server.request(jsonrpcRequest, ListToolsRequestSchema);
            res.json(response);
          } catch (error) {
            console.error('[HTTP] Error calling server.request for tools/list:', error);
            // Fallback to direct handler call
            const tools = this.getToolsDirectly();
            res.json({
              jsonrpc: '2.0',
              result: { tools },
              id: jsonrpcRequest.id
            });
          }
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
          service: 'ghl-core-mcp-dynamic',
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
        service: 'GoHighLevel Core MCP Server',
        version: '1.0.0',
        mode: 'Dynamic Multi-Tenant HTTP',
        endpoints: {
          health: '/health',
          sse: '/sse',
          tools: '/tools'
        },
        description: 'Dynamic multi-tenant GoHighLevel MCP server with 40 specialized tools'
      });
    });
  }

  /**
   * Get tools directly without MCP server (fallback method)
   */
  private getToolsDirectly() {
    return [
      // Contact Tools with dynamic credentials
      {
        name: 'search_contacts',
        description: 'Search contacts in GoHighLevel CRM',
        inputSchema: {
          type: 'object',
          properties: {
            apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
            locationId: { type: 'string', description: 'GoHighLevel Location ID (optional, uses default if not provided)' },
            userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
            query: { type: 'string', description: 'Search query for contacts' },
            limit: { type: 'number', description: 'Maximum number of contacts to return', default: 100 }
          },
          required: ['apiKey', 'locationId']
        }
      },
      {
        name: 'get_contact',
        description: 'Get a specific contact by ID',
        inputSchema: {
          type: 'object',
          properties: {
            apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
            locationId: { type: 'string', description: 'GoHighLevel Location ID (optional, uses default if not provided)' },
            userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
            contactId: { type: 'string', description: 'The contact ID to retrieve' }
          },
          required: ['apiKey', 'locationId', 'contactId']
        }
      },
      {
        name: 'create_contact',
        description: 'Create a new contact',
        inputSchema: {
          type: 'object',
          properties: {
            apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
            locationId: { type: 'string', description: 'GoHighLevel Location ID (optional, uses default if not provided)' },
            userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
            firstName: { type: 'string', description: 'Contact first name' },
            lastName: { type: 'string', description: 'Contact last name' },
            email: { type: 'string', description: 'Contact email address' },
            phone: { type: 'string', description: 'Contact phone number' }
          },
          required: ['apiKey', 'locationId', 'firstName']
        }
      },
      {
        name: 'update_contact',
        description: 'Update an existing contact',
        inputSchema: {
          type: 'object',
          properties: {
            apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
            locationId: { type: 'string', description: 'GoHighLevel Location ID (optional, uses default if not provided)' },
            userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
            contactId: { type: 'string', description: 'Contact ID to update' },
            firstName: { type: 'string', description: 'Contact first name' },
            lastName: { type: 'string', description: 'Contact last name' },
            email: { type: 'string', description: 'Contact email address' },
            phone: { type: 'string', description: 'Contact phone number' }
          },
          required: ['apiKey', 'locationId', 'contactId']
        }
      },
      {
        name: 'delete_contact',
        description: 'Delete a contact',
        inputSchema: {
          type: 'object',
          properties: {
            apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
            locationId: { type: 'string', description: 'GoHighLevel Location ID (optional, uses default if not provided)' },
            userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
            contactId: { type: 'string', description: 'Contact ID to delete' }
          },
          required: ['apiKey', 'locationId', 'contactId']
        }
      },
      {
        name: 'verify_email',
        description: 'Verify an email address',
        inputSchema: {
          type: 'object',
          properties: {
            apiKey: { type: 'string', description: 'GoHighLevel Private Integration API key (pk_live_...)' },
            locationId: { type: 'string', description: 'GoHighLevel Location ID (optional, uses default if not provided)' },
            userId: { type: 'string', description: 'User identifier for tracking/logging (optional)' },
            email: { type: 'string', description: 'Email address to verify' }
          },
          required: ['apiKey', 'locationId', 'email']
        }
      }
    ];
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
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
    await server.start();
    
    console.log('[HTTP] GoHighLevel Core MCP server is ready for connections');
  } catch (error) {
    console.error('[HTTP] Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  main().catch(console.error);
}

export default DynamicMultiTenantHttpServer; 