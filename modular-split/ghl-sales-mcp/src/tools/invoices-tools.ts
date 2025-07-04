import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  // Invoice Template Types
  CreateInvoiceTemplateDto,
  CreateInvoiceTemplateResponseDto,
  UpdateInvoiceTemplateDto,
  UpdateInvoiceTemplateResponseDto,
  DeleteInvoiceTemplateResponseDto,
  ListTemplatesResponse,
  InvoiceTemplate,
  UpdateInvoiceLateFeesConfigurationDto,
  UpdatePaymentMethodsConfigurationDto,
  
  // Invoice Schedule Types
  CreateInvoiceScheduleDto,
  CreateInvoiceScheduleResponseDto,
  UpdateInvoiceScheduleDto,
  UpdateInvoiceScheduleResponseDto,
  DeleteInvoiceScheduleResponseDto,
  ListSchedulesResponse,
  GetScheduleResponseDto,
  ScheduleInvoiceScheduleDto,
  ScheduleInvoiceScheduleResponseDto,
  AutoPaymentScheduleDto,
  AutoPaymentInvoiceScheduleResponseDto,
  CancelInvoiceScheduleDto,
  CancelInvoiceScheduleResponseDto,
  UpdateAndScheduleInvoiceScheduleResponseDto,
  
  // Invoice Types
  CreateInvoiceDto,
  CreateInvoiceResponseDto,
  UpdateInvoiceDto,
  UpdateInvoiceResponseDto,
  DeleteInvoiceResponseDto,
  GetInvoiceResponseDto,
  ListInvoicesResponseDto,
  VoidInvoiceDto,
  VoidInvoiceResponseDto,
  SendInvoiceDto,
  SendInvoicesResponseDto,
  RecordPaymentDto,
  RecordPaymentResponseDto,
  Text2PayDto,
  Text2PayInvoiceResponseDto,
  GenerateInvoiceNumberResponse,
  PatchInvoiceStatsLastViewedDto,
  
  // Estimate Types
  CreateEstimatesDto,
  EstimateResponseDto,
  UpdateEstimateDto,
  SendEstimateDto,
  CreateInvoiceFromEstimateDto,
  CreateInvoiceFromEstimateResponseDto,
  ListEstimatesResponseDto,
  EstimateIdParam,
  GenerateEstimateNumberResponse,
  EstimateTemplatesDto,
  EstimateTemplateResponseDto,
  ListEstimateTemplateResponseDto,
  AltDto
} from '../types/ghl-types.js';

export class InvoicesTools {
  private client: GHLApiClient;

  constructor(client: GHLApiClient) {
    this.client = client;
  }

