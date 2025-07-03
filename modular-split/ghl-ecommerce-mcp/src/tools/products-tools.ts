/**
 * GoHighLevel Products API Tools for MCP Server
 * Provides comprehensive tools for managing products, prices, inventory, collections, and reviews
 */

import {
  // MCP Product Types
  MCPCreateProductParams,
  MCPUpdateProductParams,
  MCPListProductsParams,
  MCPGetProductParams,
  MCPDeleteProductParams,
  MCPCreatePriceParams,
  MCPUpdatePriceParams,
  MCPListPricesParams,
  MCPGetPriceParams,
  MCPDeletePriceParams,
  MCPBulkUpdateProductsParams,
  MCPListInventoryParams,
  MCPUpdateInventoryParams,
  MCPGetProductStoreStatsParams,
  MCPUpdateProductStoreParams,
  MCPCreateProductCollectionParams,
  MCPUpdateProductCollectionParams,
  MCPListProductCollectionsParams,
  MCPGetProductCollectionParams,
  MCPDeleteProductCollectionParams,
  MCPListProductReviewsParams,
  MCPGetReviewsCountParams,
  MCPUpdateProductReviewParams,
  MCPDeleteProductReviewParams,
  MCPBulkUpdateProductReviewsParams,
  // API Client Types
  GHLCreateProductRequest,
  GHLUpdateProductRequest,
  GHLListProductsRequest,
  GHLGetProductRequest,
  GHLDeleteProductRequest,
  GHLCreatePriceRequest,
  GHLUpdatePriceRequest,
  GHLListPricesRequest,
  GHLGetPriceRequest,
  GHLDeletePriceRequest,
  GHLBulkUpdateRequest,
  GHLListInventoryRequest,
  GHLUpdateInventoryRequest,
  GHLGetProductStoreStatsRequest,
  GHLUpdateProductStoreRequest,
  GHLCreateProductCollectionRequest,
  GHLUpdateProductCollectionRequest,
  GHLListProductCollectionsRequest,
  GHLGetProductCollectionRequest,
  GHLDeleteProductCollectionRequest,
  GHLListProductReviewsRequest,
  GHLGetReviewsCountRequest,
  GHLUpdateProductReviewRequest,
  GHLDeleteProductReviewRequest,
  GHLBulkUpdateProductReviewsRequest
} from '../types/ghl-types.js';

import { GHLApiClient } from '../clients/ghl-api-client.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface ProductsToolResult {
  content: {
    type: 'text';
    text: string;
  }[];
}

