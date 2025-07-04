/**
 * GoHighLevel Contact Tools
 * Implements all contact management functionality for the MCP server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPCreateContactParams,
  MCPSearchContactsParams,
  MCPUpdateContactParams,
  MCPAddContactTagsParams,
  MCPRemoveContactTagsParams,
  // Task Management
  MCPGetContactTasksParams,
  MCPCreateContactTaskParams,
  MCPGetContactTaskParams,
  MCPUpdateContactTaskParams,
  MCPDeleteContactTaskParams,
  MCPUpdateTaskCompletionParams,
  // Note Management
  MCPGetContactNotesParams,
  MCPCreateContactNoteParams,
  MCPGetContactNoteParams,
  MCPUpdateContactNoteParams,
  MCPDeleteContactNoteParams,
  // Advanced Operations
  MCPUpsertContactParams,
  MCPGetDuplicateContactParams,
  MCPGetContactsByBusinessParams,
  MCPGetContactAppointmentsParams,
  // Bulk Operations
  MCPBulkUpdateContactTagsParams,
  MCPBulkUpdateContactBusinessParams,
  // Followers Management
  MCPAddContactFollowersParams,
  MCPRemoveContactFollowersParams,
  // Campaign Management
  MCPAddContactToCampaignParams,
  MCPRemoveContactFromCampaignParams,
  MCPRemoveContactFromAllCampaignsParams,
  // Workflow Management
  MCPAddContactToWorkflowParams,
  MCPRemoveContactFromWorkflowParams,
  GHLContact,
  GHLSearchContactsResponse,
  GHLContactTagsResponse,
  GHLTask,
  GHLNote,
  GHLAppointment,
  GHLUpsertContactResponse,
  GHLBulkTagsResponse,
  GHLBulkBusinessResponse,
  GHLFollowersResponse
} from '../types/ghl-types.js';

/**
 * Contact Tools class
 * Provides comprehensive contact management capabilities
 */
