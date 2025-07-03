/**
 * ghl-marketing-mcp Dynamic Server
 * Multi-tenant MCP server for GoHighLevel Marketing tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, Tool } from '@modelcontextprotocol/sdk/types.js';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
import { BlogTools } from './tools/blog-tools.js';
import { SocialMediaTools } from './tools/social-media-tools.js';
import { MediaTools } from './tools/media-tools.js';

interface APICredentials {
  accessToken: string;
  locationId: string;
  baseUrl?: string;
  version?: string;
}

interface ToolArgs extends Record<string, any> {
  apiCredentials: APICredentials;
}

class GhlMarketingDynamicServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: 'ghl-marketing-dynamic', version: '2.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupServer();
  }

  private setupServer(): void {
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const allTools = [
          ...BlogTools.getStaticToolDefinitions(),
          ...SocialMediaTools.getStaticToolDefinitions(),
          ...MediaTools.getStaticToolDefinitions(),
        ] as Tool[];
        
        // Add apiCredentials parameter to all tools
        const toolsWithCredentials = allTools.map(tool => ({
          ...tool,
          inputSchema: {
            ...tool.inputSchema,
            properties: {
              ...tool.inputSchema.properties,
              apiCredentials: {
                type: 'object',
                description: 'GoHighLevel API credentials',
                properties: {
                  accessToken: {
                    type: 'string',
                    description: 'GoHighLevel API access token'
                  },
                  locationId: {
                    type: 'string', 
                    description: 'GoHighLevel location ID'
                  },
                  baseUrl: {
                    type: 'string',
                    description: 'API base URL (optional)',
                    default: 'https://services.leadconnectorhq.com'
                  },
                  version: {
                    type: 'string',
                    description: 'API version (optional)',
                    default: '2021-07-28'
                  }
                },
                required: ['accessToken', 'locationId']
              }
            },
            required: (Array.isArray(tool.inputSchema.required) ? tool.inputSchema.required : []).concat(['apiCredentials'])
          }
        }));
        
        process.stderr.write(`[ghl-marketing-dynamic] Registered ${toolsWithCredentials.length} tools\n`);
        return { tools: toolsWithCredentials };
      } catch (error) {
        process.stderr.write(`[ghl-marketing-dynamic] Error listing tools: ${error}\n`);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(`[ghl-marketing-dynamic] Executing tool: ${toolName}\n`);
        
        // Validate API credentials
        const typedArgs = args as ToolArgs;
        if (!typedArgs.apiCredentials) {
          throw new McpError(ErrorCode.InvalidParams, 'API credentials are required');
        }

        const { apiCredentials, ...toolArgs } = typedArgs;
        
        if (!apiCredentials.accessToken || !apiCredentials.locationId) {
          throw new McpError(ErrorCode.InvalidParams, 'accessToken and locationId are required in apiCredentials');
        }

        // Create GHL client with provided credentials
        const config: GHLConfig = {
          accessToken: apiCredentials.accessToken,
          baseUrl: apiCredentials.baseUrl || 'https://services.leadconnectorhq.com',
          version: apiCredentials.version || '2021-07-28',
          locationId: apiCredentials.locationId
        };

        const ghlClient = new GHLApiClient(config);
        
        // Create tool instances with client
        const blogTools = new BlogTools(ghlClient);
        const socialMediaTools = new SocialMediaTools(ghlClient);
        const mediaTools = new MediaTools(ghlClient);
        
        // Route to appropriate tool handler
        const blogToolNames = BlogTools.getStaticToolDefinitions().map(tool => tool.name);
        const socialMediaToolNames = SocialMediaTools.getStaticToolDefinitions().map(tool => tool.name);
        const mediaToolNames = MediaTools.getStaticToolDefinitions().map(tool => tool.name);
        
        if (blogToolNames.includes(toolName)) {
          return await blogTools.executeTool(toolName, toolArgs);
        } else if (socialMediaToolNames.includes(toolName)) {
          return await socialMediaTools.executeTool(toolName, toolArgs);
        } else if (mediaToolNames.includes(toolName)) {
          return await mediaTools.executeTool(toolName, toolArgs);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        process.stderr.write(`[ghl-marketing-dynamic] Error executing tool ${toolName}: ${error}\n`);
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write('ghl-marketing-dynamic MCP Server running on stdio\n');
  }
}

async function main(): Promise<void> {
  const server = new GhlMarketingDynamicServer();
  await server.start();
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
}); 