export class ProductsTools {
  constructor(private apiClient: GHLApiClient) {}

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return ProductsTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return ProductsTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      // Product Management Tools
      {
        name: 'ghl_create_product',
        description: 'Create a new product in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Product name' },
            productType: { 
              type: 'string', 
              enum: ['DIGITAL', 'PHYSICAL', 'SERVICE', 'PHYSICAL/DIGITAL'],
              description: 'Type of product' 
            },
            description: { type: 'string', description: 'Product description' },
            image: { type: 'string', description: 'Product image URL' },
            availableInStore: { type: 'boolean', description: 'Whether product is available in store' },
            slug: { type: 'string', description: 'Product URL slug' }
          },
          required: ['name', 'productType']
        }
      },
      {
        name: 'ghl_list_products',
        description: 'List products with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of products to return' },
            offset: { type: 'number', description: 'Number of products to skip' },
            search: { type: 'string', description: 'Search term for product names' },
            storeId: { type: 'string', description: 'Filter by store ID' },
            includedInStore: { type: 'boolean', description: 'Filter by store inclusion status' },
            availableInStore: { type: 'boolean', description: 'Filter by store availability' }
          },
          required: []
        }
      },
      {
        name: 'ghl_get_product',
        description: 'Get a specific product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to retrieve' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['productId']
        }
      },
      {
        name: 'ghl_update_product',
        description: 'Update an existing product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to update' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Product name' },
            productType: { 
              type: 'string', 
              enum: ['DIGITAL', 'PHYSICAL', 'SERVICE', 'PHYSICAL/DIGITAL'],
              description: 'Type of product' 
            },
            description: { type: 'string', description: 'Product description' },
            image: { type: 'string', description: 'Product image URL' },
            availableInStore: { type: 'boolean', description: 'Whether product is available in store' }
          },
          required: ['productId']
        }
      },
      {
        name: 'ghl_delete_product',
        description: 'Delete a product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to delete' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['productId']
        }
      },
      {
        name: 'ghl_create_price',
        description: 'Create a price for a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to create price for' },
            name: { type: 'string', description: 'Price name/variant name' },
            type: { 
              type: 'string', 
              enum: ['one_time', 'recurring'],
              description: 'Price type' 
            },
            currency: { type: 'string', description: 'Currency code (e.g., USD)' },
            amount: { type: 'number', description: 'Price amount in cents' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            compareAtPrice: { type: 'number', description: 'Compare at price (for discounts)' }
          },
          required: ['productId', 'name', 'type', 'currency', 'amount']
        }
      },
      {
        name: 'ghl_list_prices',
        description: 'List prices for a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to list prices for' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of prices to return' },
            offset: { type: 'number', description: 'Number of prices to skip' }
          },
          required: ['productId']
        }
      },
      {
        name: 'ghl_list_inventory',
        description: 'List inventory items with stock levels',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of items to return' },
            offset: { type: 'number', description: 'Number of items to skip' },
            search: { type: 'string', description: 'Search term for inventory items' }
          },
          required: []
        }
      },
      {
        name: 'ghl_create_product_collection',
        description: 'Create a new product collection',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Collection name' },
            slug: { type: 'string', description: 'Collection URL slug' },
            image: { type: 'string', description: 'Collection image URL' },
            seo: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'SEO title' },
                description: { type: 'string', description: 'SEO description' }
              }
            }
          },
          required: ['name', 'slug']
        }
      },
      {
        name: 'ghl_list_product_collections',
        description: 'List product collections',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of collections to return' },
            offset: { type: 'number', description: 'Number of collections to skip' },
            name: { type: 'string', description: 'Search by collection name' }
          },
          required: []
        }
      }
    ];
  }

  /**
   * Execute a products tool by name
   */
  async executeTool(toolName: string, params: any): Promise<any> {
    switch (toolName) {
      case 'ghl_create_product':
        return this.createProduct(params);
      case 'ghl_list_products':
        return this.listProducts(params);
      case 'ghl_get_product':
        return this.getProduct(params);
      case 'ghl_update_product':
        return this.updateProduct(params);
      case 'ghl_delete_product':
        return this.deleteProduct(params);
      case 'ghl_create_price':
        return this.createPrice(params);
      case 'ghl_list_prices':
        return this.listPrices(params);
      case 'ghl_list_inventory':
        return this.listInventory(params);
      case 'ghl_create_product_collection':
        return this.createProductCollection(params);
      case 'ghl_list_product_collections':
        return this.listProductCollections(params);
      default:
        return {
          content: [{
            type: 'text',
            text: `❌ **Unknown Tool:** ${toolName}`
          }]
        };
    }
  }

  // Product Operations
  async createProduct(params: MCPCreateProductParams): Promise<ProductsToolResult> {
    try {
      const request: GHLCreateProductRequest = {
        ...params,
        locationId: params.locationId || this.apiClient.getConfig().locationId
      };

      const response = await this.apiClient.createProduct(request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return {
        content: [{
          type: 'text',
          text: `🛍️ **Product Created Successfully!**

📦 **Product Details:**
• **ID:** ${response.data._id}
• **Name:** ${response.data.name}
• **Type:** ${response.data.productType}
• **Location:** ${response.data.locationId}
• **Available in Store:** ${response.data.availableInStore ? '✅ Yes' : '❌ No'}
• **Created:** ${new Date(response.data.createdAt).toLocaleString()}

${response.data.description ? `📝 **Description:** ${response.data.description}` : ''}
${response.data.image ? `🖼️ **Image:** ${response.data.image}` : ''}
${response.data.collectionIds?.length ? `📂 **Collections:** ${response.data.collectionIds.length} assigned` : ''}
${response.data.variants?.length ? `🔧 **Variants:** ${response.data.variants.length} configured` : ''}
${response.data.medias?.length ? `📸 **Media Files:** ${response.data.medias.length} attached` : ''}

✨ **Status:** Product successfully created and ready for configuration!`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Creating Product**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async listProducts(params: MCPListProductsParams): Promise<ProductsToolResult> {
    try {
      const request: GHLListProductsRequest = {
        ...params,
        locationId: params.locationId || this.apiClient.getConfig().locationId
      };

      const response = await this.apiClient.listProducts(request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const products = response.data.products;
      const total = response.data.total[0]?.total || 0;
      
      return {
        content: [{
          type: 'text',
          text: `🛍️ **Products List** (${products.length} of ${total} total)

${products.length === 0 ? '📭 **No products found**' : products.map((product, index) => `
**${index + 1}. ${product.name}** (${product.productType})
• **ID:** ${product._id}
• **Store Status:** ${product.availableInStore ? '✅ Available' : '❌ Not Available'}
• **Created:** ${new Date(product.createdAt).toLocaleString()}
${product.description ? `• **Description:** ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}` : ''}
${product.collectionIds?.length ? `• **Collections:** ${product.collectionIds.length}` : ''}
`).join('\n')}

📊 **Summary:**
• **Total Products:** ${total}
• **Displayed:** ${products.length}
${params.search ? `• **Search:** "${params.search}"` : ''}
${params.storeId ? `• **Store Filter:** ${params.storeId}` : ''}
${params.includedInStore !== undefined ? `• **Store Status:** ${params.includedInStore ? 'Included only' : 'Excluded only'}` : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Listing Products**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  getTools(): Tool[] {
    return [
      // Product Management Tools
      {
        name: 'ghl_create_product',
        description: 'Create a new product in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Product name' },
            productType: { 
              type: 'string', 
              enum: ['DIGITAL', 'PHYSICAL', 'SERVICE', 'PHYSICAL/DIGITAL'],
              description: 'Type of product' 
            },
            description: { type: 'string', description: 'Product description' },
            image: { type: 'string', description: 'Product image URL' },
            availableInStore: { type: 'boolean', description: 'Whether product is available in store' },
            slug: { type: 'string', description: 'Product URL slug' }
          },
          required: ['name', 'productType']
        }
      },
      {
        name: 'ghl_list_products',
        description: 'List products with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of products to return' },
            offset: { type: 'number', description: 'Number of products to skip' },
            search: { type: 'string', description: 'Search term for product names' },
            storeId: { type: 'string', description: 'Filter by store ID' },
            includedInStore: { type: 'boolean', description: 'Filter by store inclusion status' },
            availableInStore: { type: 'boolean', description: 'Filter by store availability' }
          },
          required: []
        }
      },
      {
        name: 'ghl_get_product',
        description: 'Get a specific product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to retrieve' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['productId']
        }
      },
      {
        name: 'ghl_update_product',
        description: 'Update an existing product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to update' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Product name' },
            productType: { 
              type: 'string', 
              enum: ['DIGITAL', 'PHYSICAL', 'SERVICE', 'PHYSICAL/DIGITAL'],
              description: 'Type of product' 
            },
            description: { type: 'string', description: 'Product description' },
            image: { type: 'string', description: 'Product image URL' },
            availableInStore: { type: 'boolean', description: 'Whether product is available in store' }
          },
          required: ['productId']
        }
      },
      {
        name: 'ghl_delete_product',
        description: 'Delete a product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to delete' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['productId']
        }
      },

      // Price Management Tools
      {
        name: 'ghl_create_price',
        description: 'Create a price for a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to create price for' },
            name: { type: 'string', description: 'Price name/variant name' },
            type: { 
              type: 'string', 
              enum: ['one_time', 'recurring'],
              description: 'Price type' 
            },
            currency: { type: 'string', description: 'Currency code (e.g., USD)' },
            amount: { type: 'number', description: 'Price amount in cents' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            compareAtPrice: { type: 'number', description: 'Compare at price (for discounts)' }
          },
          required: ['productId', 'name', 'type', 'currency', 'amount']
        }
      },
      {
        name: 'ghl_list_prices',
        description: 'List prices for a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID to list prices for' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of prices to return' },
            offset: { type: 'number', description: 'Number of prices to skip' }
          },
          required: ['productId']
        }
      },

      // Inventory Tools
      {
        name: 'ghl_list_inventory',
        description: 'List inventory items with stock levels',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of items to return' },
            offset: { type: 'number', description: 'Number of items to skip' },
            search: { type: 'string', description: 'Search term for inventory items' }
          },
          required: []
        }
      },

      // Collection Tools
      {
        name: 'ghl_create_product_collection',
        description: 'Create a new product collection',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Collection name' },
            slug: { type: 'string', description: 'Collection URL slug' },
            image: { type: 'string', description: 'Collection image URL' },
            seo: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'SEO title' },
                description: { type: 'string', description: 'SEO description' }
              }
            }
          },
          required: ['name', 'slug']
        }
      },
      {
        name: 'ghl_list_product_collections',
        description: 'List product collections',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Maximum number of collections to return' },
            offset: { type: 'number', description: 'Number of collections to skip' },
            name: { type: 'string', description: 'Search by collection name' }
          },
          required: []
        }
      }
    ];
  }

  async executeProductsTool(toolName: string, params: any): Promise<ProductsToolResult> {
    switch (toolName) {
      case 'ghl_create_product':
        return this.createProduct(params as MCPCreateProductParams);
      case 'ghl_list_products':
        return this.listProducts(params as MCPListProductsParams);
      case 'ghl_get_product':
        return this.getProduct(params as MCPGetProductParams);
      case 'ghl_update_product':
        return this.updateProduct(params as MCPUpdateProductParams);
      case 'ghl_delete_product':
        return this.deleteProduct(params as MCPDeleteProductParams);
      case 'ghl_create_price':
        return this.createPrice(params as MCPCreatePriceParams);
      case 'ghl_list_prices':
        return this.listPrices(params as MCPListPricesParams);
      case 'ghl_list_inventory':
        return this.listInventory(params as MCPListInventoryParams);
      case 'ghl_create_product_collection':
        return this.createProductCollection(params as MCPCreateProductCollectionParams);
      case 'ghl_list_product_collections':
        return this.listProductCollections(params as MCPListProductCollectionsParams);
      default:
        return {
          content: [{
            type: 'text',
            text: `❌ **Unknown Products Tool**: ${toolName}`
          }]
        };
    }
  }

  // Additional Product Operations
  async getProduct(params: MCPGetProductParams): Promise<ProductsToolResult> {
    try {
      const response = await this.apiClient.getProduct(
        params.productId,
        params.locationId || this.apiClient.getConfig().locationId
      );
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return {
        content: [{
          type: 'text',
          text: `🛍️ **Product Details**

📦 **${response.data.name}** (${response.data.productType})
• **ID:** ${response.data._id}
• **Location:** ${response.data.locationId}
• **Available in Store:** ${response.data.availableInStore ? '✅ Yes' : '❌ No'}
• **Created:** ${new Date(response.data.createdAt).toLocaleString()}
• **Updated:** ${new Date(response.data.updatedAt).toLocaleString()}

${response.data.description ? `📝 **Description:** ${response.data.description}` : ''}
${response.data.image ? `🖼️ **Image:** ${response.data.image}` : ''}
${response.data.slug ? `🔗 **Slug:** ${response.data.slug}` : ''}
${response.data.collectionIds?.length ? `📂 **Collections:** ${response.data.collectionIds.length} assigned` : ''}
${response.data.variants?.length ? `🔧 **Variants:** ${response.data.variants.length} configured` : ''}
${response.data.medias?.length ? `📸 **Media Files:** ${response.data.medias.length} attached` : ''}
${response.data.isTaxesEnabled ? `💰 **Taxes:** Enabled` : ''}
${response.data.isLabelEnabled ? `🏷️ **Labels:** Enabled` : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Getting Product**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async updateProduct(params: MCPUpdateProductParams): Promise<ProductsToolResult> {
    try {
      const request: GHLUpdateProductRequest = {
        ...params,
        locationId: params.locationId || this.apiClient.getConfig().locationId
      };

      const response = await this.apiClient.updateProduct(params.productId, request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return {
        content: [{
          type: 'text',
          text: `✅ **Product Updated Successfully!**

📦 **Updated Product:**
• **ID:** ${response.data._id}
• **Name:** ${response.data.name}
• **Type:** ${response.data.productType}
• **Available in Store:** ${response.data.availableInStore ? '✅ Yes' : '❌ No'}
• **Last Updated:** ${new Date(response.data.updatedAt).toLocaleString()}

🔄 **Product has been successfully updated with the new information!**`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Updating Product**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async deleteProduct(params: MCPDeleteProductParams): Promise<ProductsToolResult> {
    try {
      const response = await this.apiClient.deleteProduct(
        params.productId,
        params.locationId || this.apiClient.getConfig().locationId
      );
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return {
        content: [{
          type: 'text',
          text: `🗑️ **Product Deleted Successfully!**

✅ **Status:** ${response.data.status ? 'Product successfully deleted' : 'Deletion failed'}
🗂️ **Product ID:** ${params.productId}

⚠️ **Note:** This action cannot be undone. The product and all associated data have been permanently removed.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Deleting Product**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async createPrice(params: MCPCreatePriceParams): Promise<ProductsToolResult> {
    try {
      const request: GHLCreatePriceRequest = {
        ...params,
        locationId: params.locationId || this.apiClient.getConfig().locationId
      };

      const response = await this.apiClient.createPrice(params.productId, request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return {
        content: [{
          type: 'text',
          text: `💰 **Price Created Successfully!**

🏷️ **Price Details:**
• **ID:** ${response.data._id}
• **Name:** ${response.data.name}
• **Type:** ${response.data.type}
• **Amount:** ${response.data.amount / 100} ${response.data.currency}
• **Product ID:** ${response.data.product}
• **Created:** ${new Date(response.data.createdAt).toLocaleString()}

${response.data.compareAtPrice ? `💸 **Compare At:** ${response.data.compareAtPrice / 100} ${response.data.currency}` : ''}
${response.data.recurring ? `🔄 **Recurring:** ${response.data.recurring.intervalCount} ${response.data.recurring.interval}(s)` : ''}
${response.data.sku ? `📦 **SKU:** ${response.data.sku}` : ''}

✨ **Price is ready for use in your product catalog!**`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Creating Price**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async listPrices(params: MCPListPricesParams): Promise<ProductsToolResult> {
    try {
      const request: GHLListPricesRequest = {
        ...params,
        locationId: params.locationId || this.apiClient.getConfig().locationId
      };

      const response = await this.apiClient.listPrices(params.productId, request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const prices = response.data.prices;
      
      return {
        content: [{
          type: 'text',
          text: `💰 **Product Prices** (${prices.length} of ${response.data.total} total)

${prices.length === 0 ? '📭 **No prices found**' : prices.map((price, index) => `
**${index + 1}. ${price.name}** (${price.type})
• **ID:** ${price._id}
• **Amount:** ${price.amount / 100} ${price.currency}
${price.compareAtPrice ? `• **Compare At:** ${price.compareAtPrice / 100} ${price.currency}` : ''}
${price.recurring ? `• **Recurring:** ${price.recurring.intervalCount} ${price.recurring.interval}(s)` : ''}
${price.sku ? `• **SKU:** ${price.sku}` : ''}
• **Created:** ${new Date(price.createdAt).toLocaleString()}
`).join('\n')}

📊 **Summary:**
• **Total Prices:** ${response.data.total}
• **Product ID:** ${params.productId}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Listing Prices**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async listInventory(params: MCPListInventoryParams): Promise<ProductsToolResult> {
    try {
      const request: GHLListInventoryRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        ...params
      };

      const response = await this.apiClient.listInventory(request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const inventory = response.data.inventory;
      const total = response.data.total.total;
      
      return {
        content: [{
          type: 'text',
          text: `📦 **Inventory Items** (${inventory.length} of ${total} total)

${inventory.length === 0 ? '📭 **No inventory items found**' : inventory.map((item, index) => `
**${index + 1}. ${item.name}** ${item.productName ? `(${item.productName})` : ''}
• **ID:** ${item._id}
• **Available Quantity:** ${item.availableQuantity}
• **SKU:** ${item.sku || 'N/A'}
• **Out of Stock Purchases:** ${item.allowOutOfStockPurchases ? '✅ Allowed' : '❌ Not Allowed'}
• **Product ID:** ${item.product}
• **Last Updated:** ${new Date(item.updatedAt).toLocaleString()}
${item.image ? `• **Image:** ${item.image}` : ''}
`).join('\n')}

📊 **Summary:**
• **Total Items:** ${total}
• **Displayed:** ${inventory.length}
${params.search ? `• **Search:** "${params.search}"` : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Listing Inventory**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async createProductCollection(params: MCPCreateProductCollectionParams): Promise<ProductsToolResult> {
    try {
      const request: GHLCreateProductCollectionRequest = {
        ...params,
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.createProductCollection(request);
      
      if (!response.data?.data) {
        throw new Error('No data returned from API');
      }
      
      return {
        content: [{
          type: 'text',
          text: `📂 **Product Collection Created Successfully!**

🏷️ **Collection Details:**
• **ID:** ${response.data.data._id}
• **Name:** ${response.data.data.name}
• **Slug:** ${response.data.data.slug}
• **Location:** ${response.data.data.altId}
• **Created:** ${new Date(response.data.data.createdAt).toLocaleString()}

${response.data.data.image ? `🖼️ **Image:** ${response.data.data.image}` : ''}
${response.data.data.seo?.title ? `🔍 **SEO Title:** ${response.data.data.seo.title}` : ''}
${response.data.data.seo?.description ? `📝 **SEO Description:** ${response.data.data.seo.description}` : ''}

✨ **Collection is ready to organize your products!**`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Creating Collection**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  async listProductCollections(params: MCPListProductCollectionsParams): Promise<ProductsToolResult> {
    try {
      const request: GHLListProductCollectionsRequest = {
        ...params,
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.listProductCollections(request);
      
      if (!response.data?.data) {
        throw new Error('No data returned from API');
      }
      
      const collections = response.data.data;
      
      return {
        content: [{
          type: 'text',
          text: `📂 **Product Collections** (${collections.length} of ${response.data.total} total)

${collections.length === 0 ? '📭 **No collections found**' : collections.map((collection: any, index: number) => `
**${index + 1}. ${collection.name}**
• **ID:** ${collection._id}
• **Slug:** ${collection.slug}
${collection.image ? `• **Image:** ${collection.image}` : ''}
${collection.seo?.title ? `• **SEO Title:** ${collection.seo.title}` : ''}
• **Created:** ${new Date(collection.createdAt).toLocaleString()}
`).join('\n')}

📊 **Summary:**
• **Total Collections:** ${response.data.total}
• **Displayed:** ${collections.length}
${params.name ? `• **Search:** "${params.name}"` : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text', 
          text: `❌ **Error Listing Collections**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }
} 