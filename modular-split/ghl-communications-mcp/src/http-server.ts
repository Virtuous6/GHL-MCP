/**
 * GoHighLevel Communications MCP HTTP Server
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

class DynamicMultiTenantCommunicationsHttpServer {
  private app: express.Application;
  private server: Server;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.app = express();
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

    this.setupExpress();
    this.setupHandlers();
  }

  private setupExpress(): void {
    this.app.use(cors());
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'ghl-communications-mcp' });
    });

    // Main MCP endpoint
    this.app.use('/sse', (req, res, next) => {
      const transport = new SSEServerTransport('/sse', res);
      this.server.connect(transport);
      next();
    });
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
                description: 'GoHighLevel API key (optional if using headers)',
              },
              locationId: {
                type: 'string',
                description: 'GoHighLevel location ID (optional for some operations)',
              },
              ...(tool.inputSchema.properties || {}),
            },
            required: [...((tool.inputSchema.required as string[]) || [])],
          },
        }));

        process.stderr.write(
          `[ghl-communications-mcp-http] Listed ${toolsWithCredentials.length} tools\n`
        );

        return { tools: toolsWithCredentials };
      } catch (error) {
        process.stderr.write(
          `[ghl-communications-mcp-http] Error listing tools: ${error}\n`
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
          `[ghl-communications-mcp-http] Executing tool: ${toolName}\n`
        );

        // Try to get credentials from args first, then fallback to env vars
        let apiKey = args?.apiKey as string;
        let locationId = args?.locationId as string;
        
        // If not in args, try environment variables (set by mcp-remote from headers)
        if (!apiKey) {
          apiKey = process.env.GHL_API_KEY || '';
        }
        if (!locationId) {
          locationId = process.env.GHL_LOCATION_ID || '';
        }
        
        if (!apiKey) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'API key is required (either in apiKey parameter or GHL_API_KEY header)'
          );
        }

        // Create client instance with provided credentials
        const client = new GHLApiClient({
          accessToken: apiKey,
          baseUrl: 'https://services.leadconnectorhq.com',
          version: '2021-07-28',
          locationId: locationId || '',
        });

        // Create tool instances with the client
        const conversationTools = new ConversationTools(client);
        const emailTools = new EmailTools(client);

        // Remove credentials from args before passing to tool
        const toolArgs = { ...args };
        delete toolArgs.apiKey;
        delete toolArgs.locationId;

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
          `[ghl-communications-mcp-http] Error executing tool ${toolName}: ${error}\n`
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

  async start(): Promise<void> {
    this.app.listen(this.port, () => {
      process.stderr.write(
        `Dynamic Multi-Tenant ghl-communications-mcp MCP HTTP Server running on port ${this.port}\n`
      );
    });
  }
}

// Start server
async function main(): Promise<void> {
  const server = new DynamicMultiTenantCommunicationsHttpServer();
  await server.start();
}

main().catch((error) => {
  console.error('HTTP Server failed to start:', error);
  process.exit(1);
}); 