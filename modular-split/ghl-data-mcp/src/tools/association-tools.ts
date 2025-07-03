import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPCreateAssociationParams,
  MCPUpdateAssociationParams,
  MCPGetAllAssociationsParams,
  MCPGetAssociationByIdParams,
  MCPGetAssociationByKeyParams,
  MCPGetAssociationByObjectKeyParams,
  MCPDeleteAssociationParams,
  MCPCreateRelationParams,
  MCPGetRelationsByRecordParams,
  MCPDeleteRelationParams
} from '../types/ghl-types.js';

export class AssociationTools {
  constructor(private apiClient: GHLApiClient) {}

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return AssociationTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return AssociationTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      // Association Management Tools
      {
        name: 'ghl_get_all_associations',
        description: 'Get all associations for a sub-account/location with pagination. Returns system-defined and user-defined associations.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            },
            skip: {
              type: 'number',
              description: 'Number of records to skip for pagination',
              default: 0
            },
            limit: {
              type: 'number',
              description: 'Maximum number of records to return (max 100)',
              default: 20
            }
          }
        }
      },
      {
        name: 'ghl_create_association',
        description: 'Create a new association that defines relationship types between entities like contacts, custom objects, and opportunities.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            },
            key: {
              type: 'string',
              description: 'Unique key for the association (e.g., "student_teacher")'
            },
            firstObjectLabel: {
              description: 'Label for the first object in the association (e.g., "student")'
            },
            firstObjectKey: {
              description: 'Key for the first object (e.g., "custom_objects.children")'
            },
            secondObjectLabel: {
              description: 'Label for the second object in the association (e.g., "teacher")'
            },
            secondObjectKey: {
              description: 'Key for the second object (e.g., "contact")'
            }
          },
          required: ['key', 'firstObjectLabel', 'firstObjectKey', 'secondObjectLabel', 'secondObjectKey']
        }
      },
      {
        name: 'ghl_get_association_by_id',
        description: 'Get a specific association by its ID. Works for both system-defined and user-defined associations.',
        inputSchema: {
          type: 'object',
          properties: {
            associationId: {
              type: 'string',
              description: 'The ID of the association to retrieve'
            }
          },
          required: ['associationId']
        }
      },
      {
        name: 'ghl_update_association',
        description: 'Update the labels of an existing association. Only user-defined associations can be updated.',
        inputSchema: {
          type: 'object',
          properties: {
            associationId: {
              type: 'string',
              description: 'The ID of the association to update'
            },
            firstObjectLabel: {
              description: 'New label for the first object in the association'
            },
            secondObjectLabel: {
              description: 'New label for the second object in the association'
            }
          },
          required: ['associationId', 'firstObjectLabel', 'secondObjectLabel']
        }
      },
      {
        name: 'ghl_delete_association',
        description: 'Delete a user-defined association. This will also delete all relations created with this association.',
        inputSchema: {
          type: 'object',
          properties: {
            associationId: {
              type: 'string',
              description: 'The ID of the association to delete'
            }
          },
          required: ['associationId']
        }
      },
      {
        name: 'ghl_get_association_by_key',
        description: 'Get an association by its key name. Useful for finding both standard and user-defined associations.',
        inputSchema: {
          type: 'object',
          properties: {
            keyName: {
              type: 'string',
              description: 'The key name of the association to retrieve'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            }
          },
          required: ['keyName']
        }
      },
      {
        name: 'ghl_get_association_by_object_key',
        description: 'Get associations by object keys like contacts, custom objects, and opportunities.',
        inputSchema: {
          type: 'object',
          properties: {
            objectKey: {
              type: 'string',
              description: 'The object key to search for (e.g., "custom_objects.car", "contact", "opportunity")'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (optional)'
            }
          },
          required: ['objectKey']
        }
      },
      // Relation Management Tools
      {
        name: 'ghl_create_relation',
        description: 'Create a relation between two entities using an existing association. Links specific records together.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            },
            associationId: {
              type: 'string',
              description: 'The ID of the association to use for this relation'
            },
            firstRecordId: {
              type: 'string',
              description: 'ID of the first record (e.g., contact ID if contact is first object in association)'
            },
            secondRecordId: {
              type: 'string',
              description: 'ID of the second record (e.g., custom object record ID if custom object is second object)'
            }
          },
          required: ['associationId', 'firstRecordId', 'secondRecordId']
        }
      },
      {
        name: 'ghl_get_relations_by_record',
        description: 'Get all relations for a specific record ID with pagination and optional filtering by association IDs.',
        inputSchema: {
          type: 'object',
          properties: {
            recordId: {
              type: 'string',
              description: 'The record ID to get relations for'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            },
            skip: {
              type: 'number',
              description: 'Number of records to skip for pagination',
              default: 0
            },
            limit: {
              type: 'number',
              description: 'Maximum number of records to return',
              default: 20
            },
            associationIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Optional array of association IDs to filter relations'
            }
          },
          required: ['recordId']
        }
      },
      {
        name: 'ghl_delete_relation',
        description: 'Delete a specific relation between two entities.',
        inputSchema: {
          type: 'object',
          properties: {
            relationId: {
              type: 'string',
              description: 'The ID of the relation to delete'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            }
          },
          required: ['relationId']
        }
      }
    ];
  }

  /**
   * Execute a tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    return this.executeAssociationTool(name, args);
  }

  async executeAssociationTool(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'ghl_get_all_associations': {
          const params: MCPGetAllAssociationsParams = args;
          const result = await this.apiClient.getAssociations({
            locationId: params.locationId || '',
            skip: params.skip || 0,
            limit: params.limit || 20
          });
          return {
            success: true,
            data: result.data,
            message: `Retrieved ${result.data?.associations?.length || 0} associations`
          };
        }

        case 'ghl_create_association': {
          const params: MCPCreateAssociationParams = args;
          const result = await this.apiClient.createAssociation({
            locationId: params.locationId || '',
            key: params.key,
            firstObjectLabel: params.firstObjectLabel,
            firstObjectKey: params.firstObjectKey,
            secondObjectLabel: params.secondObjectLabel,
            secondObjectKey: params.secondObjectKey
          });
          return {
            success: true,
            data: result.data,
            message: `Association '${params.key}' created successfully`
          };
        }

        case 'ghl_get_association_by_id': {
          const params: MCPGetAssociationByIdParams = args;
          const result = await this.apiClient.getAssociationById(params.associationId);
          return {
            success: true,
            data: result.data,
            message: `Association retrieved successfully`
          };
        }

        case 'ghl_update_association': {
          const params: MCPUpdateAssociationParams = args;
          const result = await this.apiClient.updateAssociation(params.associationId, {
            firstObjectLabel: params.firstObjectLabel,
            secondObjectLabel: params.secondObjectLabel
          });
          return {
            success: true,
            data: result.data,
            message: `Association updated successfully`
          };
        }

        case 'ghl_delete_association': {
          const params: MCPDeleteAssociationParams = args;
          const result = await this.apiClient.deleteAssociation(params.associationId);
          return {
            success: true,
            data: result.data,
            message: `Association deleted successfully`
          };
        }

        case 'ghl_get_association_by_key': {
          const params: MCPGetAssociationByKeyParams = args;
          const result = await this.apiClient.getAssociationByKey({
            keyName: params.keyName,
            locationId: params.locationId || ''
          });
          return {
            success: true,
            data: result.data,
            message: `Association with key '${params.keyName}' retrieved successfully`
          };
        }

        case 'ghl_get_association_by_object_key': {
          const params: MCPGetAssociationByObjectKeyParams = args;
          const result = await this.apiClient.getAssociationByObjectKey({
            objectKey: params.objectKey,
            locationId: params.locationId
          });
          return {
            success: true,
            data: result.data,
            message: `Association with object key '${params.objectKey}' retrieved successfully`
          };
        }

        case 'ghl_create_relation': {
          const params: MCPCreateRelationParams = args;
          const result = await this.apiClient.createRelation({
            locationId: params.locationId || '',
            associationId: params.associationId,
            firstRecordId: params.firstRecordId,
            secondRecordId: params.secondRecordId
          });
          return {
            success: true,
            data: result.data,
            message: `Relation created successfully between records`
          };
        }

        case 'ghl_get_relations_by_record': {
          const params: MCPGetRelationsByRecordParams = args;
          const result = await this.apiClient.getRelationsByRecord({
            recordId: params.recordId,
            locationId: params.locationId || '',
            skip: params.skip || 0,
            limit: params.limit || 20,
            associationIds: params.associationIds
          });
          return {
            success: true,
            data: result.data,
            message: `Retrieved ${result.data?.relations?.length || 0} relations for record`
          };
        }

        case 'ghl_delete_relation': {
          const params: MCPDeleteRelationParams = args;
          const result = await this.apiClient.deleteRelation({
            relationId: params.relationId,
            locationId: params.locationId || ''
          });
          return {
            success: true,
            data: result.data,
            message: `Relation deleted successfully`
          };
        }

        default:
          throw new Error(`Unknown association tool: ${name}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: `Failed to execute ${name}`
      };
    }
  }
} 