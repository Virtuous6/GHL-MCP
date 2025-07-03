/**
 * ghl-operations-mcp HTTP Server
 * Provides HTTP endpoints for the GoHighLevel Operations MCP server
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
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

class GhlOperationsHttpServer {
  private app: express.Application;
  private server: Server;

  constructor() {
    this.app = express();
    this.server = new Server(
      { name: 'ghl-operations-mcp', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupMiddleware();
    this.setupServer();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Middleware to log requests
    this.app.use((req, res, next) => {
      console.log(`[HTTP] ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
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

        // Add both environment variable support AND dynamic credentials
        const toolsWithCredentials = allTools.map(tool => ({
          ...tool,
          inputSchema: {
            ...tool.inputSchema,
            properties: {
              // Optional dynamic credentials (if not using env vars from headers)
              apiKey: {
                type: 'string',
                description: 'GoHighLevel API key (optional if using headers)'
              },
              locationId: {
                type: 'string', 
                description: 'GoHighLevel location ID (optional if using headers)'
              },
              userId: {
                type: 'string',
                description: 'User identifier for tracking/logging (optional)'
              },
              // Original tool properties
              ...tool.inputSchema.properties
            },
            required: Array.isArray(tool.inputSchema.required) ? tool.inputSchema.required : []
          }
        }));
        
        return { tools: toolsWithCredentials };
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        // Try to get credentials from args first, then fallback to env vars
        let apiKey = args?.apiKey as string;
        let locationId = args?.locationId as string;
        const userId = (args?.userId as string) || 'anonymous';
        
        // If not in args, try environment variables (set by mcp-remote from headers)
        if (!apiKey) {
          apiKey = process.env.GHL_API_KEY || '';
        }
        if (!locationId) {
          locationId = process.env.GHL_LOCATION_ID || '';
        }
        
        if (!apiKey) {
          throw new McpError(ErrorCode.InvalidParams, 'API key is required (either in apiKey parameter or GHL_API_KEY header)');
        }

        // Create dynamic client with provided credentials
        const config: GHLConfig = {
          accessToken: apiKey,
          baseUrl: 'https://services.leadconnectorhq.com',
          version: '2021-07-28',
          locationId: locationId
        };

        const ghlClient = new GHLApiClient(config);
        
        // Log the request
        console.log(`[${new Date().toISOString()}] User: ${userId} | Tool: ${toolName}`);
        
        // Create tool instances with dynamic client
        const calendarTools = new CalendarTools(ghlClient);
        const workflowTools = new WorkflowTools(ghlClient);
        const surveyTools = new SurveyTools(ghlClient);
        const locationTools = new LocationTools(ghlClient);
        
        const calendarToolNames = CalendarTools.getStaticToolDefinitions().map(tool => tool.name);
        const workflowToolNames = WorkflowTools.getStaticToolDefinitions().map(tool => tool.name);
        const surveyToolNames = SurveyTools.getStaticToolDefinitions().map(tool => tool.name);
        const locationToolNames = LocationTools.getStaticToolDefinitions().map(tool => tool.name);
        
        if (calendarToolNames.includes(toolName)) {
          return await calendarTools.executeTool(toolName, args || {});
        } else if (workflowToolNames.includes(toolName)) {
          return await workflowTools.executeTool(toolName, args || {});
        } else if (surveyToolNames.includes(toolName)) {
          return await surveyTools.executeTool(toolName, args || {});
        } else if (locationToolNames.includes(toolName)) {
          return await locationTools.executeTool(toolName, args || {});
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        if (error instanceof McpError) {
          throw error;
        }
        if (error instanceof Error && error.message.includes('401')) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid API key or insufficient permissions. Please check your GoHighLevel API key.'
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to execute tool: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'ghl-operations-mcp',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        features: [
          'Calendar management tools',
          'Workflow automation tools',
          'Survey management tools',
          'Location management tools'
        ]
      });
    });

    this.app.get('/sse', async (req, res) => {
      const transport = new SSEServerTransport('/sse', res);
      await this.server.connect(transport);
    });

    // Handle POST requests to SSE endpoint for JSON-RPC messages
    this.app.post('/sse', async (req, res) => {
      console.log('[HTTP] Received JSON-RPC message:', req.body);
      
      try {
        const jsonrpcRequest = req.body;
        
        if (jsonrpcRequest.method === 'initialize') {
          res.json({
            jsonrpc: '2.0',
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: {
                name: 'ghl-operations-mcp',
                version: '1.0.0'
              }
            },
            id: jsonrpcRequest.id
          });
        } else if (jsonrpcRequest.method === 'tools/list') {
          const response = await this.server.request(jsonrpcRequest, ListToolsRequestSchema);
          res.json(response);
        } else if (jsonrpcRequest.method === 'tools/call') {
          const response = await this.server.request(jsonrpcRequest, CallToolRequestSchema);
          res.json(response);
        } else {
          res.status(404).json({
            jsonrpc: '2.0',
            error: { code: -32601, message: 'Method not found' },
            id: jsonrpcRequest.id || null
          });
        }
      } catch (error) {
        console.error('[HTTP] Error processing JSON-RPC message:', error);
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal error' },
          id: req.body.id || null
        });
      }
    });

    this.app.get('/', (req, res) => {
      res.json({
        name: 'ghl-operations-mcp',
        description: 'GoHighLevel Operations MCP Server with hybrid environment variable and dynamic credential support',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          sse: '/sse'
        }
      });
    });
  }

  start(port: number = parseInt(process.env.PORT || '3000')): void {
    this.app.listen(port, () => {
      console.log(`ghl-operations-mcp HTTP Server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`SSE endpoint: http://localhost:${port}/sse`);
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new GhlOperationsHttpServer();
  server.start();
} 