// Dynamic Multi-Tenant GoHighLevel MCP Server
// Users provide credentials with each tool call - no pre-configuration needed

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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

class DynamicMultiTenantServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ghl-core-mcp-dynamic',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
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
                // Required credentials
                apiKey: {
                  type: 'string',
                  description: 'GoHighLevel Private Integration API key (pk_live_...)',
                },
                locationId: {
                  type: 'string',
                  description: 'GoHighLevel Location ID',
                },
                // Optional user identifier
                userId: {
                  type: 'string',
                  description: 'User identifier for tracking/logging (optional)',
                },
                // Tool-specific parameters
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
                  description: 'GoHighLevel Private Integration API key (pk_live_...)',
                },
                locationId: {
                  type: 'string',
                  description: 'GoHighLevel Location ID',
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
                  description: 'GoHighLevel Private Integration API key (pk_live_...)',
                },
                locationId: {
                  type: 'string',
                  description: 'GoHighLevel Location ID',
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
                locationId: { type: 'string', description: 'GoHighLevel Location ID' },
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
                locationId: { type: 'string', description: 'GoHighLevel Location ID' },
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
                locationId: { type: 'string', description: 'GoHighLevel Location ID' },
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
                locationId: { type: 'string', description: 'GoHighLevel Location ID' },
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
                locationId: { type: 'string', description: 'GoHighLevel Location ID' },
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
                locationId: { type: 'string', description: 'GoHighLevel Location ID' },
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

      if (!locationId) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'locationId is required. Please provide your GoHighLevel Location ID.'
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

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Dynamic GoHighLevel MCP server running on stdio');
  }
}

const server = new DynamicMultiTenantServer();
server.run().catch(console.error);

export default DynamicMultiTenantServer; 