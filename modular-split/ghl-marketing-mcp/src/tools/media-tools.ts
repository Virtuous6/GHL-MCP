import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPGetMediaFilesParams,
  MCPUploadMediaFileParams,
  MCPDeleteMediaParams,
  GHLGetMediaFilesRequest,
  GHLUploadMediaFileRequest,
  GHLDeleteMediaRequest
} from '../types/ghl-types.js';

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * MediaTools class for GoHighLevel Media Library API endpoints
 * Handles file management operations including listing, uploading, and deleting files/folders
 */
export class MediaTools {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Format response to MCP format
   */
  private formatResponse(data: any): any {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }]
    };
  }

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return MediaTools.getToolDefinitionsStatic();
  }

  /**
   * Get all available Media Library tool definitions
   */
  getToolDefinitions(): Tool[] {
    return MediaTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      {
        name: 'get_media_files',
        description: 'Get list of files and folders from the media library with filtering and search capabilities',
        inputSchema: {
          type: 'object',
          properties: {
            offset: { 
              type: 'number', 
              description: 'Number of files to skip in listing',
              minimum: 0
            },
            limit: { 
              type: 'number', 
              description: 'Number of files to show in the listing (max 100)',
              minimum: 1,
              maximum: 100
            },
            sortBy: { 
              type: 'string', 
              description: 'Field to sort the file listing by (e.g., createdAt, name, size)',
              default: 'createdAt'
            },
            sortOrder: { 
              type: 'string', 
              description: 'Direction to sort files (asc or desc)',
              enum: ['asc', 'desc'],
              default: 'desc'
            },
            type: { 
              type: 'string', 
              description: 'Filter by type (file or folder)',
              enum: ['file', 'folder']
            },
            query: { 
              type: 'string', 
              description: 'Search query text to filter files by name'
            },
            altType: { 
              type: 'string', 
              description: 'Context type (location or agency)',
              enum: ['location', 'agency'],
              default: 'location'
            },
            altId: { 
              type: 'string', 
              description: 'Location or Agency ID (uses default location if not provided)'
            },
            parentId: { 
              type: 'string', 
              description: 'Parent folder ID to list files within a specific folder'
            }
          },
          required: []
        }
      },
      {
        name: 'upload_media_file',
        description: 'Upload a file to the media library or add a hosted file URL (max 25MB for direct uploads)',
        inputSchema: {
          type: 'object',
          properties: {
            file: { 
              type: 'string', 
              description: 'File data (binary) for direct upload'
            },
            hosted: { 
              type: 'boolean', 
              description: 'Set to true if providing a fileUrl instead of direct file upload',
              default: false
            },
            fileUrl: { 
              type: 'string', 
              description: 'URL of hosted file (required if hosted=true)'
            },
            name: { 
              type: 'string', 
              description: 'Custom name for the uploaded file'
            },
            parentId: { 
              type: 'string', 
              description: 'Parent folder ID to upload file into'
            },
            altType: { 
              type: 'string', 
              description: 'Context type (location or agency)',
              enum: ['location', 'agency'],
              default: 'location'
            },
            altId: { 
              type: 'string', 
              description: 'Location or Agency ID (uses default location if not provided)'
            }
          },
          required: []
        }
      },
      {
        name: 'delete_media_file',
        description: 'Delete a specific file or folder from the media library',
        inputSchema: {
          type: 'object',
          properties: {
            id: { 
              type: 'string', 
              description: 'ID of the file or folder to delete'
            },
            altType: { 
              type: 'string', 
              description: 'Context type (location or agency)',
              enum: ['location', 'agency'],
              default: 'location'
            },
            altId: { 
              type: 'string', 
              description: 'Location or Agency ID (uses default location if not provided)'
            }
          },
          required: ['id']
        }
      }
    ];
  }

  /**
   * Execute a media tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_media_files':
        return this.getMediaFiles(args as MCPGetMediaFilesParams);
      
      case 'upload_media_file':
        return this.uploadMediaFile(args as MCPUploadMediaFileParams);
      
      case 'delete_media_file':
        return this.deleteMediaFile(args as MCPDeleteMediaParams);
      
      default:
        throw new Error(`Unknown media tool: ${name}`);
    }
  }

  /**
   * GET MEDIA FILES
   */
  private async getMediaFiles(params: MCPGetMediaFilesParams = {}): Promise<any> {
    try {
      const requestParams: GHLGetMediaFilesRequest = {
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
        altType: params.altType || 'location',
        altId: params.altId || this.ghlClient.getConfig().locationId,
        ...(params.offset !== undefined && { offset: params.offset }),
        ...(params.limit !== undefined && { limit: params.limit }),
        ...(params.type && { type: params.type }),
        ...(params.query && { query: params.query }),
        ...(params.parentId && { parentId: params.parentId })
      };

      const response = await this.ghlClient.getMediaFiles(requestParams);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const files = Array.isArray(response.data.files) ? response.data.files : [];
      
      return this.formatResponse({
        success: true,
        files,
        total: response.data.total,
        message: `Retrieved ${files.length} media files/folders`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get media files: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  /**
   * UPLOAD MEDIA FILE
   */
  private async uploadMediaFile(params: MCPUploadMediaFileParams): Promise<any> {
    try {
      // Validate upload parameters
      if (params.hosted && !params.fileUrl) {
        throw new Error('fileUrl is required when hosted=true');
      }
      if (!params.hosted && !params.file) {
        throw new Error('file is required when hosted=false or not specified');
      }

      const uploadData: GHLUploadMediaFileRequest = {
        altType: params.altType || 'location',
        altId: params.altId || this.ghlClient.getConfig().locationId,
        ...(params.hosted !== undefined && { hosted: params.hosted }),
        ...(params.fileUrl && { fileUrl: params.fileUrl }),
        ...(params.file && { file: params.file }),
        ...(params.name && { name: params.name }),
        ...(params.parentId && { parentId: params.parentId })
      };

      const response = await this.ghlClient.uploadMediaFile(uploadData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return this.formatResponse({
        success: true,
        fileId: response.data.fileId,
        url: response.data.url,
        message: `File uploaded successfully with ID: ${response.data.fileId}`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to upload media file: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  /**
   * DELETE MEDIA FILE
   */
  private async deleteMediaFile(params: MCPDeleteMediaParams): Promise<any> {
    try {
      const deleteParams: GHLDeleteMediaRequest = {
        id: params.id,
        altType: params.altType || 'location',
        altId: params.altId || this.ghlClient.getConfig().locationId
      };

      const response = await this.ghlClient.deleteMediaFile(deleteParams);
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return this.formatResponse({
        success: true,
        message: `Media file/folder deleted successfully`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to delete media file: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
} 