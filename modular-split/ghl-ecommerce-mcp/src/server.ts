/**
 * Dynamic Multi-Tenant GoHighLevel Ecommerce MCP Server
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
import { StoreTools } from './tools/store-tools.js';
import { ProductsTools } from './tools/products-tools.js';

class DynamicMultiTenantEcommerceServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ghl-ecommerce-mcp-dynamic',
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
      const storeToolDefs = StoreTools.getStaticToolDefinitions();
      const productsToolDefs = ProductsTools.getStaticToolDefinitions();
      
      // Add dynamic credentials to each tool
      const enhancedTools = [...storeToolDefs, ...productsToolDefs].map(tool => ({
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
        const storeTools = new StoreTools(ghlClient);
        const productsTools = new ProductsTools(ghlClient);

        // Get tool names for routing
        const storeToolNames = StoreTools.getStaticToolDefinitions().map(tool => tool.name);
        const productsToolNames = ProductsTools.getStaticToolDefinitions().map(tool => tool.name);
        
        // Route to appropriate tool handler
        if (storeToolNames.includes(toolName)) {
          return await storeTools.executeTool(toolName, args);
        } else if (productsToolNames.includes(toolName)) {
          return await productsTools.executeTool(toolName, args);
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
    console.log('Dynamic GoHighLevel Ecommerce MCP server running on stdio');
  }
}

const server = new DynamicMultiTenantEcommerceServer();
server.run().catch(console.error);

export default DynamicMultiTenantEcommerceServer; 