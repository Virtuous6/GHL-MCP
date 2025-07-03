/**
 * ghl-sales-mcp Dynamic Server
 * Multi-tenant MCP server for GoHighLevel Sales tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, Tool } from '@modelcontextprotocol/sdk/types.js';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
import { OpportunityTools } from './tools/opportunity-tools.js';
import { PaymentsTools } from './tools/payments-tools.js';
import { InvoicesTools } from './tools/invoices-tools.js';

interface APICredentials {
  accessToken: string;
  locationId: string;
  baseUrl?: string;
  version?: string;
}

class GhlSalesServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: 'ghl-sales-mcp', version: '1.0.0' },
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
          ...OpportunityTools.getStaticToolDefinitions(),
          ...PaymentsTools.getStaticToolDefinitions(),
          ...InvoicesTools.getStaticToolDefinitions(),
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
        
        process.stderr.write(`[ghl-sales-mcp] Registered ${toolsWithCredentials.length} tools\n`);
        return { tools: toolsWithCredentials };
      } catch (error) {
        process.stderr.write(`[ghl-sales-mcp] Error listing tools: ${error}\n`);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(`[ghl-sales-mcp] Executing tool: ${toolName}\n`);
        
        // Extract API credentials from arguments
        const { apiCredentials, ...toolArgs } = args as any;
        
        if (!apiCredentials) {
          throw new McpError(ErrorCode.InvalidParams, 'API credentials are required for all tool calls');
        }

        // Create dynamic client with provided credentials
        const config: GHLConfig = {
          accessToken: apiCredentials.accessToken,
          baseUrl: apiCredentials.baseUrl || 'https://services.leadconnectorhq.com',
          version: apiCredentials.version || '2021-07-28',
          locationId: apiCredentials.locationId
        };

        const ghlClient = new GHLApiClient(config);
        
        // Create tool instances with dynamic client
        const opportunityTools = new OpportunityTools(ghlClient);
        const paymentsTools = new PaymentsTools(ghlClient);
        const invoicesTools = new InvoicesTools(ghlClient);
        
        const opportunityToolNames = OpportunityTools.getStaticToolDefinitions().map(tool => tool.name);
        const paymentsToolNames = PaymentsTools.getStaticToolDefinitions().map(tool => tool.name);
        const invoicesToolNames = InvoicesTools.getStaticToolDefinitions().map(tool => tool.name);
        
        if (opportunityToolNames.includes(toolName)) {
          return await opportunityTools.executeTool(toolName, toolArgs);
        } else if (paymentsToolNames.includes(toolName)) {
          return await paymentsTools.executeTool(toolName, toolArgs);
        } else if (invoicesToolNames.includes(toolName)) {
          return await invoicesTools.executeTool(toolName, toolArgs);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        process.stderr.write(`[ghl-sales-mcp] Error executing tool ${toolName}: ${error}\n`);
        throw error;
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write('ghl-sales-mcp Dynamic MCP Server running on stdio\n');
  }
}

async function main(): Promise<void> {
  const server = new GhlSalesServer();
  await server.start();
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
}); 