export class ContactTools {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Format response for MCP protocol
   */
  private formatResponse(data: any): any {
    // For MCP protocol, we need to return the data wrapped in content array
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }]
    };
  }

  /**
   * Get tool definitions for all contact operations
   */
  getToolDefinitions(): Tool[] {
    return [
      // Basic Contact Management
      {
        name: 'create_contact',
        description: 'Create a new contact in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            firstName: { type: 'string', description: 'Contact first name' },
            lastName: { type: 'string', description: 'Contact last name' },
            email: { type: 'string', description: 'Contact email address' },
            phone: { type: 'string', description: 'Contact phone number' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags to assign to contact' },
            source: { type: 'string', description: 'Source of the contact' }
          },
          required: ['email']
        }
      },
      {
        name: 'search_contacts',
        description: 'Search for contacts with advanced filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query string' },
            email: { type: 'string', description: 'Filter by email address' },
            phone: { type: 'string', description: 'Filter by phone number' },
            limit: { type: 'number', description: 'Maximum number of results (default: 25)' }
          }
        }
      },
      {
        name: 'get_contact',
        description: 'Get detailed information about a specific contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' }
          },
          required: ['contactId']
        }
      },
      {
        name: 'update_contact',
        description: 'Update contact information',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            firstName: { type: 'string', description: 'Contact first name' },
            lastName: { type: 'string', description: 'Contact last name' },
            email: { type: 'string', description: 'Contact email address' },
            phone: { type: 'string', description: 'Contact phone number' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags to assign to contact' }
          },
          required: ['contactId']
        }
      },
      {
        name: 'delete_contact',
        description: 'Delete a contact from GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' }
          },
          required: ['contactId']
        }
      },
      {
        name: 'add_contact_tags',
        description: 'Add tags to a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags to add' }
          },
          required: ['contactId', 'tags']
        }
      },
      {
        name: 'remove_contact_tags',
        description: 'Remove tags from a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags to remove' }
          },
          required: ['contactId', 'tags']
        }
      },

      // Task Management
      {
        name: 'get_contact_tasks',
        description: 'Get all tasks for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' }
          },
          required: ['contactId']
        }
      },
      {
        name: 'create_contact_task',
        description: 'Create a new task for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            title: { type: 'string', description: 'Task title' },
            body: { type: 'string', description: 'Task description' },
            dueDate: { type: 'string', description: 'Due date (ISO format)' },
            completed: { type: 'boolean', description: 'Task completion status' },
            assignedTo: { type: 'string', description: 'User ID to assign task to' }
          },
          required: ['contactId', 'title', 'dueDate']
        }
      },
      {
        name: 'get_contact_task',
        description: 'Get a specific task for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            taskId: { type: 'string', description: 'Task ID' }
          },
          required: ['contactId', 'taskId']
        }
      },
      {
        name: 'update_contact_task',
        description: 'Update a task for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            taskId: { type: 'string', description: 'Task ID' },
            title: { type: 'string', description: 'Task title' },
            body: { type: 'string', description: 'Task description' },
            dueDate: { type: 'string', description: 'Due date (ISO format)' },
            completed: { type: 'boolean', description: 'Task completion status' },
            assignedTo: { type: 'string', description: 'User ID to assign task to' }
          },
          required: ['contactId', 'taskId']
        }
      },
      {
        name: 'delete_contact_task',
        description: 'Delete a task for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            taskId: { type: 'string', description: 'Task ID' }
          },
          required: ['contactId', 'taskId']
        }
      },
      {
        name: 'update_task_completion',
        description: 'Update task completion status',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            taskId: { type: 'string', description: 'Task ID' },
            completed: { type: 'boolean', description: 'Completion status' }
          },
          required: ['contactId', 'taskId', 'completed']
        }
      },

      // Note Management
      {
        name: 'get_contact_notes',
        description: 'Get all notes for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' }
          },
          required: ['contactId']
        }
      },
      {
        name: 'create_contact_note',
        description: 'Create a new note for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            body: { type: 'string', description: 'Note content' },
            userId: { type: 'string', description: 'User ID creating the note' }
          },
          required: ['contactId', 'body']
        }
      },
      {
        name: 'get_contact_note',
        description: 'Get a specific note for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            noteId: { type: 'string', description: 'Note ID' }
          },
          required: ['contactId', 'noteId']
        }
      },
      {
        name: 'update_contact_note',
        description: 'Update a note for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            noteId: { type: 'string', description: 'Note ID' },
            body: { type: 'string', description: 'Note content' },
            userId: { type: 'string', description: 'User ID updating the note' }
          },
          required: ['contactId', 'noteId', 'body']
        }
      },
      {
        name: 'delete_contact_note',
        description: 'Delete a note for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            noteId: { type: 'string', description: 'Note ID' }
          },
          required: ['contactId', 'noteId']
        }
      },

      // Advanced Contact Operations
      {
        name: 'upsert_contact',
        description: 'Create or update contact based on email/phone (smart merge)',
        inputSchema: {
          type: 'object',
          properties: {
            firstName: { type: 'string', description: 'Contact first name' },
            lastName: { type: 'string', description: 'Contact last name' },
            email: { type: 'string', description: 'Contact email address' },
            phone: { type: 'string', description: 'Contact phone number' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags to assign to contact' },
            source: { type: 'string', description: 'Source of the contact' },
            assignedTo: { type: 'string', description: 'User ID to assign contact to' }
          }
        }
      },
      {
        name: 'get_duplicate_contact',
        description: 'Check for duplicate contacts by email or phone',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email to check for duplicates' },
            phone: { type: 'string', description: 'Phone to check for duplicates' }
          }
        }
      },
      {
        name: 'get_contacts_by_business',
        description: 'Get contacts associated with a specific business',
        inputSchema: {
          type: 'object',
          properties: {
            businessId: { type: 'string', description: 'Business ID' },
            limit: { type: 'number', description: 'Maximum number of results' },
            skip: { type: 'number', description: 'Number of results to skip' },
            query: { type: 'string', description: 'Search query' }
          },
          required: ['businessId']
        }
      },
      {
        name: 'get_contact_appointments',
        description: 'Get all appointments for a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' }
          },
          required: ['contactId']
        }
      },

      // Bulk Operations
      {
        name: 'bulk_update_contact_tags',
        description: 'Bulk add or remove tags from multiple contacts',
        inputSchema: {
          type: 'object',
          properties: {
            contactIds: { type: 'array', items: { type: 'string' }, description: 'Array of contact IDs' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags to add or remove' },
            operation: { type: 'string', enum: ['add', 'remove'], description: 'Operation to perform' },
            removeAllTags: { type: 'boolean', description: 'Remove all existing tags before adding new ones' }
          },
          required: ['contactIds', 'tags', 'operation']
        }
      },
      {
        name: 'bulk_update_contact_business',
        description: 'Bulk update business association for multiple contacts',
        inputSchema: {
          type: 'object',
          properties: {
            contactIds: { type: 'array', items: { type: 'string' }, description: 'Array of contact IDs' },
            businessId: { type: 'string', description: 'Business ID (null to remove from business)' }
          },
          required: ['contactIds']
        }
      },

      // Followers Management
      {
        name: 'add_contact_followers',
        description: 'Add followers to a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            followers: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to add as followers' }
          },
          required: ['contactId', 'followers']
        }
      },
      {
        name: 'remove_contact_followers',
        description: 'Remove followers from a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            followers: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to remove as followers' }
          },
          required: ['contactId', 'followers']
        }
      },

      // Campaign Management
      {
        name: 'add_contact_to_campaign',
        description: 'Add contact to a marketing campaign',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            campaignId: { type: 'string', description: 'Campaign ID' }
          },
          required: ['contactId', 'campaignId']
        }
      },
      {
        name: 'remove_contact_from_campaign',
        description: 'Remove contact from a specific campaign',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            campaignId: { type: 'string', description: 'Campaign ID' }
          },
          required: ['contactId', 'campaignId']
        }
      },
      {
        name: 'remove_contact_from_all_campaigns',
        description: 'Remove contact from all campaigns',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' }
          },
          required: ['contactId']
        }
      },

      // Workflow Management
      {
        name: 'add_contact_to_workflow',
        description: 'Add contact to a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            workflowId: { type: 'string', description: 'Workflow ID' },
            eventStartTime: { type: 'string', description: 'Event start time (ISO format)' }
          },
          required: ['contactId', 'workflowId']
        }
      },
      {
        name: 'remove_contact_from_workflow',
        description: 'Remove contact from a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            workflowId: { type: 'string', description: 'Workflow ID' },
            eventStartTime: { type: 'string', description: 'Event start time (ISO format)' }
          },
          required: ['contactId', 'workflowId']
        }
      }
    ];
  }

  /**
   * Execute a contact tool with the given parameters
   */
  async executeTool(toolName: string, params: any): Promise<any> {
    try {
      let result: any;
      
      switch (toolName) {
        // Basic Contact Management
      case 'create_contact':
          result = await this.createContact(params as MCPCreateContactParams);
          break;
        case 'search_contacts':
          result = await this.searchContacts(params as MCPSearchContactsParams);
          break;
        case 'get_contact':
          result = await this.getContact(params.contactId);
          break;
        case 'update_contact':
          result = await this.updateContact(params as MCPUpdateContactParams);
          break;
        case 'delete_contact':
          result = await this.deleteContact(params.contactId);
          break;
        case 'add_contact_tags':
          result = await this.addContactTags(params as MCPAddContactTagsParams);
          break;
        case 'remove_contact_tags':
          result = await this.removeContactTags(params as MCPRemoveContactTagsParams);
          break;

        // Task Management
        case 'get_contact_tasks':
          result = await this.getContactTasks(params as MCPGetContactTasksParams);
          break;
        case 'create_contact_task':
          result = await this.createContactTask(params as MCPCreateContactTaskParams);
          break;
        case 'get_contact_task':
          result = await this.getContactTask(params as MCPGetContactTaskParams);
          break;
        case 'update_contact_task':
          result = await this.updateContactTask(params as MCPUpdateContactTaskParams);
          break;
        case 'delete_contact_task':
          result = await this.deleteContactTask(params as MCPDeleteContactTaskParams);
          break;
        case 'update_task_completion':
          result = await this.updateTaskCompletion(params as MCPUpdateTaskCompletionParams);
          break;

        // Note Management
        case 'get_contact_notes':
          result = await this.getContactNotes(params as MCPGetContactNotesParams);
          break;
        case 'create_contact_note':
          result = await this.createContactNote(params as MCPCreateContactNoteParams);
          break;
        case 'get_contact_note':
          result = await this.getContactNote(params as MCPGetContactNoteParams);
          break;
        case 'update_contact_note':
          result = await this.updateContactNote(params as MCPUpdateContactNoteParams);
          break;
        case 'delete_contact_note':
          result = await this.deleteContactNote(params as MCPDeleteContactNoteParams);
          break;

        // Advanced Operations
        case 'upsert_contact':
          result = await this.upsertContact(params as MCPUpsertContactParams);
          break;
        case 'get_duplicate_contact':
          result = await this.getDuplicateContact(params as MCPGetDuplicateContactParams);
          break;
        case 'get_contacts_by_business':
          result = await this.getContactsByBusiness(params as MCPGetContactsByBusinessParams);
          break;
        case 'get_contact_appointments':
          result = await this.getContactAppointments(params as MCPGetContactAppointmentsParams);
          break;

        // Bulk Operations
        case 'bulk_update_contact_tags':
          result = await this.bulkUpdateContactTags(params as MCPBulkUpdateContactTagsParams);
          break;
        case 'bulk_update_contact_business':
          result = await this.bulkUpdateContactBusiness(params as MCPBulkUpdateContactBusinessParams);
          break;

        // Followers Management
        case 'add_contact_followers':
          result = await this.addContactFollowers(params as MCPAddContactFollowersParams);
          break;
        case 'remove_contact_followers':
          result = await this.removeContactFollowers(params as MCPRemoveContactFollowersParams);
          break;

        // Campaign Management
        case 'add_contact_to_campaign':
          result = await this.addContactToCampaign(params as MCPAddContactToCampaignParams);
          break;
        case 'remove_contact_from_campaign':
          result = await this.removeContactFromCampaign(params as MCPRemoveContactFromCampaignParams);
          break;
        case 'remove_contact_from_all_campaigns':
          result = await this.removeContactFromAllCampaigns(params as MCPRemoveContactFromAllCampaignsParams);
          break;

        // Workflow Management
        case 'add_contact_to_workflow':
          result = await this.addContactToWorkflow(params as MCPAddContactToWorkflowParams);
          break;
        case 'remove_contact_from_workflow':
          result = await this.removeContactFromWorkflow(params as MCPRemoveContactFromWorkflowParams);
          break;
      
      default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
      
      // Return the result wrapped in MCP format
      return this.formatResponse(result);
    } catch (error) {
      console.error(`Error executing contact tool ${toolName}:`, error);
      throw error;
    }
  }

  // Implementation methods...

  // Basic Contact Management
  private async createContact(params: MCPCreateContactParams): Promise<GHLContact> {
    const response = await this.ghlClient.createContact({
        locationId: this.ghlClient.getConfig().locationId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        tags: params.tags,
      source: params.source
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create contact');
    }

    return response.data!;
  }

  private async searchContacts(params: MCPSearchContactsParams): Promise<GHLSearchContactsResponse> {
    const response = await this.ghlClient.searchContacts({
        locationId: this.ghlClient.getConfig().locationId,
      query: params.query,
      limit: params.limit,
      filters: {
        ...(params.email && { email: params.email }),
        ...(params.phone && { phone: params.phone })
      }
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search contacts');
    }

    return response.data!;
  }

  private async getContact(contactId: string): Promise<GHLContact> {
    const response = await this.ghlClient.getContact(contactId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get contact');
    }

    return response.data!;
  }

  private async updateContact(params: MCPUpdateContactParams): Promise<GHLContact> {
    const response = await this.ghlClient.updateContact(params.contactId, {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      phone: params.phone,
      tags: params.tags
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update contact');
    }

    return response.data!;
  }

  private async deleteContact(contactId: string): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.deleteContact(contactId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete contact');
    }

    return response.data!;
  }

  private async addContactTags(params: MCPAddContactTagsParams): Promise<GHLContactTagsResponse> {
    const response = await this.ghlClient.addContactTags(params.contactId, params.tags);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add contact tags');
    }

    return response.data!;
  }

  private async removeContactTags(params: MCPRemoveContactTagsParams): Promise<GHLContactTagsResponse> {
    const response = await this.ghlClient.removeContactTags(params.contactId, params.tags);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove contact tags');
    }

    return response.data!;
  }

  // Task Management
  private async getContactTasks(params: MCPGetContactTasksParams): Promise<GHLTask[]> {
    const response = await this.ghlClient.getContactTasks(params.contactId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get contact tasks');
    }

    return response.data!;
  }

  private async createContactTask(params: MCPCreateContactTaskParams): Promise<GHLTask> {
    const response = await this.ghlClient.createContactTask(params.contactId, {
      title: params.title,
      body: params.body,
      dueDate: params.dueDate,
      completed: params.completed || false,
      assignedTo: params.assignedTo
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create contact task');
    }

    return response.data!;
  }

  private async getContactTask(params: MCPGetContactTaskParams): Promise<GHLTask> {
    const response = await this.ghlClient.getContactTask(params.contactId, params.taskId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get contact task');
    }

    return response.data!;
  }

  private async updateContactTask(params: MCPUpdateContactTaskParams): Promise<GHLTask> {
    const response = await this.ghlClient.updateContactTask(params.contactId, params.taskId, {
      title: params.title,
      body: params.body,
      dueDate: params.dueDate,
      completed: params.completed,
      assignedTo: params.assignedTo
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update contact task');
    }

    return response.data!;
  }

  private async deleteContactTask(params: MCPDeleteContactTaskParams): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.deleteContactTask(params.contactId, params.taskId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete contact task');
    }

    return response.data!;
  }

  private async updateTaskCompletion(params: MCPUpdateTaskCompletionParams): Promise<GHLTask> {
    const response = await this.ghlClient.updateTaskCompletion(params.contactId, params.taskId, params.completed);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update task completion');
    }

    return response.data!;
  }

  // Note Management
  private async getContactNotes(params: MCPGetContactNotesParams): Promise<GHLNote[]> {
    const response = await this.ghlClient.getContactNotes(params.contactId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get contact notes');
    }

    return response.data!;
  }

  private async createContactNote(params: MCPCreateContactNoteParams): Promise<GHLNote> {
    const response = await this.ghlClient.createContactNote(params.contactId, {
      body: params.body,
      userId: params.userId
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create contact note');
    }

    return response.data!;
  }

  private async getContactNote(params: MCPGetContactNoteParams): Promise<GHLNote> {
    const response = await this.ghlClient.getContactNote(params.contactId, params.noteId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get contact note');
    }

    return response.data!;
  }

  private async updateContactNote(params: MCPUpdateContactNoteParams): Promise<GHLNote> {
    const response = await this.ghlClient.updateContactNote(params.contactId, params.noteId, {
      body: params.body,
      userId: params.userId
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update contact note');
    }

    return response.data!;
  }

  private async deleteContactNote(params: MCPDeleteContactNoteParams): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.deleteContactNote(params.contactId, params.noteId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete contact note');
    }

    return response.data!;
  }

  // Advanced Operations
  private async upsertContact(params: MCPUpsertContactParams): Promise<GHLUpsertContactResponse> {
    const response = await this.ghlClient.upsertContact({
      locationId: this.ghlClient.getConfig().locationId,
      firstName: params.firstName,
      lastName: params.lastName,
      name: params.name,
      email: params.email,
      phone: params.phone,
      address1: params.address,
      city: params.city,
      state: params.state,
      country: params.country,
      postalCode: params.postalCode,
      website: params.website,
      timezone: params.timezone,
      companyName: params.companyName,
      tags: params.tags,
      customFields: params.customFields,
      source: params.source,
      assignedTo: params.assignedTo
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upsert contact');
    }

    return response.data!;
  }

  private async getDuplicateContact(params: MCPGetDuplicateContactParams): Promise<GHLContact | null> {
    const response = await this.ghlClient.getDuplicateContact(params.email, params.phone);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to check for duplicate contact');
    }

    return response.data!;
  }

  private async getContactsByBusiness(params: MCPGetContactsByBusinessParams): Promise<GHLSearchContactsResponse> {
    const response = await this.ghlClient.getContactsByBusiness(params.businessId, {
      limit: params.limit,
      skip: params.skip,
      query: params.query
    });

      if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get contacts by business');
    }

    return response.data!;
  }

  private async getContactAppointments(params: MCPGetContactAppointmentsParams): Promise<GHLAppointment[]> {
    const response = await this.ghlClient.getContactAppointments(params.contactId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get contact appointments');
    }

    return response.data!;
  }

  // Bulk Operations
  private async bulkUpdateContactTags(params: MCPBulkUpdateContactTagsParams): Promise<GHLBulkTagsResponse> {
    const response = await this.ghlClient.bulkUpdateContactTags(
      params.contactIds,
      params.tags,
      params.operation,
      params.removeAllTags
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk update contact tags');
    }

    return response.data!;
  }

  private async bulkUpdateContactBusiness(params: MCPBulkUpdateContactBusinessParams): Promise<GHLBulkBusinessResponse> {
    const response = await this.ghlClient.bulkUpdateContactBusiness(params.contactIds, params.businessId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk update contact business');
    }

    return response.data!;
  }

  // Followers Management
  private async addContactFollowers(params: MCPAddContactFollowersParams): Promise<GHLFollowersResponse> {
    const response = await this.ghlClient.addContactFollowers(params.contactId, params.followers);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add contact followers');
    }

    return response.data!;
  }

  private async removeContactFollowers(params: MCPRemoveContactFollowersParams): Promise<GHLFollowersResponse> {
    const response = await this.ghlClient.removeContactFollowers(params.contactId, params.followers);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove contact followers');
    }

    return response.data!;
  }

  // Campaign Management
  private async addContactToCampaign(params: MCPAddContactToCampaignParams): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.addContactToCampaign(params.contactId, params.campaignId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add contact to campaign');
    }

    return response.data!;
  }

  private async removeContactFromCampaign(params: MCPRemoveContactFromCampaignParams): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.removeContactFromCampaign(params.contactId, params.campaignId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove contact from campaign');
    }

    return response.data!;
  }

  private async removeContactFromAllCampaigns(params: MCPRemoveContactFromAllCampaignsParams): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.removeContactFromAllCampaigns(params.contactId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove contact from all campaigns');
    }

    return response.data!;
  }

  // Workflow Management
  private async addContactToWorkflow(params: MCPAddContactToWorkflowParams): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.addContactToWorkflow(
      params.contactId,
      params.workflowId,
      params.eventStartTime
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add contact to workflow');
    }

    return response.data!;
  }

  private async removeContactFromWorkflow(params: MCPRemoveContactFromWorkflowParams): Promise<{ succeded: boolean }> {
    const response = await this.ghlClient.removeContactFromWorkflow(
      params.contactId,
      params.workflowId,
      params.eventStartTime
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove contact from workflow');
    }

    return response.data!;
  }
} 