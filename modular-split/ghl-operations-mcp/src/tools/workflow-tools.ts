import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import { 
  MCPGetWorkflowsParams
} from '../types/ghl-types.js';

export class WorkflowTools {
  constructor(private apiClient: GHLApiClient) {}

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return WorkflowTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return WorkflowTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      {
        name: 'ghl_get_workflows',
        description: 'Retrieve all workflows for a location. Workflows represent automation sequences that can be triggered by various events in the system.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'The location ID to get workflows for. If not provided, uses the default location from configuration.'
            }
          },
          additionalProperties: false
        }
      }
    ];
  }

  async executeTool(name: string, params: any): Promise<any> {
    try {
      switch (name) {
        case 'ghl_get_workflows':
          return await this.getWorkflows(params as MCPGetWorkflowsParams);
        
        default:
          throw new Error(`Unknown workflow tool: ${name}`);
      }
    } catch (error) {
      console.error(`Error executing workflow tool ${name}:`, error);
      throw error;
    }
  }

  // ===== WORKFLOW MANAGEMENT TOOLS =====

  /**
   * Get all workflows for a location
   */
  private async getWorkflows(params: MCPGetWorkflowsParams): Promise<any> {
    try {
      const result = await this.apiClient.getWorkflows({
        locationId: params.locationId || ''
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to get workflows: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        workflows: result.data.workflows,
        message: `Successfully retrieved ${result.data.workflows.length} workflows`,
        metadata: {
          totalWorkflows: result.data.workflows.length,
          workflowStatuses: result.data.workflows.reduce((acc: { [key: string]: number }, workflow) => {
            acc[workflow.status] = (acc[workflow.status] || 0) + 1;
            return acc;
          }, {})
        }
      };
    } catch (error) {
      console.error('Error getting workflows:', error);
      throw new Error(`Failed to get workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Helper function to check if a tool name belongs to workflow tools
export function isWorkflowTool(toolName: string): boolean {
  const workflowToolNames = [
    'ghl_get_workflows'
  ];
  
  return workflowToolNames.includes(toolName);
} 