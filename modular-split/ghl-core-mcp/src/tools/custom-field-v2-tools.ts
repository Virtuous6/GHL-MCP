import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPV2CreateCustomFieldParams,
  MCPV2UpdateCustomFieldParams,
  MCPV2GetCustomFieldByIdParams,
  MCPV2DeleteCustomFieldParams,
  MCPV2GetCustomFieldsByObjectKeyParams,
  MCPV2CreateCustomFieldFolderParams,
  MCPV2UpdateCustomFieldFolderParams,
  MCPV2DeleteCustomFieldFolderParams
} from '../types/ghl-types.js';

export class CustomFieldV2Tools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      // Custom Field Management Tools
      {
        name: 'ghl_get_custom_field_by_id',
        description: 'Get a custom field or folder by its ID. Supports custom objects and company (business) fields.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the custom field or folder to retrieve'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'ghl_create_custom_field',
        description: 'Create a new custom field for custom objects or company (business). Supports various field types including text, number, options, date, file upload, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            },
            name: {
              type: 'string',
              description: 'Field name (optional for some field types)'
            },
            description: {
              type: 'string',
              description: 'Description of the field'
            },
            placeholder: {
              type: 'string',
              description: 'Placeholder text for the field'
            },
            showInForms: {
              type: 'boolean',
              description: 'Whether the field should be shown in forms',
              default: true
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    description: 'Key of the option'
                  },
                  label: {
                    type: 'string',
                    description: 'Label of the option'
                  },
                  url: {
                    type: 'string',
                    description: 'URL associated with the option (only for RADIO type)'
                  }
                },
                required: ['key', 'label']
              },
              description: 'Options for the field (required for SINGLE_OPTIONS, MULTIPLE_OPTIONS, RADIO, CHECKBOX, TEXTBOX_LIST types)'
            },
            acceptedFormats: {
              type: 'string',
              enum: ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.gif', '.csv', '.xlsx', '.xls', 'all'],
              description: 'Allowed file formats for uploads (only for FILE_UPLOAD type)'
            },
            dataType: {
              type: 'string',
              enum: ['TEXT', 'LARGE_TEXT', 'NUMERICAL', 'PHONE', 'MONETORY', 'CHECKBOX', 'SINGLE_OPTIONS', 'MULTIPLE_OPTIONS', 'DATE', 'TEXTBOX_LIST', 'FILE_UPLOAD', 'RADIO', 'EMAIL'],
              description: 'Type of field to create'
            },
            fieldKey: {
              type: 'string',
              description: 'Field key. Format: "custom_object.{objectKey}.{fieldKey}" for custom objects. Example: "custom_object.pet.name"'
            },
            objectKey: {
              type: 'string',
              description: 'The object key. Format: "custom_object.{objectKey}" for custom objects. Example: "custom_object.pet"'
            },
            maxFileLimit: {
              type: 'number',
              description: 'Maximum file limit for uploads (only for FILE_UPLOAD type)'
            },
            allowCustomOption: {
              type: 'boolean',
              description: 'Allow users to add custom option values for RADIO type fields'
            },
            parentId: {
              type: 'string',
              description: 'ID of the parent folder for organization'
            }
          },
          required: ['dataType', 'fieldKey', 'objectKey', 'parentId']
        }
      },
      {
        name: 'ghl_update_custom_field',
        description: 'Update an existing custom field by ID. Can modify name, description, options, and other properties.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the custom field to update'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            },
            name: {
              type: 'string',
              description: 'Updated field name'
            },
            description: {
              type: 'string',
              description: 'Updated description of the field'
            },
            placeholder: {
              type: 'string',
              description: 'Updated placeholder text for the field'
            },
            showInForms: {
              type: 'boolean',
              description: 'Whether the field should be shown in forms'
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    description: 'Key of the option'
                  },
                  label: {
                    type: 'string',
                    description: 'Label of the option'
                  },
                  url: {
                    type: 'string',
                    description: 'URL associated with the option (only for RADIO type)'
                  }
                },
                required: ['key', 'label']
              },
              description: 'Updated options (replaces all existing options - include all options you want to keep)'
            },
            acceptedFormats: {
              type: 'string',
              enum: ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.gif', '.csv', '.xlsx', '.xls', 'all'],
              description: 'Updated allowed file formats for uploads'
            },
            maxFileLimit: {
              type: 'number',
              description: 'Updated maximum file limit for uploads'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'ghl_delete_custom_field',
        description: 'Delete a custom field by ID. This will permanently remove the field and its data.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the custom field to delete'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'ghl_get_custom_fields_by_object_key',
        description: 'Get all custom fields and folders for a specific object key (e.g., custom object or company).',
        inputSchema: {
          type: 'object',
          properties: {
            objectKey: {
              type: 'string',
              description: 'Object key to get fields for. Format: "custom_object.{objectKey}" for custom objects. Example: "custom_object.pet"'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            }
          },
          required: ['objectKey']
        }
      },
      // Custom Field Folder Management Tools
      {
        name: 'ghl_create_custom_field_folder',
        description: 'Create a new custom field folder for organizing fields within an object.',
        inputSchema: {
          type: 'object',
          properties: {
            objectKey: {
              type: 'string',
              description: 'Object key for the folder. Format: "custom_object.{objectKey}" for custom objects. Example: "custom_object.pet"'
            },
            name: {
              type: 'string',
              description: 'Name of the folder'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            }
          },
          required: ['objectKey', 'name']
        }
      },
      {
        name: 'ghl_update_custom_field_folder',
        description: 'Update the name of an existing custom field folder.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the folder to update'
            },
            name: {
              type: 'string',
              description: 'New name for the folder'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            }
          },
          required: ['id', 'name']
        }
      },
      {
        name: 'ghl_delete_custom_field_folder',
        description: 'Delete a custom field folder. This will also affect any fields within the folder.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the folder to delete'
            },
            locationId: {
              type: 'string',
              description: 'GoHighLevel location ID (will use default if not provided)'
            }
          },
          required: ['id']
        }
      }
    ];
  }

  async executeCustomFieldV2Tool(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'ghl_get_custom_field_by_id': {
          const params: MCPV2GetCustomFieldByIdParams = args;
          const result = await this.apiClient.getCustomFieldV2ById(params.id);
          return {
            success: true,
            data: result.data,
            message: `Custom field/folder retrieved successfully`
          };
        }

        case 'ghl_create_custom_field': {
          const params: MCPV2CreateCustomFieldParams = args;
          const result = await this.apiClient.createCustomFieldV2({
            locationId: params.locationId || '',
            name: params.name,
            description: params.description,
            placeholder: params.placeholder,
            showInForms: params.showInForms ?? true,
            options: params.options,
            acceptedFormats: params.acceptedFormats,
            dataType: params.dataType,
            fieldKey: params.fieldKey,
            objectKey: params.objectKey,
            maxFileLimit: params.maxFileLimit,
            allowCustomOption: params.allowCustomOption,
            parentId: params.parentId
          });
          return {
            success: true,
            data: result.data,
            message: `Custom field '${params.fieldKey}' created successfully`
          };
        }

        case 'ghl_update_custom_field': {
          const params: MCPV2UpdateCustomFieldParams = args;
          const result = await this.apiClient.updateCustomFieldV2(params.id, {
            locationId: params.locationId || '',
            name: params.name,
            description: params.description,
            placeholder: params.placeholder,
            showInForms: params.showInForms ?? true,
            options: params.options,
            acceptedFormats: params.acceptedFormats,
            maxFileLimit: params.maxFileLimit
          });
          return {
            success: true,
            data: result.data,
            message: `Custom field updated successfully`
          };
        }

        case 'ghl_delete_custom_field': {
          const params: MCPV2DeleteCustomFieldParams = args;
          const result = await this.apiClient.deleteCustomFieldV2(params.id);
          return {
            success: true,
            data: result.data,
            message: `Custom field deleted successfully`
          };
        }

        case 'ghl_get_custom_fields_by_object_key': {
          const params: MCPV2GetCustomFieldsByObjectKeyParams = args;
          const result = await this.apiClient.getCustomFieldsV2ByObjectKey({
            objectKey: params.objectKey,
            locationId: params.locationId || ''
          });
          return {
            success: true,
            data: result.data,
            message: `Retrieved ${result.data?.fields?.length || 0} fields and ${result.data?.folders?.length || 0} folders for object '${params.objectKey}'`
          };
        }

        case 'ghl_create_custom_field_folder': {
          const params: MCPV2CreateCustomFieldFolderParams = args;
          const result = await this.apiClient.createCustomFieldV2Folder({
            objectKey: params.objectKey,
            name: params.name,
            locationId: params.locationId || ''
          });
          return {
            success: true,
            data: result.data,
            message: `Custom field folder '${params.name}' created successfully`
          };
        }

        case 'ghl_update_custom_field_folder': {
          const params: MCPV2UpdateCustomFieldFolderParams = args;
          const result = await this.apiClient.updateCustomFieldV2Folder(params.id, {
            name: params.name,
            locationId: params.locationId || ''
          });
          return {
            success: true,
            data: result.data,
            message: `Custom field folder updated to '${params.name}'`
          };
        }

        case 'ghl_delete_custom_field_folder': {
          const params: MCPV2DeleteCustomFieldFolderParams = args;
          const result = await this.apiClient.deleteCustomFieldV2Folder({
            id: params.id,
            locationId: params.locationId || ''
          });
          return {
            success: true,
            data: result.data,
            message: `Custom field folder deleted successfully`
          };
        }

        default:
          throw new Error(`Unknown custom field V2 tool: ${name}`);
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