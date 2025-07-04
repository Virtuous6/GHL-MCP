/**
 * ghl-operations-mcp MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
// Import the operations tool classes
import { CalendarTools } from './tools/calendar-tools.js';
import { WorkflowTools } from './tools/workflow-tools.js';
import { SurveyTools } from './tools/survey-tools.js';
import { LocationTools } from './tools/location-tools.js';

dotenv.config();

class GhlOperationsServer {
  private server: Server;
  private ghlClient!: GHLApiClient;
  private calendarTools!: CalendarTools;
  private workflowTools!: WorkflowTools;
  private surveyTools!: SurveyTools;
  private locationTools!: LocationTools;

  constructor() {
    this.server = new Server(
      { name: 'ghl-operations-mcp', version: '1.0.0' },
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
    this.calendarTools = new CalendarTools(this.ghlClient);
    this.workflowTools = new WorkflowTools(this.ghlClient);
    this.surveyTools = new SurveyTools(this.ghlClient);
    this.locationTools = new LocationTools(this.ghlClient);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const allTools = [
          ...this.calendarTools.getToolDefinitions(),
          ...this.workflowTools.getToolDefinitions(),
          ...this.surveyTools.getToolDefinitions(),
          ...this.locationTools.getToolDefinitions(),
        ];
        
        process.stderr.write(`[ghl-operations-mcp] Registered ${allTools.length} tools\n`);
        return { tools: allTools };
      } catch (error) {
        process.stderr.write(`[ghl-operations-mcp] Error listing tools: ${error}\n`);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(`[ghl-operations-mcp] Executing tool: ${toolName}\n`);
        
        const calendarToolNames = this.calendarTools.getToolDefinitions().map(tool => tool.name);
        const workflowToolNames = this.workflowTools.getToolDefinitions().map(tool => tool.name);
        const surveyToolNames = this.surveyTools.getToolDefinitions().map(tool => tool.name);
        const locationToolNames = this.locationTools.getToolDefinitions().map(tool => tool.name);
        
        if (calendarToolNames.includes(toolName)) {
          return await this.calendarTools.executeTool(toolName, args);
        } else if (workflowToolNames.includes(toolName)) {
          return await this.workflowTools.executeTool(toolName, args);
        } else if (surveyToolNames.includes(toolName)) {
          return await this.surveyTools.executeTool(toolName, args);
        } else if (locationToolNames.includes(toolName)) {
          return await this.locationTools.executeTool(toolName, args);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        process.stderr.write(`[ghl-operations-mcp] Error executing tool ${toolName}: ${error}\n`);
        throw error;
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write('ghl-operations-mcp MCP Server running on stdio\n');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new GhlOperationsServer();
  server.run().catch(console.error);
} 