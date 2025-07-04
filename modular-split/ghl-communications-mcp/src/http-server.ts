/**
 * GoHighLevel Communications MCP HTTP Server
 * Dynamic multi-tenant HTTP version for web deployment
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  McpError,
  ErrorCode,
  Tool
} from '@modelcontextprotocol/sdk/types.js';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { ConversationTools } from './tools/conversation-tools.js';
import { EmailTools } from './tools/email-tools.js';

class DynamicMultiTenantCommunicationsHttpServer {
  private app: express.Application;
  private server: Server;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '8080', 10);
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
  }

  private setupExpress(): void {
    this.app.use(cors());
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'ghl-communications-mcp' });
    });

    // Extract GHL credentials from headers if present
    this.app.use((req, res, next) => {
      const apiKeyHeader = req.headers['x-ghl-api-key'] as string;
      const locationIdHeader = req.headers['x-ghl-location-id'] as string;
      
      // Set environment variables for this request context
      if (apiKeyHeader) {
        process.env.GHL_API_KEY = apiKeyHeader;
      }
      if (locationIdHeader) {
        process.env.GHL_LOCATION_ID = locationIdHeader;
      }
      
      console.log(`[HTTP] Credentials available - API Key: ${!!apiKeyHeader}, Location ID: ${!!locationIdHeader}`);
      next();
    });

    // MCP SSE endpoint - POST for JSON-RPC messages
    this.app.post('/sse', async (req, res) => {
      console.log('[HTTP] Received JSON-RPC message:', req.body);
      
      try {
        const jsonrpcRequest = req.body;
        
        if (jsonrpcRequest.method === 'initialize') {
          // Handle MCP initialization
          res.json({
            jsonrpc: '2.0',
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'ghl-communications-mcp',
                version: '1.0.0'
              }
            },
            id: jsonrpcRequest.id
          });
        } else if (jsonrpcRequest.method === 'notifications/initialized') {
          console.log('[HTTP] MCP initialized notification received');
          res.status(200).end();
          return;
        } else if (jsonrpcRequest.method === 'notifications/cancelled') {
          console.log('[HTTP] MCP cancelled notification received');
          res.status(200).end();
          return;
        } else if (jsonrpcRequest.method === 'tools/list') {
          const tools = this.getToolsDirectly();
          res.json({
            jsonrpc: '2.0',
            result: { tools },
            id: jsonrpcRequest.id
          });
        } else if (jsonrpcRequest.method === 'tools/call') {
          const result = await this.executeToolDirectly(jsonrpcRequest.params);
          res.json({
            jsonrpc: '2.0',
            result,
            id: jsonrpcRequest.id
          });
        } else {
          res.status(404).json({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: 'Method not found'
            },
            id: jsonrpcRequest.id || null
          });
        }
      } catch (error) {
        console.error('[HTTP] Error processing JSON-RPC message:', error);
        const mcpError = error instanceof McpError ? error : new McpError(
          ErrorCode.InternalError,
          `Request failed: ${error}`
        );
        
        res.json({
          jsonrpc: '2.0',
          error: {
            code: mcpError.code,
            message: mcpError.message
          },
          id: req.body.id || null
        });
      }
    });

    // List tools endpoint
    this.app.post('/tools/list', (req, res) => {
      try {
        const tools = this.getToolsDirectly();
        res.json({
          jsonrpc: '2.0',
          result: { tools },
          id: req.body.id || null
        });
      } catch (error) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: ErrorCode.InternalError,
            message: `Failed to list tools: ${error}`
          },
          id: req.body.id || null
        });
      }
    });

    // Main MCP endpoint for JSON-RPC
    this.app.post('/mcp', async (req, res) => {
      try {
        const { method, params, id } = req.body;

        if (method === 'tools/list') {
          const tools = this.getToolsDirectly();
          res.json({
            jsonrpc: '2.0',
            result: { tools },
            id
          });
        } else if (method === 'tools/call') {
          const result = await this.executeToolDirectly(params);
          res.json({
            jsonrpc: '2.0',
            result,
            id
          });
        } else {
          res.status(404).json({
            jsonrpc: '2.0',
            error: {
              code: ErrorCode.MethodNotFound,
              message: `Method not found: ${method}`
            },
            id
          });
        }
      } catch (error) {
        console.error('MCP endpoint error:', error);
        const mcpError = error instanceof McpError ? error : new McpError(
          ErrorCode.InternalError,
          `Request failed: ${error}`
        );
        
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: mcpError.code,
            message: mcpError.message
          },
          id: req.body.id || null
        });
      }
    });
  }

  private getToolsDirectly(): Tool[] {
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

      return toolsWithCredentials;
    } catch (error) {
      console.error('Error getting tools:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get tools: ${error}`
      );
    }
  }

  private async executeToolDirectly(params: any): Promise<any> {
    const { name: toolName, arguments: args } = params;

    try {
      console.log(`[ghl-communications-mcp-http] Executing tool: ${toolName}`);

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
      
      console.error(`[ghl-communications-mcp-http] Error executing tool ${toolName}:`, error);
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error}`
      );
    }
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
      console.log(
        `Dynamic Multi-Tenant ghl-communications-mcp MCP HTTP Server running on port ${this.port}`
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