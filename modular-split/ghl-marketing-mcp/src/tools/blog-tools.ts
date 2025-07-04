/**
 * MCP Blog Tools for GoHighLevel Integration
 * Exposes blog management capabilities to ChatGPT
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPCreateBlogPostParams,
  MCPUpdateBlogPostParams,
  MCPGetBlogPostsParams,
  MCPGetBlogSitesParams,
  MCPGetBlogAuthorsParams,
  MCPGetBlogCategoriesParams,
  MCPCheckUrlSlugParams,
  GHLBlogPostStatus,
  GHLBlogPost,
  GHLBlogSite,
  GHLBlogAuthor,
  GHLBlogCategory
} from '../types/ghl-types.js';

/**
 * Blog Tools Class
 * Implements MCP tools for blog management
 */
export class BlogTools {
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
    return BlogTools.getToolDefinitionsStatic();
  }

  /**
   * Get all blog tool definitions for MCP server
   */
  getToolDefinitions(): Tool[] {
    return BlogTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
  // 1. Create Blog Post
  {
    name: 'create_blog_post',
    description: 'Create a new blog post in GoHighLevel. Requires blog ID, author ID, and category IDs which can be obtained from other blog tools.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Blog post title'
        },
        blogId: {
          type: 'string',
          description: 'Blog site ID (use get_blog_sites to find available blogs)'
        },
        content: {
          type: 'string',
          description: 'Full HTML content of the blog post'
        },
        description: {
          type: 'string',
          description: 'Short description/excerpt of the blog post'
        },
        imageUrl: {
          type: 'string',
          description: 'URL of the featured image for the blog post'
        },
        imageAltText: {
          type: 'string',
          description: 'Alt text for the featured image (for SEO and accessibility)'
        },
        urlSlug: {
          type: 'string',
          description: 'URL slug for the blog post (use check_url_slug to verify availability)'
        },
        author: {
          type: 'string',
          description: 'Author ID (use get_blog_authors to find available authors)'
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of category IDs (use get_blog_categories to find available categories)'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional array of tags for the blog post'
        },
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'],
          description: 'Publication status of the blog post',
          default: 'DRAFT'
        },
        canonicalLink: {
          type: 'string',
          description: 'Optional canonical URL for SEO'
        },
        publishedAt: {
          type: 'string',
          description: 'Optional ISO timestamp for publication date (defaults to now for PUBLISHED status)'
        }
      },
      required: ['title', 'blogId', 'content', 'description', 'imageUrl', 'imageAltText', 'urlSlug', 'author', 'categories']
    }
  },

  // 2. Update Blog Post
  {
    name: 'update_blog_post',
    description: 'Update an existing blog post in GoHighLevel. All fields except postId and blogId are optional.',
    inputSchema: {
      type: 'object',
      properties: {
        postId: {
          type: 'string',
          description: 'Blog post ID to update'
        },
        blogId: {
          type: 'string',
          description: 'Blog site ID that contains the post'
        },
        title: {
          type: 'string',
          description: 'Updated blog post title'
        },
        content: {
          type: 'string',
          description: 'Updated HTML content of the blog post'
        },
        description: {
          type: 'string',
          description: 'Updated description/excerpt of the blog post'
        },
        imageUrl: {
          type: 'string',
          description: 'Updated featured image URL'
        },
        imageAltText: {
          type: 'string',
          description: 'Updated alt text for the featured image'
        },
        urlSlug: {
          type: 'string',
          description: 'Updated URL slug (use check_url_slug to verify availability)'
        },
        author: {
          type: 'string',
          description: 'Updated author ID'
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated array of category IDs'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated array of tags'
        },
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'],
          description: 'Updated publication status'
        },
        canonicalLink: {
          type: 'string',
          description: 'Updated canonical URL'
        },
        publishedAt: {
          type: 'string',
          description: 'Updated ISO timestamp for publication date'
        }
      },
      required: ['postId', 'blogId']
    }
  },

  // 3. Get Blog Posts
  {
    name: 'get_blog_posts',
    description: 'Get blog posts from a specific blog site. Use this to list and search existing blog posts.',
    inputSchema: {
      type: 'object',
      properties: {
        blogId: {
          type: 'string',
          description: 'Blog site ID to get posts from (use get_blog_sites to find available blogs)'
        },
        limit: {
          type: 'number',
          description: 'Number of posts to retrieve (default: 10, max recommended: 50)',
          default: 10
        },
        offset: {
          type: 'number',
          description: 'Number of posts to skip for pagination (default: 0)',
          default: 0
        },
        searchTerm: {
          type: 'string',
          description: 'Optional search term to filter posts by title or content'
        },
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'],
          description: 'Optional filter by publication status'
        }
      },
      required: ['blogId']
    }
  },

  // 4. Get Blog Sites
  {
    name: 'get_blog_sites',
    description: 'Get all blog sites for the current location. Use this to find available blogs before creating or managing posts.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of blogs to retrieve (default: 10)',
          default: 10
        },
        skip: {
          type: 'number',
          description: 'Number of blogs to skip for pagination (default: 0)',
          default: 0
        },
        searchTerm: {
          type: 'string',
          description: 'Optional search term to filter blogs by name'
        }
      }
    }
  },

  // 5. Get Blog Authors
  {
    name: 'get_blog_authors',
    description: 'Get all available blog authors for the current location. Use this to find author IDs for creating blog posts.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of authors to retrieve (default: 10)',
          default: 10
        },
        offset: {
          type: 'number',
          description: 'Number of authors to skip for pagination (default: 0)',
          default: 0
        }
      }
    }
  },

  // 6. Get Blog Categories
  {
    name: 'get_blog_categories',
    description: 'Get all available blog categories for the current location. Use this to find category IDs for creating blog posts.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of categories to retrieve (default: 10)',
          default: 10
        },
        offset: {
          type: 'number',
          description: 'Number of categories to skip for pagination (default: 0)',
          default: 0
        }
      }
    }
  },

  // 7. Check URL Slug
  {
    name: 'check_url_slug',
    description: 'Check if a URL slug is available for use. Use this before creating or updating blog posts to ensure unique URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        urlSlug: {
          type: 'string',
          description: 'URL slug to check for availability'
        },
        postId: {
          type: 'string',
          description: 'Optional post ID when updating an existing post (to exclude itself from the check)'
        }
      },
      required: ['urlSlug']
    }
  }
    ];
  }

  /**
   * Execute blog tool based on tool name and arguments
   */
  /**
   * Execute a blog tool by name
   */
  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'create_blog_post':
        return this.createBlogPost(args as MCPCreateBlogPostParams);
      
      case 'update_blog_post':
        return this.updateBlogPost(args as MCPUpdateBlogPostParams);
      
      case 'get_blog_posts':
        return this.getBlogPosts(args as MCPGetBlogPostsParams);
      
      case 'get_blog_sites':
        return this.getBlogSites(args as MCPGetBlogSitesParams);
      
      case 'get_blog_authors':
        return this.getBlogAuthors(args as MCPGetBlogAuthorsParams);
      
      case 'get_blog_categories':
        return this.getBlogCategories(args as MCPGetBlogCategoriesParams);
      
      case 'check_url_slug':
        return this.checkUrlSlug(args as MCPCheckUrlSlugParams);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * CREATE BLOG POST
   */
  private async createBlogPost(params: MCPCreateBlogPostParams): Promise<any> {
    try {
      // Set default publishedAt if status is PUBLISHED and no date provided
      let publishedAt = params.publishedAt;
      if (!publishedAt && params.status === 'PUBLISHED') {
        publishedAt = new Date().toISOString();
      } else if (!publishedAt) {
        publishedAt = new Date().toISOString(); // Always provide a date
      }

      const blogPostData = {
        title: params.title,
        locationId: this.ghlClient.getConfig().locationId,
        blogId: params.blogId,
        imageUrl: params.imageUrl,
        description: params.description,
        rawHTML: params.content,
        status: (params.status as GHLBlogPostStatus) || 'DRAFT',
        imageAltText: params.imageAltText,
        categories: params.categories,
        tags: params.tags || [],
        author: params.author,
        urlSlug: params.urlSlug,
        canonicalLink: params.canonicalLink,
        publishedAt: publishedAt
      };

      const result = await this.ghlClient.createBlogPost(blogPostData);
      
      if (result.success && result.data) {
        return this.formatResponse({
          success: true,
          blogPost: result.data.data,
          message: `Blog post "${params.title}" created successfully with ID: ${result.data.data._id}`
        });
      } else {
        throw new Error('Failed to create blog post - no data returned');
      }
    } catch (error) {
      return this.formatResponse({
        error: `Failed to create blog post: ${error}`
      });
    }
  }

  /**
   * UPDATE BLOG POST
   */
  private async updateBlogPost(params: MCPUpdateBlogPostParams): Promise<any> {
    try {
      const updateData: any = {
        locationId: this.ghlClient.getConfig().locationId,
        blogId: params.blogId
      };

      // Only include fields that are provided
      if (params.title) updateData.title = params.title;
      if (params.content) updateData.rawHTML = params.content;
      if (params.description) updateData.description = params.description;
      if (params.imageUrl) updateData.imageUrl = params.imageUrl;
      if (params.imageAltText) updateData.imageAltText = params.imageAltText;
      if (params.urlSlug) updateData.urlSlug = params.urlSlug;
      if (params.author) updateData.author = params.author;
      if (params.categories) updateData.categories = params.categories;
      if (params.tags) updateData.tags = params.tags;
      if (params.status) updateData.status = params.status;
      if (params.canonicalLink) updateData.canonicalLink = params.canonicalLink;
      if (params.publishedAt) updateData.publishedAt = params.publishedAt;

      const result = await this.ghlClient.updateBlogPost(params.postId, updateData);
      
      if (result.success && result.data) {
        return this.formatResponse({
          success: true,
          blogPost: result.data.updatedBlogPost,
          message: `Blog post updated successfully`
        });
      } else {
        throw new Error('Failed to update blog post - no data returned');
      }
    } catch (error) {
      return this.formatResponse({
        error: `Failed to update blog post: ${error}`
      });
    }
  }

  /**
   * GET BLOG POSTS
   */
  private async getBlogPosts(params: MCPGetBlogPostsParams): Promise<any> {
    try {
      const searchParams = {
        locationId: this.ghlClient.getConfig().locationId,
        blogId: params.blogId,
        limit: params.limit || 10,
        offset: params.offset || 0,
        searchTerm: params.searchTerm,
        status: params.status
      };

      const result = await this.ghlClient.getBlogPosts(searchParams);
      
      if (result.success && result.data) {
        const posts = result.data.blogs || [];
        return this.formatResponse({
          success: true,
          posts: posts,
          count: posts.length,
          message: `Retrieved ${posts.length} blog posts from blog ${params.blogId}`
        });
      } else {
        throw new Error('Failed to get blog posts - no data returned');
      }
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get blog posts: ${error}`
      });
    }
  }

  /**
   * GET BLOG SITES
   */
  private async getBlogSites(params: MCPGetBlogSitesParams): Promise<any> {
    try {
      const searchParams = {
        locationId: this.ghlClient.getConfig().locationId,
        skip: params.skip || 0,
        limit: params.limit || 10,
        searchTerm: params.searchTerm
      };

      const result = await this.ghlClient.getBlogSites(searchParams);
      
      if (result.success && result.data) {
        const sites = result.data.data || [];
        return this.formatResponse({
          success: true,
          sites: sites,
          count: sites.length,
          message: `Retrieved ${sites.length} blog sites`
        });
      } else {
        throw new Error('Failed to get blog sites - no data returned');
      }
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get blog sites: ${error}`
      });
    }
  }

  /**
   * GET BLOG AUTHORS
   */
  private async getBlogAuthors(params: MCPGetBlogAuthorsParams): Promise<any> {
    try {
      const searchParams = {
        locationId: this.ghlClient.getConfig().locationId,
        limit: params.limit || 10,
        offset: params.offset || 0
      };

      const result = await this.ghlClient.getBlogAuthors(searchParams);
      
      if (result.success && result.data) {
        const authors = result.data.authors || [];
        return this.formatResponse({
          success: true,
          authors: authors,
          count: authors.length,
          message: `Retrieved ${authors.length} blog authors`
        });
      } else {
        throw new Error('Failed to get blog authors - no data returned');
      }
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get blog authors: ${error}`
      });
    }
  }

  /**
   * GET BLOG CATEGORIES
   */
  private async getBlogCategories(params: MCPGetBlogCategoriesParams): Promise<any> {
    try {
      const searchParams = {
        locationId: this.ghlClient.getConfig().locationId,
        limit: params.limit || 10,
        offset: params.offset || 0
      };

      const result = await this.ghlClient.getBlogCategories(searchParams);
      
      if (result.success && result.data) {
        const categories = result.data.categories || [];
        return this.formatResponse({
          success: true,
          categories: categories,
          count: categories.length,
          message: `Retrieved ${categories.length} blog categories`
        });
      } else {
        throw new Error('Failed to get blog categories - no data returned');
      }
    } catch (error) {
      return this.formatResponse({
        error: `Failed to get blog categories: ${error}`
      });
    }
  }

  /**
   * CHECK URL SLUG
   */
  private async checkUrlSlug(params: MCPCheckUrlSlugParams): Promise<any> {
    try {
      const checkParams = {
        locationId: this.ghlClient.getConfig().locationId,
        urlSlug: params.urlSlug,
        postId: params.postId
      };

      const result = await this.ghlClient.checkUrlSlugExists(checkParams);
      
      if (result.success && result.data !== undefined) {
        const exists = result.data.exists;
        return this.formatResponse({
          success: true,
          urlSlug: params.urlSlug,
          exists: exists,
          available: !exists,
          message: exists 
            ? `URL slug "${params.urlSlug}" is already in use` 
            : `URL slug "${params.urlSlug}" is available`
        });
      } else {
        throw new Error('Failed to check URL slug - no data returned');
      }
    } catch (error) {
      return this.formatResponse({
        error: `Failed to check URL slug: ${error}`
      });
    }
  }
} 