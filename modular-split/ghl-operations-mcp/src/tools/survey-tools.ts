import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import { 
  MCPGetSurveysParams,
  MCPGetSurveySubmissionsParams
} from '../types/ghl-types.js';

export class SurveyTools {
  constructor(private apiClient: GHLApiClient) {}

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return SurveyTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return SurveyTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      {
        name: 'ghl_get_surveys',
        description: 'Retrieve all surveys for a location. Surveys are used to collect information from contacts through forms and questionnaires.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'The location ID to get surveys for. If not provided, uses the default location from configuration.'
            },
            skip: {
              type: 'number',
              description: 'Number of records to skip for pagination (default: 0)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of surveys to return (max: 50, default: 10)'
            },
            type: {
              type: 'string',
              description: 'Filter surveys by type (e.g., "folder")'
            }
          },
          additionalProperties: false
        }
      },
      {
        name: 'ghl_get_survey_submissions',
        description: 'Retrieve survey submissions with advanced filtering and pagination. Get responses from contacts who have completed surveys.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'The location ID to get submissions for. If not provided, uses the default location from configuration.'
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)'
            },
            limit: {
              type: 'number',
              description: 'Number of submissions per page (max: 100, default: 20)'
            },
            surveyId: {
              type: 'string',
              description: 'Filter submissions by specific survey ID'
            },
            q: {
              type: 'string',
              description: 'Search by contact ID, name, email, or phone number'
            },
            startAt: {
              type: 'string',
              description: 'Start date for filtering submissions (YYYY-MM-DD format)'
            },
            endAt: {
              type: 'string',
              description: 'End date for filtering submissions (YYYY-MM-DD format)'
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
        case 'ghl_get_surveys':
          return await this.getSurveys(params as MCPGetSurveysParams);
        
        case 'ghl_get_survey_submissions':
          return await this.getSurveySubmissions(params as MCPGetSurveySubmissionsParams);
        
        default:
          throw new Error(`Unknown survey tool: ${name}`);
      }
    } catch (error) {
      console.error(`Error executing survey tool ${name}:`, error);
      throw error;
    }
  }

  // ===== SURVEY MANAGEMENT TOOLS =====

  /**
   * Get all surveys for a location
   */
  private async getSurveys(params: MCPGetSurveysParams): Promise<any> {
    try {
      const result = await this.apiClient.getSurveys({
        locationId: params.locationId || '',
        skip: params.skip,
        limit: params.limit,
        type: params.type
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to get surveys: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        surveys: result.data.surveys,
        total: result.data.total,
        message: `Successfully retrieved ${result.data.surveys.length} surveys`,
        metadata: {
          totalSurveys: result.data.total,
          returnedCount: result.data.surveys.length,
          pagination: {
            skip: params.skip || 0,
            limit: params.limit || 10
          },
          ...(params.type && { filterType: params.type })
        }
      };
    } catch (error) {
      console.error('Error getting surveys:', error);
      throw new Error(`Failed to get surveys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get survey submissions with filtering
   */
  private async getSurveySubmissions(params: MCPGetSurveySubmissionsParams): Promise<any> {
    try {
      const result = await this.apiClient.getSurveySubmissions({
        locationId: params.locationId || '',
        page: params.page,
        limit: params.limit,
        surveyId: params.surveyId,
        q: params.q,
        startAt: params.startAt,
        endAt: params.endAt
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to get survey submissions: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        submissions: result.data.submissions,
        meta: result.data.meta,
        message: `Successfully retrieved ${result.data.submissions.length} survey submissions`,
        metadata: {
          totalSubmissions: result.data.meta.total,
          returnedCount: result.data.submissions.length,
          pagination: {
            currentPage: result.data.meta.currentPage,
            nextPage: result.data.meta.nextPage,
            prevPage: result.data.meta.prevPage,
            limit: params.limit || 20
          },
          filters: {
            ...(params.surveyId && { surveyId: params.surveyId }),
            ...(params.q && { search: params.q }),
            ...(params.startAt && { startDate: params.startAt }),
            ...(params.endAt && { endDate: params.endAt })
          }
        }
      };
    } catch (error) {
      console.error('Error getting survey submissions:', error);
      throw new Error(`Failed to get survey submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Helper function to check if a tool name belongs to survey tools
export function isSurveyTool(toolName: string): boolean {
  const surveyToolNames = [
    'ghl_get_surveys',
    'ghl_get_survey_submissions'
  ];
  
  return surveyToolNames.includes(toolName);
} 