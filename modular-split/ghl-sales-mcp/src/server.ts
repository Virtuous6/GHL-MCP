/**
 * ghl-sales-mcp MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
import { OpportunityTools } from './tools/opportunity-tools.js';
import { PaymentsTools } from './tools/payments-tools.js';
import { InvoicesTools } from './tools/invoices-tools.js';

dotenv.config();

class GhlSalesServer {
  private server: Server;
  private ghlClient!: GHLApiClient;
  private opportunityTools!: OpportunityTools;
  private paymentsTools!: PaymentsTools;
  private invoicesTools!: InvoicesTools;

  constructor() {
    this.server = new Server(
      { name: 'ghl-sales-mcp', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupServer();
  }

  private setupServer(): void {
    const config: GHLConfig = {
      accessToken: process.env.GHL_API_KEY || '',
      baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
      version: '2021-07-28',
      locationId: process.env.GHL_LOCATION_ID || ''
    };

    this.ghlClient = new GHLApiClient(config);
    this.opportunityTools = new OpportunityTools(this.ghlClient);
    this.paymentsTools = new PaymentsTools(this.ghlClient);
    this.invoicesTools = new InvoicesTools(this.ghlClient);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const allTools = [
          ...this.opportunityTools.getToolDefinitions(),
          ...this.paymentsTools.getToolDefinitions(),
          ...this.invoicesTools.getToolDefinitions(),
        ];
        
        process.stderr.write(`[ghl-sales-mcp] Registered ${allTools.length} tools\n`);
        return { tools: allTools };
      } catch (error) {
        process.stderr.write(`[ghl-sales-mcp] Error listing tools: ${error}\n`);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(`[ghl-sales-mcp] Executing tool: ${toolName}\n`);
        
        const opportunityToolNames = this.opportunityTools.getToolDefinitions().map(tool => tool.name);
        const paymentsToolNames = this.paymentsTools.getToolDefinitions().map(tool => tool.name);
        const invoicesToolNames = this.invoicesTools.getToolDefinitions().map(tool => tool.name);
        
        if (opportunityToolNames.includes(toolName)) {
          return await this.opportunityTools.executeTool(toolName, args);
        } else if (paymentsToolNames.includes(toolName)) {
          return await this.paymentsTools.executeTool(toolName, args);
        } else if (invoicesToolNames.includes(toolName)) {
          return await this.invoicesTools.executeTool(toolName, args);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        process.stderr.write(`[ghl-sales-mcp] Error executing tool ${toolName}: ${error}\n`);
        throw error;
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Dynamic GoHighLevel Sales MCP server running on stdio');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new GhlSalesServer();
  server.run().catch(console.error);
} 