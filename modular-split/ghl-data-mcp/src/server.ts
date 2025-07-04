/**
 * Dynamic Multi-Tenant GoHighLevel Data MCP Server
 * Users provide credentials with each tool call - no pre-configuration needed
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { ObjectTools } from './tools/object-tools.js';
import { AssociationTools } from './tools/association-tools.js';

class DynamicMultiTenantDataServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ghl-data-mcp',
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

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Dynamic GoHighLevel Data MCP server running on stdio');
  }
}

const server = new DynamicMultiTenantDataServer();
server.run().catch(console.error); 