  /**
   * Format response for MCP protocol
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
    return InvoicesTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return InvoicesTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      // Invoice Template Tools
      {
        name: 'create_invoice_template',
        description: 'Create a new invoice template',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            altType: { 
              type: 'string', 
              enum: ['location'], 
              default: 'location',
              description: 'Type of identifier (defaults to "location")' 
            },
            name: { type: 'string', description: 'Template name' },
            title: { type: 'string', description: 'Invoice title' },
            currency: { type: 'string', description: 'Currency code' },
            issueDate: { type: 'string', description: 'Issue date' },
            dueDate: { type: 'string', description: 'Due date' }
          },
          required: ['name']
        }
      },
      {
        name: 'list_invoice_templates',
        description: 'List all invoice templates',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            limit: { type: 'string', description: 'Number of results per page', default: '10' },
            offset: { type: 'string', description: 'Offset for pagination', default: '0' },
            status: { type: 'string', description: 'Filter by status' },
            search: { type: 'string', description: 'Search term' },
            paymentMode: { type: 'string', enum: ['default', 'live', 'test'], description: 'Payment mode' }
          },
          required: ['limit', 'offset']
        }
      },
      {
        name: 'get_invoice_template',
        description: 'Get invoice template by ID',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: { type: 'string', description: 'Template ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            }
          },
          required: ['templateId']
        }
      },
      {
        name: 'update_invoice_template',
        description: 'Update an existing invoice template',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: { type: 'string', description: 'Template ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            name: { type: 'string', description: 'Template name' },
            title: { type: 'string', description: 'Invoice title' },
            currency: { type: 'string', description: 'Currency code' }
          },
          required: ['templateId']
        }
      },
      {
        name: 'delete_invoice_template',
        description: 'Delete an invoice template',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: { type: 'string', description: 'Template ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            }
          },
          required: ['templateId']
        }
      },

      // Invoice Schedule Tools
      {
        name: 'create_invoice_schedule',
        description: 'Create a new invoice schedule',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            name: { type: 'string', description: 'Schedule name' },
            templateId: { type: 'string', description: 'Template ID' },
            contactId: { type: 'string', description: 'Contact ID' },
            frequency: { type: 'string', description: 'Schedule frequency' }
          },
          required: ['name', 'templateId', 'contactId']
        }
      },
      {
        name: 'list_invoice_schedules',
        description: 'List all invoice schedules',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            limit: { type: 'string', description: 'Number of results per page', default: '10' },
            offset: { type: 'string', description: 'Offset for pagination', default: '0' },
            status: { type: 'string', description: 'Filter by status' },
            search: { type: 'string', description: 'Search term' }
          },
          required: ['limit', 'offset']
        }
      },
      {
        name: 'get_invoice_schedule',
        description: 'Get invoice schedule by ID',
        inputSchema: {
          type: 'object',
          properties: {
            scheduleId: { type: 'string', description: 'Schedule ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            }
          },
          required: ['scheduleId']
        }
      },

      // Invoice Management Tools
      {
        name: 'create_invoice',
        description: 'Create a new invoice',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            contactId: { type: 'string', description: 'Contact ID' },
            title: { type: 'string', description: 'Invoice title' },
            currency: { type: 'string', description: 'Currency code' },
            issueDate: { type: 'string', description: 'Issue date' },
            dueDate: { type: 'string', description: 'Due date' },
            items: { type: 'array', description: 'Invoice items' }
          },
          required: ['contactId', 'title']
        }
      },
      {
        name: 'list_invoices',
        description: 'List all invoices',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            limit: { type: 'string', description: 'Number of results per page', default: '10' },
            offset: { type: 'string', description: 'Offset for pagination', default: '0' },
            status: { type: 'string', description: 'Filter by status' },
            contactId: { type: 'string', description: 'Filter by contact ID' },
            search: { type: 'string', description: 'Search term' }
          },
          required: ['limit', 'offset']
        }
      },
      {
        name: 'get_invoice',
        description: 'Get invoice by ID',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: { type: 'string', description: 'Invoice ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            }
          },
          required: ['invoiceId']
        }
      },
      {
        name: 'send_invoice',
        description: 'Send an invoice to customer',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: { type: 'string', description: 'Invoice ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            emailTo: { type: 'string', description: 'Email address to send to' },
            subject: { type: 'string', description: 'Email subject' },
            message: { type: 'string', description: 'Email message' }
          },
          required: ['invoiceId']
        }
      },

      // Estimate Tools
      {
        name: 'create_estimate',
        description: 'Create a new estimate',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            contactId: { type: 'string', description: 'Contact ID' },
            title: { type: 'string', description: 'Estimate title' },
            currency: { type: 'string', description: 'Currency code' },
            issueDate: { type: 'string', description: 'Issue date' },
            validUntil: { type: 'string', description: 'Valid until date' }
          },
          required: ['contactId', 'title']
        }
      },
      {
        name: 'list_estimates',
        description: 'List all estimates',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            limit: { type: 'string', description: 'Number of results per page', default: '10' },
            offset: { type: 'string', description: 'Offset for pagination', default: '0' },
            status: { type: 'string', enum: ['all', 'draft', 'sent', 'accepted', 'declined', 'invoiced', 'viewed'], description: 'Filter by status' },
            contactId: { type: 'string', description: 'Filter by contact ID' },
            search: { type: 'string', description: 'Search term' }
          },
          required: ['limit', 'offset']
        }
      },
      {
        name: 'send_estimate',
        description: 'Send an estimate to customer',
        inputSchema: {
          type: 'object',
          properties: {
            estimateId: { type: 'string', description: 'Estimate ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            emailTo: { type: 'string', description: 'Email address to send to' },
            subject: { type: 'string', description: 'Email subject' },
            message: { type: 'string', description: 'Email message' }
          },
          required: ['estimateId']
        }
      },
      {
        name: 'create_invoice_from_estimate',
        description: 'Create an invoice from an estimate',
        inputSchema: {
          type: 'object',
          properties: {
            estimateId: { type: 'string', description: 'Estimate ID' },
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            },
            issueDate: { type: 'string', description: 'Invoice issue date' },
            dueDate: { type: 'string', description: 'Invoice due date' }
          },
          required: ['estimateId']
        }
      },

      // Utility Tools
      {
        name: 'generate_invoice_number',
        description: 'Generate a unique invoice number',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            }
          }
        }
      },
      {
        name: 'generate_estimate_number',
        description: 'Generate a unique estimate number',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { 
              type: 'string', 
              description: 'Location ID (automatically populated from MCP headers if not provided)' 
            }
          }
        }
      }
    ];
  }

  /**
   * Execute a tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    try {
      // Auto-populate altId and altType if not provided
      const processedArgs = { ...args };
      
      // For any tool that uses altId/altType, default to location ID from client config
      if ('altId' in processedArgs || 'altType' in processedArgs) {
        if (!processedArgs.altId && this.client.getConfig().locationId) {
          processedArgs.altId = this.client.getConfig().locationId;
        }
        if (!processedArgs.altType) {
          processedArgs.altType = 'location';
        }
      }
      
      let result;
      switch (name) {
        // Invoice Template Handlers
        case 'create_invoice_template':
          result = await this.client.createInvoiceTemplate(processedArgs as CreateInvoiceTemplateDto);
          break;

        case 'list_invoice_templates':
          result = await this.client.listInvoiceTemplates(processedArgs);
          break;

        case 'get_invoice_template':
          result = await this.client.getInvoiceTemplate(processedArgs.templateId, processedArgs);
          break;

        case 'update_invoice_template':
          const { templateId: updateTemplateId, ...updateTemplateData } = processedArgs;
          result = await this.client.updateInvoiceTemplate(updateTemplateId, updateTemplateData as UpdateInvoiceTemplateDto);
          break;

        case 'delete_invoice_template':
          result = await this.client.deleteInvoiceTemplate(processedArgs.templateId, processedArgs);
          break;

        // Invoice Schedule Handlers
        case 'create_invoice_schedule':
          result = await this.client.createInvoiceSchedule(processedArgs as CreateInvoiceScheduleDto);
          break;

        case 'list_invoice_schedules':
          result = await this.client.listInvoiceSchedules(processedArgs);
          break;

        case 'get_invoice_schedule':
          result = await this.client.getInvoiceSchedule(processedArgs.scheduleId, processedArgs);
          break;

        // Invoice Management Handlers
        case 'create_invoice':
          result = await this.client.createInvoice(processedArgs as CreateInvoiceDto);
          break;

        case 'list_invoices':
          result = await this.client.listInvoices(processedArgs);
          break;

        case 'get_invoice':
          result = await this.client.getInvoice(processedArgs.invoiceId, processedArgs);
          break;

        case 'send_invoice':
          const { invoiceId: sendInvoiceId, ...sendInvoiceData } = processedArgs;
          result = await this.client.sendInvoice(sendInvoiceId, sendInvoiceData as SendInvoiceDto);
          break;

        // Estimate Handlers
        case 'create_estimate':
          result = await this.client.createEstimate(processedArgs as CreateEstimatesDto);
          break;

        case 'list_estimates':
          result = await this.client.listEstimates(processedArgs);
          break;

        case 'send_estimate':
          const { estimateId: sendEstimateId, ...sendEstimateData } = processedArgs;
          result = await this.client.sendEstimate(sendEstimateId, sendEstimateData as SendEstimateDto);
          break;

        case 'create_invoice_from_estimate':
          const { estimateId: invoiceFromEstimateId, ...invoiceFromEstimateData } = processedArgs;
          result = await this.client.createInvoiceFromEstimate(invoiceFromEstimateId, invoiceFromEstimateData as CreateInvoiceFromEstimateDto);
          break;

        // Utility Handlers
        case 'generate_invoice_number':
          result = await this.client.generateInvoiceNumber(processedArgs);
          break;

        case 'generate_estimate_number':
          result = await this.client.generateEstimateNumber(processedArgs);
          break;

        default:
          throw new Error(`Unknown invoices tool: ${name}`);
      }
      
      return this.formatResponse(result);
    } catch (error) {
      return this.formatResponse({
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
} 