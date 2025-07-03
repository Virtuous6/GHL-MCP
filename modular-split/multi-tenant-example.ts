// Multi-Tenant GoHighLevel MCP Server Example
// This shows how to modify the existing server to support multiple users

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

interface UserConfig {
  accessToken: string;
  locationId: string;
  baseUrl: string;
}

class MultiTenantCRMServer {
  private server: Server;
  private userConfigs: Map<string, UserConfig> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'ghl-core-mcp-multitenant',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.loadUserConfigurations();
  }

  private loadUserConfigurations(): void {
    try {
      // Load user configurations from environment variable
      const userConfigsJson = process.env.USER_CONFIGS;
      if (!userConfigsJson) {
        console.error('USER_CONFIGS environment variable not set');
        return;
      }

      const configs = JSON.parse(userConfigsJson);
      
      for (const [userId, config] of Object.entries(configs)) {
        const userConfig = config as UserConfig;
        this.userConfigs.set(userId, {
          accessToken: userConfig.accessToken,
          locationId: userConfig.locationId,
          baseUrl: userConfig.baseUrl || 'https://services.leadconnectorhq.com'
        });
      }

      console.log(`Loaded configurations for ${this.userConfigs.size} users`);
    } catch (error) {
      console.error('Failed to load user configurations:', error);
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Return tools available for all users
      // Note: In a real implementation, you might want to customize
      // available tools based on user subscription level
      return {
        tools: [
          // Contact Tools
          {
            name: 'search_contacts',
            description: 'Search contacts in GoHighLevel CRM (requires userId parameter)',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'User ID to identify which account to use',
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
              required: ['userId']
            }
          },
          {
            name: 'get_contact',
            description: 'Get a specific contact by ID (requires userId parameter)',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'User ID to identify which account to use',
                },
                contactId: {
                  type: 'string',
                  description: 'The contact ID to retrieve',
                }
              },
              required: ['userId', 'contactId']
            }
          },
          {
            name: 'create_contact',
            description: 'Create a new contact (requires userId parameter)',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'User ID to identify which account to use',
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
              required: ['userId', 'firstName']
            }
          },
          // Add other tools as needed...
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;

      // Extract user ID from arguments
      const userId = args.userId || args.user_id;
      if (!userId) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'userId is required for all tool calls'
        );
      }

      // Get user configuration
      const userConfig = this.userConfigs.get(userId);
      if (!userConfig) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Unknown user ID: ${userId}. Please check your user configuration.`
        );
      }

      try {
        // Create user-specific API client
        const ghlClient = new GHLApiClient({
          accessToken: userConfig.accessToken,
          baseUrl: userConfig.baseUrl,
          locationId: userConfig.locationId
        });

        // Initialize tool handlers with user-specific client
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
            return await contactTools.callTool(toolName, args);

          // Custom Field Tools
          case 'create_custom_field':
          case 'get_custom_field':
          case 'update_custom_field':
          case 'delete_custom_field':
          case 'list_custom_fields':
          case 'upload_custom_field_file':
          case 'list_custom_field_options':
          case 'create_custom_field_option':
            return await customFieldTools.callTool(toolName, args);

          // Email ISV Tools
          case 'verify_email':
            return await emailISVTools.callTool(toolName, args);

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
    console.log('Multi-tenant GoHighLevel MCP server running on stdio');
  }
}

const server = new MultiTenantCRMServer();
server.run().catch(console.error);

export default MultiTenantCRMServer; 