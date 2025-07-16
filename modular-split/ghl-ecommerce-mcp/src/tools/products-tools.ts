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
   * Format response for MCP protocol - JSON format only
   */
  private formatResponse(data: any): ProductsToolResult {
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
            compareAtPrice: { type: 'number', description: 'Compare at price (for discounts)' },
            description: { type: 'string', description: 'Price description' },
            sku: { type: 'string', description: 'Stock Keeping Unit (SKU) for inventory tracking' },
            trackInventory: { type: 'boolean', description: 'Whether to track inventory for this price' },
            availableQuantity: { type: 'number', description: 'Initial available quantity for inventory' },
            allowOutOfStockPurchases: { type: 'boolean', description: 'Allow purchases when out of stock' },
            trialPeriod: { type: 'number', description: 'Trial period in days (for recurring prices)' },
            totalCycles: { type: 'number', description: 'Total billing cycles (for recurring prices)' },
            setupFee: { type: 'number', description: 'One-time setup fee in cents' },
            isDigitalProduct: { type: 'boolean', description: 'Whether this is a digital product' }
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
        name: 'ghl_delete_price',
        description: 'Delete a price by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID that owns the price' },
            priceId: { type: 'string', description: 'Price ID to delete' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['productId', 'priceId']
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
        name: 'ghl_update_inventory',
        description: 'Update inventory quantities and stock settings for multiple items',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            items: {
              type: 'array',
              description: 'Array of inventory items to update',
              items: {
                type: 'object',
                properties: {
                  priceId: { type: 'string', description: 'Price ID of the inventory item to update' },
                  availableQuantity: { type: 'number', description: 'New available quantity' },
                  allowOutOfStockPurchases: { type: 'boolean', description: 'Whether to allow purchases when out of stock' }
                },
                required: ['priceId']
              }
            }
          },
          required: ['items']
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
        name: 'ghl_update_product_collection',
        description: 'Update an existing product collection',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: { type: 'string', description: 'Collection ID to update' },
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
          required: ['collectionId']
        }
      },
      {
        name: 'ghl_delete_product_collection',
        description: 'Delete a product collection by ID',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: { type: 'string', description: 'Collection ID to delete' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['collectionId']
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
      case 'ghl_delete_price':
        return this.deletePrice(params);
      case 'ghl_list_inventory':
        return this.listInventory(params);
      case 'ghl_update_inventory':
        return this.updateInventory(params);
      case 'ghl_create_product_collection':
        return this.createProductCollection(params);
      case 'ghl_update_product_collection':
        return this.updateProductCollection(params);
      case 'ghl_delete_product_collection':
        return this.deleteProductCollection(params);
      case 'ghl_list_product_collections':
        return this.listProductCollections(params);
      default:
        return this.formatResponse({ error: `Unknown tool: ${toolName}` });
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

      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
            compareAtPrice: { type: 'number', description: 'Compare at price (for discounts)' },
            description: { type: 'string', description: 'Price description' },
            sku: { type: 'string', description: 'Stock Keeping Unit (SKU) for inventory tracking' },
            trackInventory: { type: 'boolean', description: 'Whether to track inventory for this price' },
            availableQuantity: { type: 'number', description: 'Initial available quantity for inventory' },
            allowOutOfStockPurchases: { type: 'boolean', description: 'Allow purchases when out of stock' },
            trialPeriod: { type: 'number', description: 'Trial period in days (for recurring prices)' },
            totalCycles: { type: 'number', description: 'Total billing cycles (for recurring prices)' },
            setupFee: { type: 'number', description: 'One-time setup fee in cents' },
            isDigitalProduct: { type: 'boolean', description: 'Whether this is a digital product' }
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
        name: 'ghl_delete_price',
        description: 'Delete a price by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID that owns the price' },
            priceId: { type: 'string', description: 'Price ID to delete' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['productId', 'priceId']
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
      {
        name: 'ghl_update_inventory',
        description: 'Update inventory quantities and stock settings for multiple items',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            items: {
              type: 'array',
              description: 'Array of inventory items to update',
              items: {
                type: 'object',
                properties: {
                  priceId: { type: 'string', description: 'Price ID of the inventory item to update' },
                  availableQuantity: { type: 'number', description: 'New available quantity' },
                  allowOutOfStockPurchases: { type: 'boolean', description: 'Whether to allow purchases when out of stock' }
                },
                required: ['priceId']
              }
            }
          },
          required: ['items']
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
        name: 'ghl_update_product_collection',
        description: 'Update an existing product collection',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: { type: 'string', description: 'Collection ID to update' },
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
          required: ['collectionId']
        }
      },
      {
        name: 'ghl_delete_product_collection',
        description: 'Delete a product collection by ID',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: { type: 'string', description: 'Collection ID to delete' },
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          },
          required: ['collectionId']
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
      case 'ghl_delete_price':
        return this.deletePrice(params as MCPDeletePriceParams);
      case 'ghl_list_inventory':
        return this.listInventory(params as MCPListInventoryParams);
      case 'ghl_update_inventory':
        return this.updateInventory(params as MCPUpdateInventoryParams);
      case 'ghl_create_product_collection':
        return this.createProductCollection(params as MCPCreateProductCollectionParams);
      case 'ghl_update_product_collection':
        return this.updateProductCollection(params as MCPUpdateProductCollectionParams);
      case 'ghl_delete_product_collection':
        return this.deleteProductCollection(params as MCPDeleteProductCollectionParams);
      case 'ghl_list_product_collections':
        return this.listProductCollections(params as MCPListProductCollectionsParams);
      default:
        return this.formatResponse({ error: `Unknown Products Tool: ${toolName}` });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
    }
  }

  async deletePrice(params: MCPDeletePriceParams): Promise<ProductsToolResult> {
    try {
      const response = await this.apiClient.deletePrice(
        params.productId,
        params.priceId,
        params.locationId || this.apiClient.getConfig().locationId
      );
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
    }
  }

  async updateInventory(params: MCPUpdateInventoryParams): Promise<ProductsToolResult> {
    try {
      const request: GHLUpdateInventoryRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        items: params.items
      };

      const response = await this.apiClient.updateInventory(request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
    }
  }

  async updateProductCollection(params: MCPUpdateProductCollectionParams): Promise<ProductsToolResult> {
    try {
      const request: GHLUpdateProductCollectionRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        name: params.name,
        slug: params.slug,
        image: params.image,
        seo: params.seo
      };

      const response = await this.apiClient.updateProductCollection(params.collectionId, request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
    }
  }

  async deleteProductCollection(params: MCPDeleteProductCollectionParams): Promise<ProductsToolResult> {
    try {
      const request: GHLDeleteProductCollectionRequest = {
        collectionId: params.collectionId,
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.deleteProductCollection(params.collectionId, request);
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
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
      
      return this.formatResponse(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.formatResponse({ error: errorMessage });
    }
  }
} 