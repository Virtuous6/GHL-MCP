/**
 * ghl-operations-mcp Dynamic Server
 * Multi-tenant MCP server for GoHighLevel Operations tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, Tool } from '@modelcontextprotocol/sdk/types.js';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
import { CalendarTools } from './tools/calendar-tools.js';
import { WorkflowTools } from './tools/workflow-tools.js';
import { SurveyTools } from './tools/survey-tools.js';
import { LocationTools } from './tools/location-tools.js';

interface APICredentials {
  accessToken: string;
  locationId: string;
  baseUrl?: string;
  version?: string;
}

interface ToolArgs extends Record<string, any> {
  apiCredentials: APICredentials;
}

class GhlOperationsDynamicServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: 'ghl-operations-dynamic', version: '2.0.0' },
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
          ...CalendarTools.getStaticToolDefinitions(),
          ...WorkflowTools.getStaticToolDefinitions(),
          ...SurveyTools.getStaticToolDefinitions(),
          ...LocationTools.getStaticToolDefinitions(),
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
        
        process.stderr.write(`[ghl-operations-dynamic] Registered ${toolsWithCredentials.length} tools\n`);
        return { tools: toolsWithCredentials };
      } catch (error) {
        process.stderr.write(`[ghl-operations-dynamic] Error listing tools: ${error}\n`);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(`[ghl-operations-dynamic] Executing tool: ${toolName}\n`);
        
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
        const calendarTools = new CalendarTools(ghlClient);
        const workflowTools = new WorkflowTools(ghlClient);
        const surveyTools = new SurveyTools(ghlClient);
        const locationTools = new LocationTools(ghlClient);
        
        // Route to appropriate tool handler
        const calendarToolNames = CalendarTools.getStaticToolDefinitions().map(tool => tool.name);
        const workflowToolNames = WorkflowTools.getStaticToolDefinitions().map(tool => tool.name);
        const surveyToolNames = SurveyTools.getStaticToolDefinitions().map(tool => tool.name);
        const locationToolNames = LocationTools.getStaticToolDefinitions().map(tool => tool.name);
        
        if (calendarToolNames.includes(toolName)) {
          return await calendarTools.executeTool(toolName, toolArgs);
        } else if (workflowToolNames.includes(toolName)) {
          return await workflowTools.executeTool(toolName, toolArgs);
        } else if (surveyToolNames.includes(toolName)) {
          return await surveyTools.executeTool(toolName, toolArgs);
        } else if (locationToolNames.includes(toolName)) {
          return await locationTools.executeTool(toolName, toolArgs);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        process.stderr.write(`[ghl-operations-dynamic] Error executing tool ${toolName}: ${error}\n`);
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write('ghl-operations-dynamic MCP Server running on stdio\n');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new GhlOperationsDynamicServer();
  server.run().catch(console.error);
} 