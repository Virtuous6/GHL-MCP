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
            altId: { type: 'string', description: 'Location ID' },
            altType: { type: 'string', enum: ['location'], default: 'location' },
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' }
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' }
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' }
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' }
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' },
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
            altId: { type: 'string', description: 'Location ID' }
          }
        }
      },
      {
        name: 'generate_estimate_number',
        description: 'Generate a unique estimate number',
        inputSchema: {
          type: 'object',
          properties: {
            altId: { type: 'string', description: 'Location ID' }
          }
        }
      }
    ];
  }

  /**
   * Execute a tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    return this.handleToolCall(name, args);
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      // Invoice Template Handlers
      case 'create_invoice_template':
        return this.client.createInvoiceTemplate(args as CreateInvoiceTemplateDto);

      case 'list_invoice_templates':
        return this.client.listInvoiceTemplates(args);

      case 'get_invoice_template':
        return this.client.getInvoiceTemplate(args.templateId, args);

      case 'update_invoice_template':
        const { templateId: updateTemplateId, ...updateTemplateData } = args;
        return this.client.updateInvoiceTemplate(updateTemplateId, updateTemplateData as UpdateInvoiceTemplateDto);

      case 'delete_invoice_template':
        return this.client.deleteInvoiceTemplate(args.templateId, args);

      // Invoice Schedule Handlers
      case 'create_invoice_schedule':
        return this.client.createInvoiceSchedule(args as CreateInvoiceScheduleDto);

      case 'list_invoice_schedules':
        return this.client.listInvoiceSchedules(args);

      case 'get_invoice_schedule':
        return this.client.getInvoiceSchedule(args.scheduleId, args);

      // Invoice Management Handlers
      case 'create_invoice':
        return this.client.createInvoice(args as CreateInvoiceDto);

      case 'list_invoices':
        return this.client.listInvoices(args);

      case 'get_invoice':
        return this.client.getInvoice(args.invoiceId, args);

      case 'send_invoice':
        const { invoiceId: sendInvoiceId, ...sendInvoiceData } = args;
        return this.client.sendInvoice(sendInvoiceId, sendInvoiceData as SendInvoiceDto);

      // Estimate Handlers
      case 'create_estimate':
        return this.client.createEstimate(args as CreateEstimatesDto);

      case 'list_estimates':
        return this.client.listEstimates(args);

      case 'send_estimate':
        const { estimateId: sendEstimateId, ...sendEstimateData } = args;
        return this.client.sendEstimate(sendEstimateId, sendEstimateData as SendEstimateDto);

      case 'create_invoice_from_estimate':
        const { estimateId: invoiceFromEstimateId, ...invoiceFromEstimateData } = args;
        return this.client.createInvoiceFromEstimate(invoiceFromEstimateId, invoiceFromEstimateData as CreateInvoiceFromEstimateDto);

      // Utility Handlers
      case 'generate_invoice_number':
        return this.client.generateInvoiceNumber(args);

      case 'generate_estimate_number':
        return this.client.generateEstimateNumber(args);

      default:
        throw new Error(`Unknown invoices tool: ${name}`);
    }
  }
} 