import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPSearchPostsParams,
  MCPCreatePostParams,
  MCPGetPostParams,
  MCPUpdatePostParams,
  MCPDeletePostParams,
  MCPBulkDeletePostsParams,
  MCPGetAccountsParams,
  MCPDeleteAccountParams,
  MCPUploadCSVParams,
  MCPGetUploadStatusParams,
  MCPSetAccountsParams,
  MCPGetCSVPostParams,
  MCPFinalizeCSVParams,
  MCPDeleteCSVParams,
  MCPDeleteCSVPostParams,
  MCPGetCategoriesParams,
  MCPGetCategoryParams,
  MCPGetTagsParams,
  MCPGetTagsByIdsParams,
  MCPStartOAuthParams,
  MCPGetOAuthAccountsParams,
  MCPAttachOAuthAccountParams
} from '../types/ghl-types.js';

export class SocialMediaTools {
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
    return SocialMediaTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return SocialMediaTools.getToolDefinitionsStatic();
  }

  getTools(): Tool[] {
    return this.getToolDefinitions();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      // Post Management Tools
      {
        name: 'search_social_posts',
        description: 'Search and filter social media posts across all platforms',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['recent', 'all', 'scheduled', 'draft', 'failed', 'in_review', 'published', 'in_progress', 'deleted'],
              description: 'Filter posts by status',
              default: 'all'
            },
            accounts: {
              type: 'string',
              description: 'Comma-separated account IDs to filter by'
            },
            skip: { type: 'number', description: 'Number of posts to skip', default: 0 },
            limit: { type: 'number', description: 'Number of posts to return', default: 10 },
            fromDate: { type: 'string', description: 'Start date (ISO format)' },
            toDate: { type: 'string', description: 'End date (ISO format)' },
            includeUsers: { type: 'boolean', description: 'Include user data in response', default: true },
            postType: {
              type: 'string',
              enum: ['post', 'story', 'reel'],
              description: 'Type of post to search for'
            }
          },
          required: ['fromDate', 'toDate']
        }
      },
      {
        name: 'create_social_post',
        description: 'Create a new social media post for multiple platforms',
        inputSchema: {
          type: 'object',
          properties: {
            accountIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of social media account IDs to post to'
            },
            summary: { type: 'string', description: 'Post content/text' },
            media: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'Media URL' },
                  caption: { type: 'string', description: 'Media caption' },
                  type: { type: 'string', description: 'Media MIME type' }
                },
                required: ['url']
              },
              description: 'Media attachments'
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'published'],
              description: 'Post status',
              default: 'draft'
            },
            scheduleDate: { type: 'string', description: 'Schedule date for post (ISO format)' },
            followUpComment: { type: 'string', description: 'Follow-up comment' },
            type: {
              type: 'string',
              enum: ['post', 'story', 'reel'],
              description: 'Type of post'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tag IDs to associate with post'
            },
            categoryId: { type: 'string', description: 'Category ID' },
            userId: { type: 'string', description: 'User ID creating the post' }
          },
          required: ['accountIds', 'summary', 'type']
        }
      },
      {
        name: 'get_social_post',
        description: 'Get details of a specific social media post',
        inputSchema: {
          type: 'object',
          properties: {
            postId: { type: 'string', description: 'Social media post ID' }
          },
          required: ['postId']
        }
      },
      {
        name: 'update_social_post',
        description: 'Update an existing social media post',
        inputSchema: {
          type: 'object',
          properties: {
            postId: { type: 'string', description: 'Social media post ID' },
            summary: { type: 'string', description: 'Updated post content' },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'published'],
              description: 'Updated post status'
            },
            scheduleDate: { type: 'string', description: 'Updated schedule date' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Updated tag IDs'
            }
          },
          required: ['postId']
        }
      },
      {
        name: 'delete_social_post',
        description: 'Delete a social media post',
        inputSchema: {
          type: 'object',
          properties: {
            postId: { type: 'string', description: 'Social media post ID to delete' }
          },
          required: ['postId']
        }
      },
      {
        name: 'bulk_delete_social_posts',
        description: 'Delete multiple social media posts at once (max 50)',
        inputSchema: {
          type: 'object',
          properties: {
            postIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of post IDs to delete',
              maxItems: 50
            }
          },
          required: ['postIds']
        }
      },

      // Account Management Tools
      {
        name: 'get_social_accounts',
        description: 'Get all connected social media accounts and groups',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: 'delete_social_account',
        description: 'Delete a social media account connection',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: { type: 'string', description: 'Account ID to delete' },
            companyId: { type: 'string', description: 'Company ID' },
            userId: { type: 'string', description: 'User ID' }
          },
          required: ['accountId']
        }
      },

      // CSV Operations Tools
      {
        name: 'upload_social_csv',
        description: 'Upload CSV file for bulk social media posts',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'CSV file data (base64 or file path)' }
          },
          required: ['file']
        }
      },
      {
        name: 'get_csv_upload_status',
        description: 'Get status of CSV uploads',
        inputSchema: {
          type: 'object',
          properties: {
            skip: { type: 'number', description: 'Number to skip', default: 0 },
            limit: { type: 'number', description: 'Number to return', default: 10 },
            includeUsers: { type: 'boolean', description: 'Include user data' },
            userId: { type: 'string', description: 'Filter by user ID' }
          }
        }
      },
      {
        name: 'set_csv_accounts',
        description: 'Set accounts for CSV import processing',
        inputSchema: {
          type: 'object',
          properties: {
            accountIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Account IDs for CSV import'
            },
            filePath: { type: 'string', description: 'CSV file path' },
            rowsCount: { type: 'number', description: 'Number of rows to process' },
            fileName: { type: 'string', description: 'CSV file name' },
            approver: { type: 'string', description: 'Approver user ID' },
            userId: { type: 'string', description: 'User ID' }
          },
          required: ['accountIds', 'filePath', 'rowsCount', 'fileName']
        }
      },

      // Categories & Tags Tools
      {
        name: 'get_social_categories',
        description: 'Get social media post categories',
        inputSchema: {
          type: 'object',
          properties: {
            searchText: { type: 'string', description: 'Search for categories' },
            limit: { type: 'number', description: 'Number to return', default: 10 },
            skip: { type: 'number', description: 'Number to skip', default: 0 }
          }
        }
      },
      {
        name: 'get_social_category',
        description: 'Get a specific social media category by ID',
        inputSchema: {
          type: 'object',
          properties: {
            categoryId: { type: 'string', description: 'Category ID' }
          },
          required: ['categoryId']
        }
      },
      {
        name: 'get_social_tags',
        description: 'Get social media post tags',
        inputSchema: {
          type: 'object',
          properties: {
            searchText: { type: 'string', description: 'Search for tags' },
            limit: { type: 'number', description: 'Number to return', default: 10 },
            skip: { type: 'number', description: 'Number to skip', default: 0 }
          }
        }
      },
      {
        name: 'get_social_tags_by_ids',
        description: 'Get specific social media tags by their IDs',
        inputSchema: {
          type: 'object',
          properties: {
            tagIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of tag IDs'
            }
          },
          required: ['tagIds']
        }
      },

      // OAuth Integration Tools
      {
        name: 'start_social_oauth',
        description: 'Start OAuth process for social media platform',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'tiktok-business'],
              description: 'Social media platform'
            },
            userId: { type: 'string', description: 'User ID initiating OAuth' },
            page: { type: 'string', description: 'Page context' },
            reconnect: { type: 'boolean', description: 'Whether this is a reconnection' }
          },
          required: ['platform', 'userId']
        }
      },
      {
        name: 'get_platform_accounts',
        description: 'Get available accounts for a specific platform after OAuth',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'tiktok-business'],
              description: 'Social media platform'
            },
            accountId: { type: 'string', description: 'OAuth account ID' }
          },
          required: ['platform', 'accountId']
        }
      }
    ];
  }

  async executeTool(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'search_social_posts':
          return await this.searchSocialPosts(args);
        case 'create_social_post':
          return await this.createSocialPost(args);
        case 'get_social_post':
          return await this.getSocialPost(args);
        case 'update_social_post':
          return await this.updateSocialPost(args);
        case 'delete_social_post':
          return await this.deleteSocialPost(args);
        case 'bulk_delete_social_posts':
          return await this.bulkDeleteSocialPosts(args);
        case 'get_social_accounts':
          return await this.getSocialAccounts(args);
        case 'delete_social_account':
          return await this.deleteSocialAccount(args);
        case 'get_social_categories':
          return await this.getSocialCategories(args);
        case 'get_social_category':
          return await this.getSocialCategory(args);
        case 'get_social_tags':
          return await this.getSocialTags(args);
        case 'get_social_tags_by_ids':
          return await this.getSocialTagsByIds(args);
        case 'start_social_oauth':
          return await this.startSocialOAuth(args);
        case 'get_platform_accounts':
          return await this.getPlatformAccounts(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      throw new Error(`Error executing ${name}: ${error}`);
    }
  }

  // Implementation methods
  private async searchSocialPosts(params: MCPSearchPostsParams) {
    try {
      const response = await this.ghlClient.searchSocialPosts({
        type: params.type,
        accounts: params.accounts,
        skip: params.skip?.toString(),
        limit: params.limit?.toString(),
        fromDate: params.fromDate,
        toDate: params.toDate,
        includeUsers: params.includeUsers?.toString() || 'true',
        postType: params.postType
      });

      return this.formatResponse({
        success: true,
        posts: response.data?.posts || [],
        count: response.data?.count || 0,
        message: `Found ${response.data?.count || 0} social media posts`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to search social posts: ${error}`
      });
    }
  }

  private async createSocialPost(params: MCPCreatePostParams) {
    try {
      const response = await this.ghlClient.createSocialPost({
        accountIds: params.accountIds,
        summary: params.summary,
        media: params.media,
        status: params.status,
        scheduleDate: params.scheduleDate,
        followUpComment: params.followUpComment,
        type: params.type,
        tags: params.tags,
        categoryId: params.categoryId,
        userId: params.userId
      });

      return this.formatResponse({
        success: true,
        post: response.data?.post,
        message: `Social media post created successfully`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to create social post: ${error}`
      });
    }
  }

  private async getSocialPost(params: MCPGetPostParams) {
    try {
      const response = await this.ghlClient.getSocialPost(params.postId);
      
      return this.formatResponse({
        success: true,
        post: response.data?.post,
        message: `Retrieved social media post ${params.postId}`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get social post: ${error}`
      });
    }
  }

  private async updateSocialPost(params: MCPUpdatePostParams) {
    try {
      const { postId, ...updateData } = params;
      const response = await this.ghlClient.updateSocialPost(postId, updateData);
      
      return this.formatResponse({
        success: true,
        message: `Social media post ${postId} updated successfully`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to update social post: ${error}`
      });
    }
  }

  private async deleteSocialPost(params: MCPDeletePostParams) {
    try {
      const response = await this.ghlClient.deleteSocialPost(params.postId);
      
      return this.formatResponse({
        success: true,
        message: `Social media post ${params.postId} deleted successfully`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to delete social post: ${error}`
      });
    }
  }

  private async bulkDeleteSocialPosts(params: MCPBulkDeletePostsParams) {
    try {
      const response = await this.ghlClient.bulkDeleteSocialPosts({ postIds: params.postIds });
      
      return this.formatResponse({
        success: true,
        deletedCount: response.data?.deletedCount || 0,
        message: `${response.data?.deletedCount || 0} social media posts deleted successfully`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to bulk delete social posts: ${error}`
      });
    }
  }

  private async getSocialAccounts(params: MCPGetAccountsParams) {
    try {
      const response = await this.ghlClient.getSocialAccounts();
      
      return this.formatResponse({
        success: true,
        accounts: response.data?.accounts || [],
        groups: response.data?.groups || [],
        message: `Retrieved ${response.data?.accounts?.length || 0} social media accounts and ${response.data?.groups?.length || 0} groups`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get social accounts: ${error}`
      });
    }
  }

  private async deleteSocialAccount(params: MCPDeleteAccountParams) {
    try {
      const response = await this.ghlClient.deleteSocialAccount(
        params.accountId,
        params.companyId,
        params.userId
      );
      
      return this.formatResponse({
        success: true,
        message: `Social media account ${params.accountId} deleted successfully`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to delete social account: ${error}`
      });
    }
  }

  private async getSocialCategories(params: MCPGetCategoriesParams) {
    try {
      const response = await this.ghlClient.getSocialCategories(
        params.searchText,
        params.limit,
        params.skip
      );
      
      return this.formatResponse({
        success: true,
        categories: response.data?.categories || [],
        count: response.data?.count || 0,
        message: `Retrieved ${response.data?.count || 0} social media categories`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get social categories: ${error}`
      });
    }
  }

  private async getSocialCategory(params: MCPGetCategoryParams) {
    try {
      const response = await this.ghlClient.getSocialCategory(params.categoryId);
      
      return this.formatResponse({
        success: true,
        category: response.data?.category,
        message: `Retrieved social media category ${params.categoryId}`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get social category: ${error}`
      });
    }
  }

  private async getSocialTags(params: MCPGetTagsParams) {
    try {
      const response = await this.ghlClient.getSocialTags(
        params.searchText,
        params.limit,
        params.skip
      );
      
      return this.formatResponse({
        success: true,
        tags: response.data?.tags || [],
        count: response.data?.count || 0,
        message: `Retrieved ${response.data?.count || 0} social media tags`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get social tags: ${error}`
      });
    }
  }

  private async getSocialTagsByIds(params: MCPGetTagsByIdsParams) {
    try {
      const response = await this.ghlClient.getSocialTagsByIds({ tagIds: params.tagIds });
      
      return this.formatResponse({
        success: true,
        tags: response.data?.tags || [],
        count: response.data?.count || 0,
        message: `Retrieved ${response.data?.count || 0} social media tags by IDs`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get social tags by IDs: ${error}`
      });
    }
  }

  private async startSocialOAuth(params: MCPStartOAuthParams) {
    try {
      const response = await this.ghlClient.startSocialOAuth(
        params.platform,
        params.userId,
        params.page,
        params.reconnect
      );
      
      return this.formatResponse({
        success: true,
        oauthData: response.data,
        message: `OAuth process started for ${params.platform}`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to start social OAuth: ${error}`
      });
    }
  }

  private async getPlatformAccounts(params: MCPGetOAuthAccountsParams) {
    try {
      let response;
      
      switch (params.platform) {
        case 'google':
          response = await this.ghlClient.getGoogleBusinessLocations(params.accountId);
          break;
        case 'facebook':
          response = await this.ghlClient.getFacebookPages(params.accountId);
          break;
        case 'instagram':
          response = await this.ghlClient.getInstagramAccounts(params.accountId);
          break;
        case 'linkedin':
          response = await this.ghlClient.getLinkedInAccounts(params.accountId);
          break;
        case 'twitter':
          response = await this.ghlClient.getTwitterProfile(params.accountId);
          break;
        case 'tiktok':
          response = await this.ghlClient.getTikTokProfile(params.accountId);
          break;
        case 'tiktok-business':
          response = await this.ghlClient.getTikTokBusinessProfile(params.accountId);
          break;
        default:
          throw new Error(`Unsupported platform: ${params.platform}`);
      }
      
      return this.formatResponse({
        success: true,
        platformAccounts: response.data,
        message: `Retrieved ${params.platform} accounts for OAuth ID ${params.accountId}`
      });
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get platform accounts: ${error}`
      });
    }
  }
} 