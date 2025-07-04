/**
 * Dynamic Multi-Tenant GoHighLevel Communications MCP Server
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
import { ConversationTools } from './tools/conversation-tools.js';
import { EmailTools } from './tools/email-tools.js';

class DynamicMultiTenantCommunicationsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ghl-communications-mcp',
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
      try {
        // Get static tool definitions from all tool classes
        const allTools = [
          ...ConversationTools.getStaticToolDefinitions(),
          ...EmailTools.getStaticToolDefinitions(),
        ];

        // Add apiKey and locationId as required parameters to all tools
        const toolsWithCredentials = allTools.map((tool) => ({
          ...tool,
          inputSchema: {
            ...tool.inputSchema,
            properties: {
              apiKey: {
                type: 'string',
                description: 'GoHighLevel API key',
              },
              locationId: {
                type: 'string',
                description: 'GoHighLevel location ID (optional for some operations)',
              },
              ...(tool.inputSchema.properties || {}),
            },
            required: ['apiKey', ...((tool.inputSchema.required as string[]) || [])],
          },
        }));

        process.stderr.write(
          `[ghl-communications-mcp] Listed ${toolsWithCredentials.length} tools\n`
        );

        return { tools: toolsWithCredentials };
      } catch (error) {
        process.stderr.write(
          `[ghl-communications-mcp] Error listing tools: ${error}\n`
        );
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list tools: ${error}`
        );
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;

      try {
        process.stderr.write(
          `[ghl-communications-mcp] Executing tool: ${toolName}\n`
        );

        // Validate API key
        if (!args?.apiKey || typeof args.apiKey !== 'string') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'API key is required for all operations'
          );
        }

        // Create client instance with provided credentials
        const client = new GHLApiClient({
          accessToken: args.apiKey as string,
          baseUrl: 'https://services.leadconnectorhq.com',
          version: '2021-07-28',
          locationId: (args.locationId as string) || '',
        });

        // Create tool instances with the client
        const conversationTools = new ConversationTools(client);
        const emailTools = new EmailTools(client);

        // Remove credentials from args before passing to tool
        const { apiKey, locationId, ...toolArgs } = args;

        // Determine which tool to execute
        if (this.isConversationTool(toolName)) {
          return await conversationTools.executeTool(toolName, toolArgs);
        }

        if (this.isEmailTool(toolName)) {
          return await emailTools.executeTool(toolName, toolArgs);
        }

        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        process.stderr.write(
          `[ghl-communications-mcp] Error executing tool ${toolName}: ${error}\n`
        );
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error}`
        );
      }
    });
  }

  private isConversationTool(toolName: string): boolean {
    const conversationToolNames = ConversationTools.getStaticToolDefinitions().map(
      (tool) => tool.name
    );
    return conversationToolNames.includes(toolName);
  }

  private isEmailTool(toolName: string): boolean {
    const emailToolNames = EmailTools.getStaticToolDefinitions().map(
      (tool) => tool.name
    );
    return emailToolNames.includes(toolName);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write(
      'Dynamic Multi-Tenant ghl-communications-mcp MCP Server running on stdio\n'
    );
  }
}

// Start server
async function main(): Promise<void> {
  const server = new DynamicMultiTenantCommunicationsServer();
  await server.run();
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
}); 