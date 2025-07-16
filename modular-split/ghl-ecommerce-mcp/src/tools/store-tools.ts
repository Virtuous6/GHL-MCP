/**
 * GoHighLevel Store API Tools for MCP Server
 * Provides comprehensive tools for managing store shipping zones, rates, carriers, and settings
 */

import {
  // MCP Types
  MCPCreateShippingZoneParams,
  MCPListShippingZonesParams,
  MCPGetShippingZoneParams,
  MCPUpdateShippingZoneParams,
  MCPDeleteShippingZoneParams,
  MCPCreateShippingRateParams,
  MCPListShippingRatesParams,
  MCPGetShippingRateParams,
  MCPUpdateShippingRateParams,
  MCPDeleteShippingRateParams,
  MCPGetAvailableShippingRatesParams,
  MCPCreateShippingCarrierParams,
  MCPListShippingCarriersParams,
  MCPGetShippingCarrierParams,
  MCPUpdateShippingCarrierParams,
  MCPDeleteShippingCarrierParams,
  MCPCreateStoreSettingParams,
  MCPGetStoreSettingParams,
  // API Client Types
  GHLCreateShippingZoneRequest,
  GHLUpdateShippingZoneRequest,
  GHLGetShippingZonesRequest,
  GHLDeleteShippingZoneRequest,
  GHLCreateShippingRateRequest,
  GHLUpdateShippingRateRequest,
  GHLGetShippingRatesRequest,
  GHLDeleteShippingRateRequest,
  GHLGetAvailableShippingRatesRequest,
  GHLCreateShippingCarrierRequest,
  GHLUpdateShippingCarrierRequest,
  GHLGetShippingCarriersRequest,
  GHLDeleteShippingCarrierRequest,
  GHLCreateStoreSettingRequest,
  GHLGetStoreSettingRequest,
  GHLCountryCode,
  GHLStateCode
} from '../types/ghl-types.js';

import { GHLApiClient } from '../clients/ghl-api-client.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface StoreToolResult {
  content: {
    type: 'text';
    text: string;
  }[];
}

export class StoreTools {
  constructor(private apiClient: GHLApiClient) {}

