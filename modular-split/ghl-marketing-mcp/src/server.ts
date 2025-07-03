/**
 * ghl-marketing MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
import { BlogTools } from './tools/blog-tools.js';
import { SocialMediaTools } from './tools/social-media-tools.js';
import { MediaTools } from './tools/media-tools.js';

dotenv.config();

class GhlMarketingServer {
  private server: Server;
  private ghlClient!: GHLApiClient;
  private blogTools!: BlogTools;
  private socialMediaTools!: SocialMediaTools;
  private mediaTools!: MediaTools;

  constructor() {
    this.server = new Server(
      { name: 'ghl-marketing', version: '1.0.0' },
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
    this.blogTools = new BlogTools(this.ghlClient);
    this.socialMediaTools = new SocialMediaTools(this.ghlClient);
    this.mediaTools = new MediaTools(this.ghlClient);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const allTools = [
          ...this.blogTools.getToolDefinitions(),
          ...this.socialMediaTools.getToolDefinitions(),
          ...this.mediaTools.getToolDefinitions(),
        ];
        
        process.stderr.write(`[ghl-marketing] Registered ${allTools.length} tools\n`);
        return { tools: allTools };
      } catch (error) {
        process.stderr.write(`[ghl-marketing] Error listing tools: ${error}\n`);
        throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(`[ghl-marketing] Executing tool: ${toolName}\n`);
        
        const blogToolNames = this.blogTools.getToolDefinitions().map(tool => tool.name);
        const socialMediaToolNames = this.socialMediaTools.getToolDefinitions().map(tool => tool.name);
        const mediaToolNames = this.mediaTools.getToolDefinitions().map(tool => tool.name);
        
        if (blogToolNames.includes(toolName)) {
          return await this.blogTools.executeTool(toolName, args);
        } else if (socialMediaToolNames.includes(toolName)) {
          return await this.socialMediaTools.executeTool(toolName, args);
        } else if (mediaToolNames.includes(toolName)) {
          return await this.mediaTools.executeTool(toolName, args);
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        process.stderr.write(`[ghl-marketing] Error executing tool ${toolName}: ${error}\n`);
        throw error;
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write('ghl-marketing MCP Server running on stdio\n');
  }
}

async function main(): Promise<void> {
  const server = new GhlMarketingServer();
  await server.start();
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
}); 