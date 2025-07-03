import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPGetAllObjectsParams,
  MCPCreateObjectSchemaParams,
  MCPGetObjectSchemaParams,
  MCPUpdateObjectSchemaParams,
  MCPCreateObjectRecordParams,
  MCPGetObjectRecordParams,
  MCPUpdateObjectRecordParams,
  MCPDeleteObjectRecordParams,
  MCPSearchObjectRecordsParams,
  GHLGetObjectSchemaRequest,
  GHLCreateObjectSchemaRequest,
  GHLUpdateObjectSchemaRequest,
  GHLCreateObjectRecordRequest,
  GHLUpdateObjectRecordRequest,
  GHLSearchObjectRecordsRequest
} from '../types/ghl-types.js';

/**
 * ObjectTools class for GoHighLevel Custom Objects API endpoints
 * Handles both object schema management and record operations for custom and standard objects
 */
export class ObjectTools {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return ObjectTools.getToolDefinitionsStatic();
  }

  /**
   * Get all available Custom Objects tool definitions
   */
  getToolDefinitions(): Tool[] {
    return ObjectTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      {
        name: 'get_all_objects',
        description: 'Get all objects (custom and standard) for a location including contact, opportunity, business, and custom objects',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { 
              type: 'string', 
              description: 'Location ID (uses default if not provided)'
            }
          },
          required: []
        }
      },
      {
        name: 'create_object_schema',
        description: 'Create a new custom object schema with labels, key, and primary display property',
        inputSchema: {
          type: 'object',
          properties: {
            labels: {
              type: 'object',
              description: 'Singular and plural names for the custom object',
              properties: {
                singular: { type: 'string', description: 'Singular name (e.g., "Pet")' },
                plural: { type: 'string', description: 'Plural name (e.g., "Pets")' }
              },
              required: ['singular', 'plural']
            },
            key: { 
              type: 'string', 
              description: 'Unique key for the object (e.g., "custom_objects.pet"). The "custom_objects." prefix is added automatically if not included'
            },
            description: { 
              type: 'string', 
              description: 'Description of the custom object'
            },
            locationId: { 
              type: 'string', 
              description: 'Location ID (uses default if not provided)'
            },
            primaryDisplayPropertyDetails: {
              type: 'object',
              description: 'Primary property configuration for display',
              properties: {
                key: { type: 'string', description: 'Property key (e.g., "custom_objects.pet.name")' },
                name: { type: 'string', description: 'Display name (e.g., "Pet Name")' },
                dataType: { type: 'string', description: 'Data type (TEXT or NUMERICAL)', enum: ['TEXT', 'NUMERICAL'] }
              },
              required: ['key', 'name', 'dataType']
            }
          },
          required: ['labels', 'key', 'primaryDisplayPropertyDetails']
        }
      },
      {
        name: 'get_object_schema',
        description: 'Get object schema details by key including all fields and properties for custom or standard objects',
        inputSchema: {
          type: 'object',
          properties: {
            key: { 
              type: 'string', 
              description: 'Object key (e.g., "custom_objects.pet" for custom objects, "contact" for standard objects)'
            },
            locationId: { 
              type: 'string', 
              description: 'Location ID (uses default if not provided)'
            },
            fetchProperties: { 
              type: 'boolean', 
              description: 'Whether to fetch all standard/custom fields of the object',
              default: true
            }
          },
          required: ['key']
        }
      },
      {
        name: 'update_object_schema',
        description: 'Update object schema properties including labels, description, and searchable fields',
        inputSchema: {
          type: 'object',
          properties: {
            key: { 
              type: 'string', 
              description: 'Object key to update'
            },
            labels: {
              type: 'object',
              description: 'Updated singular and plural names (optional)',
              properties: {
                singular: { type: 'string', description: 'Updated singular name' },
                plural: { type: 'string', description: 'Updated plural name' }
              }
            },
            description: { 
              type: 'string', 
              description: 'Updated description'
            },
            locationId: { 
              type: 'string', 
              description: 'Location ID (uses default if not provided)'
            },
            searchableProperties: {
              type: 'array',
              description: 'Array of field keys that should be searchable (e.g., ["custom_objects.pet.name", "custom_objects.pet.breed"])',
              items: { type: 'string' }
            }
          },
          required: ['key', 'searchableProperties']
        }
      },
      {
        name: 'create_object_record',
        description: 'Create a new record in a custom or standard object with properties, owner, and followers',
        inputSchema: {
          type: 'object',
          properties: {
            schemaKey: { 
              type: 'string', 
              description: 'Schema key of the object (e.g., "custom_objects.pet", "business")'
            },
            properties: {
              type: 'object',
              description: 'Record properties as key-value pairs (e.g., {"name": "Buddy", "breed": "Golden Retriever"})'
            },
            locationId: { 
              type: 'string', 
              description: 'Location ID (uses default if not provided)'
            },
            owner: {
              type: 'array',
              description: 'Array of user IDs who own this record (limited to 1, only for custom objects)',
              items: { type: 'string' },
              maxItems: 1
            },
            followers: {
              type: 'array',
              description: 'Array of user IDs who follow this record (limited to 10)',
              items: { type: 'string' },
              maxItems: 10
            }
          },
          required: ['schemaKey', 'properties']
        }
      },
      {
        name: 'get_object_record',
        description: 'Get a specific record by ID from a custom or standard object',
        inputSchema: {
          type: 'object',
          properties: {
            schemaKey: { 
              type: 'string', 
              description: 'Schema key of the object'
            },
            recordId: { 
              type: 'string', 
              description: 'ID of the record to retrieve'
            }
          },
          required: ['schemaKey', 'recordId']
        }
      },
      {
        name: 'update_object_record',
        description: 'Update an existing record in a custom or standard object',
        inputSchema: {
          type: 'object',
          properties: {
            schemaKey: { 
              type: 'string', 
              description: 'Schema key of the object'
            },
            recordId: { 
              type: 'string', 
              description: 'ID of the record to update'
            },
            properties: {
              type: 'object',
              description: 'Updated record properties as key-value pairs'
            },
            locationId: { 
              type: 'string', 
              description: 'Location ID (uses default if not provided)'
            },
            owner: {
              type: 'array',
              description: 'Updated array of user IDs who own this record',
              items: { type: 'string' },
              maxItems: 1
            },
            followers: {
              type: 'array',
              description: 'Updated array of user IDs who follow this record',
              items: { type: 'string' },
              maxItems: 10
            }
          },
          required: ['schemaKey', 'recordId']
        }
      },
      {
        name: 'delete_object_record',
        description: 'Delete a record from a custom or standard object',
        inputSchema: {
          type: 'object',
          properties: {
            schemaKey: { 
              type: 'string', 
              description: 'Schema key of the object'
            },
            recordId: { 
              type: 'string', 
              description: 'ID of the record to delete'
            }
          },
          required: ['schemaKey', 'recordId']
        }
      },
      {
        name: 'search_object_records',
        description: 'Search records within a custom or standard object using searchable properties',
        inputSchema: {
          type: 'object',
          properties: {
            schemaKey: { 
              type: 'string', 
              description: 'Schema key of the object to search in'
            },
            query: { 
              type: 'string', 
              description: 'Search query using searchable properties (e.g., "name:Buddy" to search for records with name Buddy)'
            },
            locationId: { 
              type: 'string', 
              description: 'Location ID (uses default if not provided)'
            },
            page: { 
              type: 'number', 
              description: 'Page number for pagination',
              default: 1,
              minimum: 1
            },
            pageLimit: { 
              type: 'number', 
              description: 'Number of records per page',
              default: 10,
              minimum: 1,
              maximum: 100
            },
            searchAfter: {
              type: 'array',
              description: 'Cursor for pagination (returned from previous search)',
              items: { type: 'string' }
            }
          },
          required: ['schemaKey', 'query']
        }
      }
    ];
  }

  /**
   * Execute an object tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_all_objects':
        return this.getAllObjects(args as MCPGetAllObjectsParams);
      
      case 'create_object_schema':
        return this.createObjectSchema(args as MCPCreateObjectSchemaParams);
      
      case 'get_object_schema':
        return this.getObjectSchema(args as MCPGetObjectSchemaParams);
      
      case 'update_object_schema':
        return this.updateObjectSchema(args as MCPUpdateObjectSchemaParams);
      
      case 'create_object_record':
        return this.createObjectRecord(args as MCPCreateObjectRecordParams);
      
      case 'get_object_record':
        return this.getObjectRecord(args as MCPGetObjectRecordParams);
      
      case 'update_object_record':
        return this.updateObjectRecord(args as MCPUpdateObjectRecordParams);
      
      case 'delete_object_record':
        return this.deleteObjectRecord(args as MCPDeleteObjectRecordParams);
      
      case 'search_object_records':
        return this.searchObjectRecords(args as MCPSearchObjectRecordsParams);
      
      default:
        throw new Error(`Unknown object tool: ${name}`);
    }
  }

  /**
   * GET ALL OBJECTS
   */
  private async getAllObjects(params: MCPGetAllObjectsParams = {}): Promise<{ success: boolean; objects: any[]; message: string }> {
    try {
      const response = await this.ghlClient.getObjectsByLocation(params.locationId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const objects = Array.isArray(response.data.objects) ? response.data.objects : [];
      
      return {
        success: true,
        objects,
        message: `Retrieved ${objects.length} objects for location`
      };
    } catch (error) {
      throw new Error(`Failed to get objects: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE OBJECT SCHEMA
   */
  private async createObjectSchema(params: MCPCreateObjectSchemaParams): Promise<{ success: boolean; object: any; message: string }> {
    try {
      const schemaData: GHLCreateObjectSchemaRequest = {
        labels: params.labels,
        key: params.key,
        description: params.description,
        locationId: params.locationId || this.ghlClient.getConfig().locationId,
        primaryDisplayPropertyDetails: params.primaryDisplayPropertyDetails
      };

      const response = await this.ghlClient.createObjectSchema(schemaData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        object: response.data.object,
        message: `Custom object schema created successfully with key: ${response.data.object.key}`
      };
    } catch (error) {
      throw new Error(`Failed to create object schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET OBJECT SCHEMA
   */
  private async getObjectSchema(params: MCPGetObjectSchemaParams): Promise<{ success: boolean; object: any; fields?: any[]; cache?: boolean; message: string }> {
    try {
      const requestParams: GHLGetObjectSchemaRequest = {
        key: params.key,
        locationId: params.locationId || this.ghlClient.getConfig().locationId,
        fetchProperties: params.fetchProperties
      };

      const response = await this.ghlClient.getObjectSchema(requestParams);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        object: response.data.object,
        fields: response.data.fields,
        cache: response.data.cache,
        message: `Object schema retrieved successfully for key: ${params.key}`
      };
    } catch (error) {
      throw new Error(`Failed to get object schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE OBJECT SCHEMA
   */
  private async updateObjectSchema(params: MCPUpdateObjectSchemaParams): Promise<{ success: boolean; object: any; message: string }> {
    try {
      const updateData: GHLUpdateObjectSchemaRequest = {
        labels: params.labels,
        description: params.description,
        locationId: params.locationId || this.ghlClient.getConfig().locationId,
        searchableProperties: params.searchableProperties
      };

      const response = await this.ghlClient.updateObjectSchema(params.key, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        object: response.data.object,
        message: `Object schema updated successfully for key: ${params.key}`
      };
    } catch (error) {
      throw new Error(`Failed to update object schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE OBJECT RECORD
   */
  private async createObjectRecord(params: MCPCreateObjectRecordParams): Promise<{ success: boolean; record: any; recordId: string; message: string }> {
    try {
      const recordData: GHLCreateObjectRecordRequest = {
        properties: params.properties,
        locationId: params.locationId || this.ghlClient.getConfig().locationId,
        owner: params.owner,
        followers: params.followers
      };

      const response = await this.ghlClient.createObjectRecord(params.schemaKey, recordData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        record: response.data.record,
        recordId: response.data.record.id,
        message: `Record created successfully in ${params.schemaKey} with ID: ${response.data.record.id}`
      };
    } catch (error) {
      throw new Error(`Failed to create object record: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET OBJECT RECORD
   */
  private async getObjectRecord(params: MCPGetObjectRecordParams): Promise<{ success: boolean; record: any; message: string }> {
    try {
      const response = await this.ghlClient.getObjectRecord(params.schemaKey, params.recordId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        record: response.data.record,
        message: `Record retrieved successfully from ${params.schemaKey}`
      };
    } catch (error) {
      throw new Error(`Failed to get object record: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE OBJECT RECORD
   */
  private async updateObjectRecord(params: MCPUpdateObjectRecordParams): Promise<{ success: boolean; record: any; message: string }> {
    try {
      const updateData: GHLUpdateObjectRecordRequest = {
        properties: params.properties,
        locationId: params.locationId || this.ghlClient.getConfig().locationId,
        owner: params.owner,
        followers: params.followers
      };

      const response = await this.ghlClient.updateObjectRecord(params.schemaKey, params.recordId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        record: response.data.record,
        message: `Record updated successfully in ${params.schemaKey}`
      };
    } catch (error) {
      throw new Error(`Failed to update object record: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE OBJECT RECORD
   */
  private async deleteObjectRecord(params: MCPDeleteObjectRecordParams): Promise<{ success: boolean; deletedId: string; message: string }> {
    try {
      const response = await this.ghlClient.deleteObjectRecord(params.schemaKey, params.recordId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        deletedId: response.data.id,
        message: `Record deleted successfully from ${params.schemaKey}`
      };
    } catch (error) {
      throw new Error(`Failed to delete object record: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * SEARCH OBJECT RECORDS
   */
  private async searchObjectRecords(params: MCPSearchObjectRecordsParams): Promise<{ success: boolean; records: any[]; total: number; message: string }> {
    try {
      const searchData: GHLSearchObjectRecordsRequest = {
        locationId: params.locationId || this.ghlClient.getConfig().locationId,
        page: params.page || 1,
        pageLimit: params.pageLimit || 10,
        query: params.query,
        searchAfter: params.searchAfter || []
      };

      const response = await this.ghlClient.searchObjectRecords(params.schemaKey, searchData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const records = Array.isArray(response.data.records) ? response.data.records : [];
      
      return {
        success: true,
        records,
        total: response.data.total,
        message: `Found ${records.length} records in ${params.schemaKey} (${response.data.total} total)`
      };
    } catch (error) {
      throw new Error(`Failed to search object records: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 