  /**
   * Format response for MCP protocol - JSON format only
   */
  private formatResponse(data: any): StoreToolResult {
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
    return StoreTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return StoreTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      // Shipping Zones Tools
      {
        name: 'ghl_create_shipping_zone',
        description: 'Create a new shipping zone with specific countries and states',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Name of the shipping zone' },
            countries: {
              type: 'array',
              description: 'Array of countries with optional state restrictions',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string', description: 'Country code (e.g., US, CA)' },
                  states: {
                    type: 'array',
                    description: 'Optional array of state codes for this country',
                    items: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', description: 'State code (e.g., CA, NY)' }
                      },
                      required: ['code']
                    }
                  }
                },
                required: ['code']
              }
            }
          },
          required: ['name', 'countries']
        }
      },
      {
        name: 'ghl_list_shipping_zones',
        description: 'List all shipping zones for a location',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Number of zones to return (optional)' },
            offset: { type: 'number', description: 'Number of zones to skip (optional)' },
            withShippingRate: { type: 'boolean', description: 'Include shipping rates in response (optional)' }
          }
        }
      },
      {
        name: 'ghl_get_shipping_zone',
        description: 'Get details of a specific shipping zone',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone to retrieve' },
            withShippingRate: { type: 'boolean', description: 'Include shipping rates in response (optional)' }
          },
          required: ['shippingZoneId']
        }
      },
      {
        name: 'ghl_update_shipping_zone',
        description: 'Update a shipping zone\'s name or countries',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone to update' },
            name: { type: 'string', description: 'New name for the shipping zone (optional)' },
            countries: {
              type: 'array',
              description: 'Updated array of countries with optional state restrictions (optional)',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string', description: 'Country code (e.g., US, CA)' },
                  states: {
                    type: 'array',
                    description: 'Optional array of state codes for this country',
                    items: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', description: 'State code (e.g., CA, NY)' }
                      },
                      required: ['code']
                    }
                  }
                },
                required: ['code']
              }
            }
          },
          required: ['shippingZoneId']
        }
      },
      {
        name: 'ghl_delete_shipping_zone',
        description: 'Delete a shipping zone and all its associated shipping rates',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone to delete' }
          },
          required: ['shippingZoneId']
        }
      },
      {
        name: 'ghl_get_available_shipping_rates',
        description: 'Get available shipping rates for an order based on destination and order details',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            country: { type: 'string', description: 'Destination country code' },
            address: {
              type: 'object',
              description: 'Shipping address details',
              properties: {
                street1: { type: 'string', description: 'Street address line 1' },
                city: { type: 'string', description: 'City' },
                country: { type: 'string', description: 'Country code' }
              },
              required: ['street1', 'city', 'country']
            },
            totalOrderAmount: { type: 'number', description: 'Total order amount' },
            totalOrderWeight: { type: 'number', description: 'Total order weight' },
            products: {
              type: 'array',
              description: 'Array of products in the order',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Product ID' },
                  quantity: { type: 'number', description: 'Product quantity' }
                },
                required: ['id', 'quantity']
              }
            }
          },
          required: ['country', 'address', 'totalOrderAmount', 'totalOrderWeight', 'products']
        }
      },
      {
        name: 'ghl_create_shipping_rate',
        description: 'Create a new shipping rate for a shipping zone',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            name: { type: 'string', description: 'Name of the shipping rate' },
            currency: { type: 'string', description: 'Currency code (e.g., USD)' },
            amount: { type: 'number', description: 'Shipping rate amount' },
            conditionType: { type: 'string', description: 'Condition type for rate calculation' }
          },
          required: ['shippingZoneId', 'name', 'currency', 'amount', 'conditionType']
        }
      },
      {
        name: 'ghl_list_shipping_rates',
        description: 'List all shipping rates for a specific shipping zone',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' }
          },
          required: ['shippingZoneId']
        }
      },
      {
        name: 'ghl_get_shipping_rate',
        description: 'Get details of a specific shipping rate',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            shippingRateId: { type: 'string', description: 'ID of the shipping rate to retrieve' }
          },
          required: ['shippingZoneId', 'shippingRateId']
        }
      },
      {
        name: 'ghl_update_shipping_rate',
        description: 'Update a shipping rate\'s properties',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            shippingRateId: { type: 'string', description: 'ID of the shipping rate to update' }
          },
          required: ['shippingZoneId', 'shippingRateId']
        }
      },
      {
        name: 'ghl_delete_shipping_rate',
        description: 'Delete a shipping rate',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            shippingRateId: { type: 'string', description: 'ID of the shipping rate to delete' }
          },
          required: ['shippingZoneId', 'shippingRateId']
        }
      },
      {
        name: 'ghl_create_shipping_carrier',
        description: 'Create a new shipping carrier configuration',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Carrier name' },
            type: { type: 'string', description: 'Carrier type' }
          },
          required: ['name', 'type']
        }
      },
      {
        name: 'ghl_list_shipping_carriers',
        description: 'List all shipping carriers',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          }
        }
      },
      {
        name: 'ghl_get_shipping_carrier',
        description: 'Get details of a specific shipping carrier',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            carrierId: { type: 'string', description: 'ID of the shipping carrier to retrieve' }
          },
          required: ['carrierId']
        }
      },
      {
        name: 'ghl_update_shipping_carrier',
        description: 'Update a shipping carrier configuration',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            carrierId: { type: 'string', description: 'ID of the shipping carrier to update' },
            name: { type: 'string', description: 'Updated carrier name' },
            type: { type: 'string', description: 'Updated carrier type' }
          },
          required: ['carrierId']
        }
      },
      {
        name: 'ghl_delete_shipping_carrier',
        description: 'Delete a shipping carrier',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            carrierId: { type: 'string', description: 'ID of the shipping carrier to delete' }
          },
          required: ['carrierId']
        }
      },
      {
        name: 'ghl_create_store_setting',
        description: 'Create or update a store setting',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            key: { type: 'string', description: 'Setting key' },
            value: { type: 'string', description: 'Setting value' }
          },
          required: ['key', 'value']
        }
      },
      {
        name: 'ghl_get_store_setting',
        description: 'Get a specific store setting',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            key: { type: 'string', description: 'Setting key to retrieve' }
          },
          required: ['key']
        }
      }
    ];
  }

  /**
   * Execute a store tool by name
   */
  async executeTool(toolName: string, params: any): Promise<any> {
    switch (toolName) {
      case 'ghl_create_shipping_zone':
        return this.createShippingZone(params);
      case 'ghl_list_shipping_zones':
        return this.listShippingZones(params);
      case 'ghl_get_shipping_zone':
        return this.getShippingZone(params);
      case 'ghl_update_shipping_zone':
        return this.updateShippingZone(params);
      case 'ghl_delete_shipping_zone':
        return this.deleteShippingZone(params);
      case 'ghl_get_available_shipping_rates':
        return this.getAvailableShippingRates(params);
      case 'ghl_create_shipping_rate':
        return this.createShippingRate(params);
      case 'ghl_list_shipping_rates':
        return this.listShippingRates(params);
      case 'ghl_get_shipping_rate':
        return this.getShippingRate(params);
      case 'ghl_update_shipping_rate':
        return this.updateShippingRate(params);
      case 'ghl_delete_shipping_rate':
        return this.deleteShippingRate(params);
      case 'ghl_create_shipping_carrier':
        return this.createShippingCarrier(params);
      case 'ghl_list_shipping_carriers':
        return this.listShippingCarriers(params);
      case 'ghl_get_shipping_carrier':
        return this.getShippingCarrier(params);
      case 'ghl_update_shipping_carrier':
        return this.updateShippingCarrier(params);
      case 'ghl_delete_shipping_carrier':
        return this.deleteShippingCarrier(params);
      case 'ghl_create_store_setting':
        return this.createStoreSetting(params);
      case 'ghl_get_store_setting':
        return this.getStoreSetting(params);
      default:
        return {
          content: [{
            type: 'text',
            text: `❌ **Unknown Tool:** ${toolName}`
          }]
        };
    }
  }

  /**
   * SHIPPING ZONES TOOLS
   */

  /**
   * Create a new shipping zone
   */
  async createShippingZone(params: MCPCreateShippingZoneParams): Promise<StoreToolResult> {
    try {
      const request: GHLCreateShippingZoneRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        name: params.name,
        countries: params.countries
      };

      const response = await this.apiClient.createShippingZone(request);

      const zoneInfo = response.data?.data;
      if (!zoneInfo) {
        throw new Error('No shipping zone data returned from API');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Zone Created Successfully**

**Zone Details:**
- **ID:** ${zoneInfo._id}
- **Name:** ${zoneInfo.name}
- **Countries:** ${zoneInfo.countries.length} country(ies) configured
- **Created:** ${new Date(zoneInfo.createdAt).toLocaleString()}

**Countries Configured:**
${zoneInfo.countries.map(country => {
  const states = country.states && country.states.length > 0 
    ? ` (${country.states.length} states)` 
    : ' (All states)';
  return `• ${country.code}${states}`;
}).join('\n')}

The shipping zone is now active and ready to use with shipping rates.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Creating Shipping Zone**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * List all shipping zones
   */
  async listShippingZones(params: MCPListShippingZonesParams): Promise<StoreToolResult> {
    try {
      const request: GHLGetShippingZonesRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        limit: params.limit,
        offset: params.offset,
        withShippingRate: params.withShippingRate
      };

      const response = await this.apiClient.listShippingZones(request);

      const zones = response.data?.data || [];

      if (zones.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📦 **No Shipping Zones Found**

No shipping zones are currently configured for this location. Create your first shipping zone to start managing shipping rates.`
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: `📦 **Shipping Zones (${response.data?.total || zones.length} total)**

${zones.map((zone, index) => `**${index + 1}. ${zone.name}**
- **ID:** ${zone._id}
- **Countries:** ${zone.countries.length} configured
- **Shipping Rates:** ${zone.shippingRates?.length || 0}
- **Created:** ${new Date(zone.createdAt).toLocaleString()}

${zone.countries.map(country => {
  const states = country.states && country.states.length > 0 
    ? ` (${country.states.length} states)` 
    : ' (All states)';
  return `  • ${country.code}${states}`;
}).join('\n')}
`).join('\n')}

💡 Use the shipping zone IDs to manage specific zones or create shipping rates.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Listing Shipping Zones**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Get a specific shipping zone
   */
  async getShippingZone(params: MCPGetShippingZoneParams): Promise<StoreToolResult> {
    try {
      const request: Omit<GHLGetShippingZonesRequest, 'limit' | 'offset'> = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        withShippingRate: params.withShippingRate
      };

      const response = await this.apiClient.getShippingZone(params.shippingZoneId, request);

      const zone = response.data?.data;
      if (!zone) {
        throw new Error('Shipping zone not found');
      }

      return {
        content: [{
          type: 'text',
          text: `📦 **Shipping Zone Details**

**Zone Information:**
- **ID:** ${zone._id}
- **Name:** ${zone.name}
- **Created:** ${new Date(zone.createdAt).toLocaleString()}
- **Updated:** ${new Date(zone.updatedAt).toLocaleString()}

**Countries & Regions (${zone.countries.length}):**
${zone.countries.map(country => {
  const states = country.states && country.states.length > 0 
    ? `\n  States: ${country.states.map(s => s.code).join(', ')}` 
    : '\n  States: All states included';
  return `• **${country.code}**${states}`;
}).join('\n')}

${zone.shippingRates ? `**Shipping Rates (${zone.shippingRates.length}):**
${zone.shippingRates.map((rate, index) => `${index + 1}. **${rate.name}**
   - Rate: ${rate.currency} ${rate.amount}
   - Condition: ${rate.conditionType}
   - Carrier Rate: ${rate.isCarrierRate ? 'Yes' : 'No'}
`).join('\n')}` : ''}

Use this zone ID to create shipping rates or update zone configuration.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Getting Shipping Zone**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Update a shipping zone
   */
  async updateShippingZone(params: MCPUpdateShippingZoneParams): Promise<StoreToolResult> {
    try {
      const request: GHLUpdateShippingZoneRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      if (params.name) request.name = params.name;
      if (params.countries) request.countries = params.countries;

      const response = await this.apiClient.updateShippingZone(params.shippingZoneId, request);

      const zone = response.data?.data;
      if (!zone) {
        throw new Error('No shipping zone data returned from update');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Zone Updated Successfully**

**Updated Zone:**
- **ID:** ${zone._id}
- **Name:** ${zone.name}
- **Countries:** ${zone.countries.length} configured
- **Last Updated:** ${new Date(zone.updatedAt).toLocaleString()}

**Current Countries:**
${zone.countries.map(country => {
  const states = country.states && country.states.length > 0 
    ? ` (${country.states.length} states)` 
    : ' (All states)';
  return `• ${country.code}${states}`;
}).join('\n')}

The shipping zone configuration has been updated successfully.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Updating Shipping Zone**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Delete a shipping zone
   */
  async deleteShippingZone(params: MCPDeleteShippingZoneParams): Promise<StoreToolResult> {
    try {
      const request: GHLDeleteShippingZoneRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.deleteShippingZone(params.shippingZoneId, request);

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Zone Deleted Successfully**

**Zone ID:** ${params.shippingZoneId}

The shipping zone and all associated shipping rates have been permanently deleted. This action cannot be undone.

⚠️ **Note:** Any existing orders using this shipping zone may be affected. Please ensure you have alternative shipping options configured.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Deleting Shipping Zone**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * SHIPPING RATES TOOLS
   */

  /**
   * Get available shipping rates for an order
   */
  async getAvailableShippingRates(params: MCPGetAvailableShippingRatesParams): Promise<StoreToolResult> {
    try {
      const request: GHLGetAvailableShippingRatesRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        country: params.country,
        address: params.address,
        totalOrderAmount: params.totalOrderAmount,
        totalOrderWeight: params.totalOrderWeight,
        source: params.source,
        products: params.products,
        couponCode: params.couponCode
      };

      const response = await this.apiClient.getAvailableShippingRates(request);

      const rates = response.data?.data || [];

      if (rates.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📦 **No Shipping Rates Available**

No shipping rates are available for the specified order criteria:
- **Country:** ${params.country}
- **Order Amount:** $${params.totalOrderAmount}
- **Order Weight:** ${params.totalOrderWeight} kg
- **Products:** ${params.products.length} item(s)

Please check your shipping zone configuration or contact support.`
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: `📦 **Available Shipping Rates (${rates.length})**

**Order Summary:**
- **Country:** ${params.country}
- **Order Amount:** $${params.totalOrderAmount}
- **Order Weight:** ${params.totalOrderWeight} kg
- **Products:** ${params.products.length} item(s)

**Available Shipping Options:**

${rates.map((rate, index) => `**${index + 1}. ${rate.name}**
- **Cost:** ${rate.currency} ${rate.amount}${rate.isCarrierRate ? ' (+ carrier fees)' : ''}
- **Type:** ${rate.isCarrierRate ? 'Carrier Rate' : 'Fixed Rate'}
- **Zone ID:** ${rate.shippingZoneId}
- **Rate ID:** ${rate._id}
${rate.description ? `- **Description:** ${rate.description}` : ''}
${rate.shippingCarrierServices && rate.shippingCarrierServices.length > 0 ? `- **Services:** ${rate.shippingCarrierServices.map(s => s.name).join(', ')}` : ''}
`).join('\n')}

Select the appropriate shipping rate for checkout.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Getting Available Shipping Rates**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Create a shipping rate
   */
  async createShippingRate(params: MCPCreateShippingRateParams): Promise<StoreToolResult> {
    try {
      const request: GHLCreateShippingRateRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        name: params.name,
        description: params.description,
        currency: params.currency,
        amount: params.amount,
        conditionType: params.conditionType,
        minCondition: params.minCondition,
        maxCondition: params.maxCondition,
        isCarrierRate: params.isCarrierRate,
        shippingCarrierId: params.shippingCarrierId,
        percentageOfRateFee: params.percentageOfRateFee,
        shippingCarrierServices: params.shippingCarrierServices
      };

      const response = await this.apiClient.createShippingRate(params.shippingZoneId, request);

      const rate = response.data?.data;
      if (!rate) {
        throw new Error('No shipping rate data returned from API');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Rate Created Successfully**

**Rate Details:**
- **ID:** ${rate._id}
- **Name:** ${rate.name}
- **Zone ID:** ${rate.shippingZoneId}
- **Cost:** ${rate.currency} ${rate.amount}
- **Condition Type:** ${rate.conditionType}
${rate.minCondition ? `- **Min Condition:** ${rate.minCondition}` : ''}
${rate.maxCondition ? `- **Max Condition:** ${rate.maxCondition}` : ''}
- **Carrier Rate:** ${rate.isCarrierRate ? 'Yes' : 'No'}
${rate.description ? `- **Description:** ${rate.description}` : ''}
- **Created:** ${new Date(rate.createdAt).toLocaleString()}

${rate.shippingCarrierServices && rate.shippingCarrierServices.length > 0 ? `**Carrier Services:**
${rate.shippingCarrierServices.map(service => `• ${service.name} (${service.value})`).join('\n')}` : ''}

The shipping rate is now active and available for orders.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Creating Shipping Rate**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * List shipping rates for a zone
   */
  async listShippingRates(params: MCPListShippingRatesParams): Promise<StoreToolResult> {
    try {
      const request: GHLGetShippingRatesRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        limit: params.limit,
        offset: params.offset
      };

      const response = await this.apiClient.listShippingRates(params.shippingZoneId, request);

      const rates = response.data?.data || [];

      if (rates.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📦 **No Shipping Rates Found**

No shipping rates are configured for zone: ${params.shippingZoneId}

Create shipping rates to enable shipping options for this zone.`
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: `📦 **Shipping Rates for Zone ${params.shippingZoneId} (${response.data?.total || rates.length} total)**

${rates.map((rate, index) => `**${index + 1}. ${rate.name}**
- **ID:** ${rate._id}
- **Cost:** ${rate.currency} ${rate.amount}
- **Condition:** ${rate.conditionType}${rate.minCondition ? ` (min: ${rate.minCondition})` : ''}${rate.maxCondition ? ` (max: ${rate.maxCondition})` : ''}
- **Type:** ${rate.isCarrierRate ? 'Carrier Rate' : 'Fixed Rate'}
- **Created:** ${new Date(rate.createdAt).toLocaleString()}
${rate.description ? `- **Description:** ${rate.description}` : ''}
`).join('\n')}

Use rate IDs to update or delete specific shipping rates.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Listing Shipping Rates**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Get a specific shipping rate
   */
  async getShippingRate(params: MCPGetShippingRateParams): Promise<StoreToolResult> {
    try {
      const request: Omit<GHLGetShippingRatesRequest, 'limit' | 'offset'> = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.getShippingRate(
        params.shippingZoneId, 
        params.shippingRateId, 
        request
      );

      const rate = response.data?.data;
      if (!rate) {
        throw new Error('Shipping rate not found');
      }

      return {
        content: [{
          type: 'text',
          text: `📦 **Shipping Rate Details**

**Rate Information:**
- **ID:** ${rate._id}
- **Name:** ${rate.name}
- **Zone ID:** ${rate.shippingZoneId}
- **Cost:** ${rate.currency} ${rate.amount}
- **Condition Type:** ${rate.conditionType}
${rate.minCondition ? `- **Min Condition:** ${rate.minCondition}` : ''}
${rate.maxCondition ? `- **Max Condition:** ${rate.maxCondition}` : ''}
- **Carrier Rate:** ${rate.isCarrierRate ? 'Yes' : 'No'}
${rate.percentageOfRateFee ? `- **Carrier Fee %:** ${rate.percentageOfRateFee}%` : ''}
${rate.description ? `- **Description:** ${rate.description}` : ''}
- **Created:** ${new Date(rate.createdAt).toLocaleString()}
- **Updated:** ${new Date(rate.updatedAt).toLocaleString()}

${rate.shippingCarrierServices && rate.shippingCarrierServices.length > 0 ? `**Carrier Services:**
${rate.shippingCarrierServices.map(service => `• **${service.name}** (${service.value})`).join('\n')}` : ''}

Use this rate information to manage shipping configurations.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Getting Shipping Rate**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Update a shipping rate
   */
  async updateShippingRate(params: MCPUpdateShippingRateParams): Promise<StoreToolResult> {
    try {
      const request: GHLUpdateShippingRateRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      // Only include provided parameters
      if (params.name !== undefined) request.name = params.name;
      if (params.description !== undefined) request.description = params.description;
      if (params.currency !== undefined) request.currency = params.currency;
      if (params.amount !== undefined) request.amount = params.amount;
      if (params.conditionType !== undefined) request.conditionType = params.conditionType;
      if (params.minCondition !== undefined) request.minCondition = params.minCondition;
      if (params.maxCondition !== undefined) request.maxCondition = params.maxCondition;
      if (params.isCarrierRate !== undefined) request.isCarrierRate = params.isCarrierRate;
      if (params.shippingCarrierId !== undefined) request.shippingCarrierId = params.shippingCarrierId;
      if (params.percentageOfRateFee !== undefined) request.percentageOfRateFee = params.percentageOfRateFee;
      if (params.shippingCarrierServices !== undefined) request.shippingCarrierServices = params.shippingCarrierServices;

      const response = await this.apiClient.updateShippingRate(
        params.shippingZoneId,
        params.shippingRateId,
        request
      );

      const rate = response.data?.data;
      if (!rate) {
        throw new Error('No shipping rate data returned from update');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Rate Updated Successfully**

**Updated Rate:**
- **ID:** ${rate._id}
- **Name:** ${rate.name}
- **Zone ID:** ${rate.shippingZoneId}
- **Cost:** ${rate.currency} ${rate.amount}
- **Condition Type:** ${rate.conditionType}
${rate.minCondition ? `- **Min Condition:** ${rate.minCondition}` : ''}
${rate.maxCondition ? `- **Max Condition:** ${rate.maxCondition}` : ''}
- **Carrier Rate:** ${rate.isCarrierRate ? 'Yes' : 'No'}
${rate.description ? `- **Description:** ${rate.description}` : ''}
- **Last Updated:** ${new Date(rate.updatedAt).toLocaleString()}

The shipping rate configuration has been updated successfully.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Updating Shipping Rate**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Delete a shipping rate
   */
  async deleteShippingRate(params: MCPDeleteShippingRateParams): Promise<StoreToolResult> {
    try {
      const request: GHLDeleteShippingRateRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.deleteShippingRate(
        params.shippingZoneId,
        params.shippingRateId,
        request
      );

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Rate Deleted Successfully**

**Deleted Rate:**
- **Zone ID:** ${params.shippingZoneId}
- **Rate ID:** ${params.shippingRateId}

The shipping rate has been permanently deleted. This action cannot be undone.

⚠️ **Note:** This shipping option will no longer be available for new orders.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Deleting Shipping Rate**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * SHIPPING CARRIERS TOOLS
   */

  /**
   * Create a shipping carrier
   */
  async createShippingCarrier(params: MCPCreateShippingCarrierParams): Promise<StoreToolResult> {
    try {
      const request: GHLCreateShippingCarrierRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        name: params.name,
        callbackUrl: params.callbackUrl,
        services: params.services,
        allowsMultipleServiceSelection: params.allowsMultipleServiceSelection
      };

      const response = await this.apiClient.createShippingCarrier(request);

      const carrier = response.data?.data;
      if (!carrier) {
        throw new Error('No shipping carrier data returned from API');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Carrier Created Successfully**

**Carrier Details:**
- **ID:** ${carrier._id}
- **Name:** ${carrier.name}
- **Callback URL:** ${carrier.callbackUrl}
- **Multiple Services:** ${carrier.allowsMultipleServiceSelection ? 'Allowed' : 'Single Service Only'}
- **Marketplace App ID:** ${carrier.marketplaceAppId}
- **Created:** ${new Date(carrier.createdAt).toLocaleString()}

${carrier.services && carrier.services.length > 0 ? `**Available Services (${carrier.services.length}):**
${carrier.services.map(service => `• **${service.name}** (${service.value})`).join('\n')}` : '**No services configured**'}

The shipping carrier is now available for creating carrier-based shipping rates.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Creating Shipping Carrier**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * List all shipping carriers
   */
  async listShippingCarriers(params: MCPListShippingCarriersParams): Promise<StoreToolResult> {
    try {
      const request: GHLGetShippingCarriersRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.listShippingCarriers(request);

      const carriers = response.data?.data || [];

      if (carriers.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `🚚 **No Shipping Carriers Found**

No shipping carriers are currently configured for this location. Create shipping carriers to enable carrier-based shipping rates.`
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: `🚚 **Shipping Carriers (${carriers.length})**

${carriers.map((carrier, index) => `**${index + 1}. ${carrier.name}**
- **ID:** ${carrier._id}
- **Callback URL:** ${carrier.callbackUrl}
- **Multiple Services:** ${carrier.allowsMultipleServiceSelection ? 'Yes' : 'No'}
- **Services:** ${carrier.services?.length || 0} configured
- **Created:** ${new Date(carrier.createdAt).toLocaleString()}
${carrier.services && carrier.services.length > 0 ? `
  **Services:**
  ${carrier.services.map(s => `  • ${s.name} (${s.value})`).join('\n')}` : ''}
`).join('\n')}

Use carrier IDs to create carrier-based shipping rates or manage carrier configurations.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Listing Shipping Carriers**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Get a specific shipping carrier
   */
  async getShippingCarrier(params: MCPGetShippingCarrierParams): Promise<StoreToolResult> {
    try {
      const request: GHLGetShippingCarriersRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.getShippingCarrier(params.shippingCarrierId, request);

      const carrier = response.data?.data;
      if (!carrier) {
        throw new Error('Shipping carrier not found');
      }

      return {
        content: [{
          type: 'text',
          text: `🚚 **Shipping Carrier Details**

**Carrier Information:**
- **ID:** ${carrier._id}
- **Name:** ${carrier.name}
- **Callback URL:** ${carrier.callbackUrl}
- **Multiple Service Selection:** ${carrier.allowsMultipleServiceSelection ? 'Allowed' : 'Single Service Only'}
- **Marketplace App ID:** ${carrier.marketplaceAppId}
- **Created:** ${new Date(carrier.createdAt).toLocaleString()}
- **Updated:** ${new Date(carrier.updatedAt).toLocaleString()}

${carrier.services && carrier.services.length > 0 ? `**Available Services (${carrier.services.length}):**
${carrier.services.map(service => `• **${service.name}**
  - Value: ${service.value}
`).join('\n')}` : '**No services configured**'}

Use this carrier to create dynamic shipping rates based on real-time carrier pricing.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Getting Shipping Carrier**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Update a shipping carrier
   */
  async updateShippingCarrier(params: MCPUpdateShippingCarrierParams): Promise<StoreToolResult> {
    try {
      const request: GHLUpdateShippingCarrierRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      // Only include provided parameters
      if (params.name !== undefined) request.name = params.name;
      if (params.callbackUrl !== undefined) request.callbackUrl = params.callbackUrl;
      if (params.services !== undefined) request.services = params.services;
      if (params.allowsMultipleServiceSelection !== undefined) request.allowsMultipleServiceSelection = params.allowsMultipleServiceSelection;

      const response = await this.apiClient.updateShippingCarrier(params.shippingCarrierId, request);

      const carrier = response.data?.data;
      if (!carrier) {
        throw new Error('No shipping carrier data returned from update');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Carrier Updated Successfully**

**Updated Carrier:**
- **ID:** ${carrier._id}
- **Name:** ${carrier.name}
- **Callback URL:** ${carrier.callbackUrl}
- **Multiple Services:** ${carrier.allowsMultipleServiceSelection ? 'Allowed' : 'Single Service Only'}
- **Last Updated:** ${new Date(carrier.updatedAt).toLocaleString()}

${carrier.services && carrier.services.length > 0 ? `**Services (${carrier.services.length}):**
${carrier.services.map(service => `• ${service.name} (${service.value})`).join('\n')}` : ''}

The shipping carrier configuration has been updated successfully.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Updating Shipping Carrier**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Delete a shipping carrier
   */
  async deleteShippingCarrier(params: MCPDeleteShippingCarrierParams): Promise<StoreToolResult> {
    try {
      const request: GHLDeleteShippingCarrierRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.deleteShippingCarrier(params.shippingCarrierId, request);

      return {
        content: [{
          type: 'text',
          text: `✅ **Shipping Carrier Deleted Successfully**

**Carrier ID:** ${params.shippingCarrierId}

The shipping carrier has been permanently deleted. This action cannot be undone.

⚠️ **Important:** Any shipping rates using this carrier will no longer function properly. Please update or remove associated shipping rates.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Deleting Shipping Carrier**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * STORE SETTINGS TOOLS
   */

  /**
   * Create or update store settings
   */
  async createStoreSetting(params: MCPCreateStoreSettingParams): Promise<StoreToolResult> {
    try {
      const request: GHLCreateStoreSettingRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location',
        shippingOrigin: params.shippingOrigin,
        storeOrderNotification: params.storeOrderNotification,
        storeOrderFulfillmentNotification: params.storeOrderFulfillmentNotification
      };

      const response = await this.apiClient.createStoreSetting(request);

      const settings = response.data?.data;
      if (!settings) {
        throw new Error('No store settings data returned from API');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Store Settings Created/Updated Successfully**

**Settings ID:** ${settings._id}

**Shipping Origin:**
- **Name:** ${settings.shippingOrigin.name}
- **Address:** ${settings.shippingOrigin.street1}${settings.shippingOrigin.street2 ? `, ${settings.shippingOrigin.street2}` : ''}
- **City:** ${settings.shippingOrigin.city}, ${settings.shippingOrigin.state || ''} ${settings.shippingOrigin.zip}
- **Country:** ${settings.shippingOrigin.country}
${settings.shippingOrigin.phone ? `- **Phone:** ${settings.shippingOrigin.phone}` : ''}
${settings.shippingOrigin.email ? `- **Email:** ${settings.shippingOrigin.email}` : ''}

${settings.storeOrderNotification ? `**Order Notifications:**
- **Enabled:** ${settings.storeOrderNotification.enabled ? 'Yes' : 'No'}
- **Subject:** ${settings.storeOrderNotification.subject}
- **Template ID:** ${settings.storeOrderNotification.emailTemplateId}` : ''}

${settings.storeOrderFulfillmentNotification ? `**Fulfillment Notifications:**
- **Enabled:** ${settings.storeOrderFulfillmentNotification.enabled ? 'Yes' : 'No'}
- **Subject:** ${settings.storeOrderFulfillmentNotification.subject}
- **Template ID:** ${settings.storeOrderFulfillmentNotification.emailTemplateId}` : ''}

**Last Updated:** ${new Date(settings.updatedAt).toLocaleString()}

Your store settings have been configured successfully.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Creating/Updating Store Settings**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Get store settings
   */
  async getStoreSetting(params: MCPGetStoreSettingParams): Promise<StoreToolResult> {
    try {
      const request: GHLGetStoreSettingRequest = {
        altId: params.locationId || this.apiClient.getConfig().locationId,
        altType: 'location'
      };

      const response = await this.apiClient.getStoreSetting(request);

      const settings = response.data?.data;
      if (!settings) {
        return {
          content: [{
            type: 'text',
            text: `⚙️ **No Store Settings Found**

No store settings are currently configured for this location. Create store settings to configure shipping origin and notification preferences.`
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: `⚙️ **Store Settings**

**Settings ID:** ${settings._id}

**📍 Shipping Origin:**
- **Business Name:** ${settings.shippingOrigin.name}
- **Address:** ${settings.shippingOrigin.street1}${settings.shippingOrigin.street2 ? `, ${settings.shippingOrigin.street2}` : ''}
- **City:** ${settings.shippingOrigin.city}, ${settings.shippingOrigin.state || ''} ${settings.shippingOrigin.zip}
- **Country:** ${settings.shippingOrigin.country}
${settings.shippingOrigin.phone ? `- **Phone:** ${settings.shippingOrigin.phone}` : ''}
${settings.shippingOrigin.email ? `- **Email:** ${settings.shippingOrigin.email}` : ''}

${settings.storeOrderNotification ? `**📧 Order Notifications:**
- **Status:** ${settings.storeOrderNotification.enabled ? '✅ Enabled' : '❌ Disabled'}
- **Subject Line:** "${settings.storeOrderNotification.subject}"
- **Email Template ID:** ${settings.storeOrderNotification.emailTemplateId}
- **Default Template ID:** ${settings.storeOrderNotification.defaultEmailTemplateId}` : '**📧 Order Notifications:** Not configured'}

${settings.storeOrderFulfillmentNotification ? `**📦 Fulfillment Notifications:**
- **Status:** ${settings.storeOrderFulfillmentNotification.enabled ? '✅ Enabled' : '❌ Disabled'}
- **Subject Line:** "${settings.storeOrderFulfillmentNotification.subject}"
- **Email Template ID:** ${settings.storeOrderFulfillmentNotification.emailTemplateId}
- **Default Template ID:** ${settings.storeOrderFulfillmentNotification.defaultEmailTemplateId}` : '**📦 Fulfillment Notifications:** Not configured'}

**Created:** ${new Date(settings.createdAt).toLocaleString()}
**Last Updated:** ${new Date(settings.updatedAt).toLocaleString()}

These settings control your store's shipping origin and email notification preferences.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Getting Store Settings**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }]
      };
    }
  }

  /**
   * Get all Store API tool definitions
   */
  getTools(): Tool[] {
    return [
      // Shipping Zones Tools
      {
        name: 'ghl_create_shipping_zone',
        description: 'Create a new shipping zone with specific countries and states',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Name of the shipping zone' },
            countries: {
              type: 'array',
              description: 'Array of countries with optional state restrictions',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string', description: 'Country code (e.g., US, CA)' },
                  states: {
                    type: 'array',
                    description: 'Optional array of state codes for this country',
                    items: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', description: 'State code (e.g., CA, NY)' }
                      },
                      required: ['code']
                    }
                  }
                },
                required: ['code']
              }
            }
          },
          required: ['name', 'countries']
        }
      },
      {
        name: 'ghl_list_shipping_zones',
        description: 'List all shipping zones for a location',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            limit: { type: 'number', description: 'Number of zones to return (optional)' },
            offset: { type: 'number', description: 'Number of zones to skip (optional)' },
            withShippingRate: { type: 'boolean', description: 'Include shipping rates in response (optional)' }
          }
        }
      },
      {
        name: 'ghl_get_shipping_zone',
        description: 'Get details of a specific shipping zone',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone to retrieve' },
            withShippingRate: { type: 'boolean', description: 'Include shipping rates in response (optional)' }
          },
          required: ['shippingZoneId']
        }
      },
      {
        name: 'ghl_update_shipping_zone',
        description: 'Update a shipping zone\'s name or countries',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone to update' },
            name: { type: 'string', description: 'New name for the shipping zone (optional)' },
            countries: {
              type: 'array',
              description: 'Updated array of countries with optional state restrictions (optional)',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string', description: 'Country code (e.g., US, CA)' },
                  states: {
                    type: 'array',
                    description: 'Optional array of state codes for this country',
                    items: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', description: 'State code (e.g., CA, NY)' }
                      },
                      required: ['code']
                    }
                  }
                },
                required: ['code']
              }
            }
          },
          required: ['shippingZoneId']
        }
      },
      {
        name: 'ghl_delete_shipping_zone',
        description: 'Delete a shipping zone and all its associated shipping rates',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone to delete' }
          },
          required: ['shippingZoneId']
        }
      },

      // Shipping Rates Tools (key ones)
      {
        name: 'ghl_get_available_shipping_rates',
        description: 'Get available shipping rates for an order based on destination and order details',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            country: { type: 'string', description: 'Destination country code' },
            address: {
              type: 'object',
              description: 'Shipping address details',
              properties: {
                street1: { type: 'string', description: 'Street address line 1' },
                city: { type: 'string', description: 'City' },
                country: { type: 'string', description: 'Country code' }
              },
              required: ['street1', 'city', 'country']
            },
            totalOrderAmount: { type: 'number', description: 'Total order amount' },
            totalOrderWeight: { type: 'number', description: 'Total order weight' },
            products: {
              type: 'array',
              description: 'Array of products in the order',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Product ID' },
                  quantity: { type: 'number', description: 'Product quantity' }
                },
                required: ['id', 'quantity']
              }
            }
          },
          required: ['country', 'address', 'totalOrderAmount', 'totalOrderWeight', 'products']
        }
      },
      {
        name: 'ghl_create_shipping_rate',
        description: 'Create a new shipping rate for a shipping zone',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            name: { type: 'string', description: 'Name of the shipping rate' },
            currency: { type: 'string', description: 'Currency code (e.g., USD)' },
            amount: { type: 'number', description: 'Shipping rate amount' },
            conditionType: { type: 'string', description: 'Condition type for rate calculation' }
          },
          required: ['shippingZoneId', 'name', 'currency', 'amount', 'conditionType']
        }
      },
      {
        name: 'ghl_list_shipping_rates',
        description: 'List all shipping rates for a specific shipping zone',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' }
          },
          required: ['shippingZoneId']
        }
      },
      {
        name: 'ghl_get_shipping_rate',
        description: 'Get details of a specific shipping rate',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            shippingRateId: { type: 'string', description: 'ID of the shipping rate to retrieve' }
          },
          required: ['shippingZoneId', 'shippingRateId']
        }
      },
      {
        name: 'ghl_update_shipping_rate',
        description: 'Update a shipping rate\'s properties',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            shippingRateId: { type: 'string', description: 'ID of the shipping rate to update' }
          },
          required: ['shippingZoneId', 'shippingRateId']
        }
      },
      {
        name: 'ghl_delete_shipping_rate',
        description: 'Delete a shipping rate',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingZoneId: { type: 'string', description: 'ID of the shipping zone' },
            shippingRateId: { type: 'string', description: 'ID of the shipping rate to delete' }
          },
          required: ['shippingZoneId', 'shippingRateId']
        }
      },

      // Shipping Carriers Tools
      {
        name: 'ghl_create_shipping_carrier',
        description: 'Create a new shipping carrier for dynamic rate calculation',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            name: { type: 'string', description: 'Name of the shipping carrier' },
            callbackUrl: { type: 'string', description: 'Callback URL for carrier rate requests' },
            services: {
              type: 'array',
              description: 'Array of available services',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Service name' },
                  value: { type: 'string', description: 'Service value' }
                },
                required: ['name', 'value']
              }
            }
          },
          required: ['name', 'callbackUrl', 'services']
        }
      },
      {
        name: 'ghl_list_shipping_carriers',
        description: 'List all shipping carriers for a location',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          }
        }
      },
      {
        name: 'ghl_get_shipping_carrier',
        description: 'Get details of a specific shipping carrier',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingCarrierId: { type: 'string', description: 'ID of the shipping carrier to retrieve' }
          },
          required: ['shippingCarrierId']
        }
      },
      {
        name: 'ghl_update_shipping_carrier',
        description: 'Update a shipping carrier\'s properties',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingCarrierId: { type: 'string', description: 'ID of the shipping carrier to update' }
          },
          required: ['shippingCarrierId']
        }
      },
      {
        name: 'ghl_delete_shipping_carrier',
        description: 'Delete a shipping carrier',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingCarrierId: { type: 'string', description: 'ID of the shipping carrier to delete' }
          },
          required: ['shippingCarrierId']
        }
      },

      // Store Settings Tools
      {
        name: 'ghl_create_store_setting',
        description: 'Create or update store settings including shipping origin and notifications',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' },
            shippingOrigin: {
              type: 'object',
              description: 'Shipping origin address details',
              properties: {
                name: { type: 'string', description: 'Business name' },
                street1: { type: 'string', description: 'Street address line 1' },
                city: { type: 'string', description: 'City' },
                zip: { type: 'string', description: 'Postal/ZIP code' },
                country: { type: 'string', description: 'Country code' }
              },
              required: ['name', 'street1', 'city', 'zip', 'country']
            }
          },
          required: ['shippingOrigin']
        }
      },
      {
        name: 'ghl_get_store_setting',
        description: 'Get current store settings',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL Location ID (optional, uses default if not provided)' }
          }
        }
      }
    ];
  }

  /**
   * Execute Store API tools
   */
  async executeStoreTool(toolName: string, params: any): Promise<StoreToolResult> {
    switch (toolName) {
      // Shipping Zones
      case 'ghl_create_shipping_zone':
        return this.createShippingZone(params);
      case 'ghl_list_shipping_zones':
        return this.listShippingZones(params);
      case 'ghl_get_shipping_zone':
        return this.getShippingZone(params);
      case 'ghl_update_shipping_zone':
        return this.updateShippingZone(params);
      case 'ghl_delete_shipping_zone':
        return this.deleteShippingZone(params);

      // Shipping Rates
      case 'ghl_get_available_shipping_rates':
        return this.getAvailableShippingRates(params);
      case 'ghl_create_shipping_rate':
        return this.createShippingRate(params);
      case 'ghl_list_shipping_rates':
        return this.listShippingRates(params);
      case 'ghl_get_shipping_rate':
        return this.getShippingRate(params);
      case 'ghl_update_shipping_rate':
        return this.updateShippingRate(params);
      case 'ghl_delete_shipping_rate':
        return this.deleteShippingRate(params);

      // Shipping Carriers
      case 'ghl_create_shipping_carrier':
        return this.createShippingCarrier(params);
      case 'ghl_list_shipping_carriers':
        return this.listShippingCarriers(params);
      case 'ghl_get_shipping_carrier':
        return this.getShippingCarrier(params);
      case 'ghl_update_shipping_carrier':
        return this.updateShippingCarrier(params);
      case 'ghl_delete_shipping_carrier':
        return this.deleteShippingCarrier(params);

      // Store Settings
      case 'ghl_create_store_setting':
        return this.createStoreSetting(params);
      case 'ghl_get_store_setting':
        return this.getStoreSetting(params);

      default:
        throw new Error(`Unknown Store tool: ${toolName}`);
    }
  }
} 